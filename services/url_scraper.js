import { load } from "cheerio";
import AppConfig from "../db/models/app_config.js";
import FileDetails from "../db/models/file_details.js";

const getAllPdfs = async function (url) {
  try {
    const response = await fetch(url);
    const body = await response.text();

    const $ = load(body);
    const pdfList = [];

    $(".genericintro > .intro > li > a").each((index, element) => {
      const outVal = $(element).attr("href");

      //only include valid href not those with parse errors such as inner html tag in href
      if (outVal.indexOf("<") === -1) {
        pdfList.push(outVal);
      }
    });

    return pdfList;
  } catch (error) {
    return error;
  }
};

const uploadFileNames = (request, response) => {
  AppConfig.findAll()
    .then((res) => {
      const appconf = JSON.parse(JSON.stringify(res));

      const remoteUrl = appconf[0].remoteUrl;
      const allPdfs = [];
      getAllPdfs(remoteUrl).then((pdfUrls) => {
        pdfUrls.forEach((pdf) => {
          const fileDetails = {
            url: pdf,
            type: "pdf",
            downloadStatus: "pending",
          };
          allPdfs.push(fileDetails);
        });

        FileDetails.bulkCreate(allPdfs, { ignoreDuplicates: true })
          .then((res) => {
            response.sendStatus(200);
          })
          .catch((error) => {
            console.log("error occurred: ", error);
          });
      });
    })
    .catch((error) => {
      console.log("error occurred: ", error);
    });
};

export default { uploadFileNames };
