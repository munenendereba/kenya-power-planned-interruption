import PDFParser from "pdf2json";
import AppConfig from "../db/models/app_config.js";
import FileDetails from "../db/models/file_details.js";
import path from "path";
import Interruption from "../db/models/interruption.js";

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
      const regions = [];

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
        const counties = [];

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

              const areas = [];
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

                    if (nextAreaLine.includes("DATE:")) {
                      let startTime = "";
                      let endTime = "";
                      let date = "";

                      if (nextAreaLine.includes("TIME:") === true) {
                        date = nextAreaLine
                          .split("TIME:")[0]
                          .replace("DATE:", "")
                          .trim()
                          .split(" ")[1]
                          .replace(".", "");

                        date =
                          date.slice(4) +
                          "-" +
                          date.slice(2, 4) +
                          "-" +
                          date.slice(0, 2);

                        date = new Date(date).toISOString().slice(0, 10);

                        const timeParts = nextAreaLine
                          .split("TIME:")[1]
                          .trim()
                          .split("-");

                        startTime = convert12to24hour(timeParts[0].trim());

                        endTime =
                          timeParts.length > 1
                            ? convert12to24hour(timeParts[1].trim())
                            : "";
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

                  areas.push(area);
                }
              }

              const countyAreas = { areas: areas };
              const newCounty = { [countyName]: countyAreas };

              counties.push(newCounty); //add the county
            }
          }

          const regionCounties = { counties: counties };
          const newRegion = {
            [regionName]: JSON.stringify(regionCounties),
          };

          regions.push(newRegion); //add the region
        }
      }

      resolve(regions);
    });

    pdfParser.loadPDF(pdf_file);
  });
}

/**
 * Parses PDF files and updates the interruptions table in the database with the parsed data.
 * @param {Object} request - The HTTP request object.
 * @param {Object} response - The HTTP response object.
 */
const pdfParse = (request, response) => {
  AppConfig.findAll()
    .then((res) => {
      const appconf = JSON.parse(JSON.stringify(res));

      const targetFolder = appconf[0].downloadPath;

      FileDetails.findAll({
        where: {
          parseStatus: "pending",
        },
      })
        .then((files) => {
          files.forEach((file) => {
            file = JSON.parse(JSON.stringify(file));
            const downloadFilename = file.downloadFilename;
            const parseFilename = path.join(targetFolder, downloadFilename);

            parse_pdf(parseFilename)
              .then((regions) => {
                file.parseStatus = "completed";
                file.parseText = JSON.stringify(regions);

                //update the interruptions table
                regions.forEach((region) => {
                  let regionName = Object.keys(region)[0];

                  let regionCounties = JSON.parse(region[regionName]).counties;

                  for (let county in regionCounties) {
                    let countyName = Object.keys(regionCounties[county])[0];

                    const countyAreas =
                      regionCounties[county][countyName].areas;

                    for (let area of countyAreas) {
                      const newInterruption = {
                        date: area.date,
                        startTime: area.startTime,
                        endTime: area.endTime,
                        locations: area.locations,
                        area: area.area,
                        county: countyName,
                        region: regionName,
                      };

                      Interruption.create(newInterruption)
                        .then((res) => {})
                        .catch((error) => {
                          console.log(
                            "Error occurred while adding interruption to database: ",
                            error
                          );
                        });
                    }
                  }
                });

                FileDetails.update(file, {
                  where: { id: file.id },
                })
                  .then((res) => {})
                  .catch((error) => {
                    console.log(
                      "Error occurred while updating parse status to completed: ",
                      error
                    );
                  });
              })
              .catch((error) => {
                console.log(
                  "Error occurred while parsing file: ",
                  parseFilename,
                  error
                );
              });
          });
          response.sendStatus(200);
        })
        .catch((error) => {
          console.log("Error occurred while getting records to parse: ", error);
          response.sendStatus(500);
        });
    })
    .catch((error) => {
      console.log("Error occurred while getting app config: ", error);
      response.sendStatus(500);
    });
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

export default { pdfParse };
