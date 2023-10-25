import PDFParser from "pdf2json";
import AppConfig from "../db/models/app_config.js";
import FileDetails from "../db/models/file_details.js";
import path from "path";
import Interruption from "../db/models/interruption.js";
import { time } from "console";

/**
 * Parses a PDF file and extracts information about power outages in different regions and counties.
 * @param {string} pdf_file - The path to the PDF file to parse.
 * @returns {Promise<Array>} - A promise that resolves to an array of objects containing information about power outages.
 */
function parse_pdf(pdf_file) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(this, 1);

    pdfParser.on("pdfParser_dataError", (errData) => {
      reject(
        `Error parsing PDF file '${pdf_file}' at line ${errData.parserError.line}: ${errData.parserError}`
      );
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      const textContent = pdfParser.getRawTextContent();
      const lines = textContent.split("\n");
      const areas = [];

      //we want to add the missing county because the pdf does not include NAIROBI COUNTY after the line that has NAIROBI REGION
      const indexNairobiRegion = lines.indexOf("NAIROBI REGION \r");
      if (indexNairobiRegion !== -1) {
        lines.splice(indexNairobiRegion + 1, 0, "PARTS OF NAIROBI COUNTY \r");
      }

      const wordsToIgnore = [
        "Kenya Power",
        "kplc.co.ke",
        "notice",
        "interruption",
        "power",
        "supply",
        "electricity",
        "electric",
        "information",
        "---------------",
      ];

      const numLines = lines.length;

      for (let i = 0; i < numLines; i++) {
        const line = lines[i].replace("\r", "").trim();

        // we are checking for region
        if (line.includes("REGION")) {
          const regionName = line;

          for (let j = i + 1; j < lines.length; j++) {
            i = j - 1; //progress the counter

            const nextLine = lines[j];

            //we will accummulate counties until we get to the next region or the end of the file

            if (nextLine.includes("REGION")) {
              break;
            }

            //we get the previous line to check if it is NAIROBI REGION and default NAIROBI COUNTY
            //const previousRegionLine = lines[j - 1];

            if (nextLine.includes("COUNTY")) {
              const countyName = nextLine.replace("PARTS OF ", "").trim();

              //we want to get all the areas in the county
              for (let k = j + 1; k < lines.length; k++) {
                j = k - 1; //progress the counter

                const nextCountyLine = lines[k].replace("\r", "").trim();
                const area = {};

                if (
                  nextCountyLine.includes("COUNTY") ||
                  nextCountyLine.includes("REGION")
                ) {
                  break;
                }

                if (nextCountyLine.includes("AREA")) {
                  const areaName = nextCountyLine.replace("AREA:", "").trim();
                  area.area = areaName;

                  let locations = "";
                  for (let l = k + 1; l < lines.length; l++) {
                    k = l - 1; //progress the counter

                    //text includes unicode char 2013 which is not a normal dash, replace with normal dash
                    const nextAreaLine = lines[l]
                      .replace("\r", "")
                      .trim()
                      .replace(/–/g, "-");

                    if (
                      nextAreaLine.includes("COUNTY") ||
                      nextAreaLine.includes("REGION") ||
                      nextAreaLine.includes("AREA")
                    ) {
                      break;
                    }

                    //clean up the content so that we remove lines we don't need
                    let ignoreWord =
                      nextAreaLine.trim() === "" ||
                      wordsToIgnore.some((word) =>
                        nextAreaLine.toLowerCase().includes(word)
                      );

                    //if the word is in ignore list, we ignore
                    if (ignoreWord === true) {
                      continue;
                    }

                    //some lines don't have DATE:, just DATE , hence the extra check
                    if (
                      (nextAreaLine.includes("DATE") ||
                        nextAreaLine.includes("DATE ")) &&
                      nextAreaLine.includes("TIME")
                    ) {
                      const { date, startTime, endTime } =
                        parseDateTime(nextAreaLine);

                      //lines that dont have date and time are ignored
                      if (startTime === "" || date === "") {
                        continue;
                      }

                      area.date = date;
                      area.startTime = startTime;
                      area.endTime = endTime;
                    } else {
                      locations += ` ${nextAreaLine}`;
                    }
                  }

                  locations = locations.replace(/\s+/g, " ").trim(); //clean extra spaces

                  area.locations = locations;
                  area.county = countyName;
                  area.region = regionName;

                  areas.push(area);
                }
              }
            }
          }
        }
      }

      resolve(areas);
    });

    pdfParser.loadPDF(pdf_file);
  });
}

/**
 * Parses PDF files and updates the interruptions table in the database with the parsed data.
 * @param {Object} request - The HTTP request object.
 * @param {Object} response - The HTTP response object.
 */
const parseInterruptionsPdf = async (request, response) => {
  try {
    //get the folder where the files are downloaded
    const appConfig = await AppConfig.findOne({
      where: {
        id: 1,
      },
    });

    const targetFolder = appConfig.downloadPath;

    //get all the unparsed files
    const pendingFiles = await FileDetails.findAll({
      where: {
        parseStatus: "pending",
      },
    });

    for (const pendingFile of pendingFiles) {
      const downloadFilename = pendingFile.downloadFilename;
      const parseFilename = path.join(targetFolder, downloadFilename);

      const areas = await parse_pdf(parseFilename);

      pendingFile.parseStatus = "completed";
      pendingFile.parseText = JSON.stringify(areas);

      for (let area of areas) {
        const newInterruption = {
          date: area.date,
          startTime: area.startTime,
          endTime: area.endTime,
          locations: area.locations,
          area: area.area,
          county: area.county,
          region: area.region,
        };

        console.log("area:", area);

        await Interruption.create(newInterruption);
      }

      await pendingFile.save();
    }

    response.sendStatus(200);
  } catch (error) {
    console.log("Error while parsing pdf:", error);
    response.sendStatus(500);
  }
};

/**
 * Converts a 12-hour time format to a 24-hour time format.
 * @param {string} time - The time to convert in the format "hh.mm A.M./P.M."
 * @returns {string} The time in 24-hour format in the format "hh:mm"
 */
function convert12to24hour(time) {
  let timeParts = time.split(" ");
  let timeHour = parseInt(timeParts[0].split(".")[0]);
  let timeMinute = parseInt(timeParts[0].split(".")[1]);
  let timeMeridian = timeParts[1];
  if (timeMeridian === "P.M." && timeHour !== 12) {
    timeHour += 12;
  } else if (timeMeridian === "A.M." && timeHour === 12) {
    timeHour = 0;
  }
  let time24hour = `${timeHour.toString().padStart(2, "0")}:${timeMinute
    .toString()
    .padStart(2, "0")}`;

  return time24hour;
}

function parseDateTime(nextAreaLine) {
  let startTime = "";
  let endTime = "";
  let date = "";

  nextAreaLine = nextAreaLine
    .replace("DATE:", "DATE")
    .replace("TIME:", "TIME")
    .trim();

  try {
    date = nextAreaLine
      .split("TIME")[0]
      .replace("DATE", "")
      .trim()
      .split(" ")[1]
      .replace(".", "");

    date = date.slice(4) + "-" + date.slice(2, 4) + "-" + date.slice(0, 2);

    date = new Date(date).toISOString().slice(0, 10);

    const timeParts = nextAreaLine.split("TIME")[1].trim().split("-");

    startTime = convert12to24hour(timeParts[0].trim());

    if (timeParts.length > 1) {
      endTime = timeParts[1].trim();
    } else {
      endTime = "5.00 P.M."; //default end time
    }

    endTime = convert12to24hour(endTime);
  } catch (error) {
    console.log(
      "Error occurred while parsing date and time: ",
      error,
      " on line:",
      nextAreaLine
    );
  }

  return { date, startTime, endTime };
}

export default { parseInterruptionsPdf };
