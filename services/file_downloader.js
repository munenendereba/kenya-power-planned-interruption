import Fs from "fs";
import Https from "https";
import AppConfig from "../db/models/app_config.js";
import FileDetails from "../db/models/file_details.js";
import path from "path";

/**
 * Download a file from the given `url` into the `targetFolder`.
 *
 * @param {String} url
 * @param {String} targetFolder
 *
 * @returns {Promise<void>}
 */

let targetFolder = "";
let filename = "";
async function downloadService(url) {
  return await new Promise((resolve, reject) => {
    Https.get(url, (response) => {
      const code = response.statusCode ?? 0;

      filename = "";

      if (code >= 400) {
        return reject(new Error(response.statusMessage));
      }

      // handle redirects
      if (code > 300 && code < 400 && !!response.headers.location) {
        return resolve(downloadService(response.headers.location));
      }

      filename = decodeURI(url.split("/").pop());
      filename = filename.replace(/[/\\?%*:|"<>]/g, "");
      const targetFile = path.join(targetFolder, filename);

      // check if file exists
      if (Fs.existsSync(targetFile)) {
        console.log(`File ${filename} already exists. Skipping download.`);
        return resolve({});
      }

      //write to file
      const fileWriter = Fs.createWriteStream(targetFile);

      fileWriter.on("error", (error) => {
        console.log(
          `Error occurred while writing to file ${filename}: ${error}`
        );
        resolve({});
      });

      fileWriter.on("finish", () => {
        resolve({});
      });

      response.pipe(fileWriter);
    }).on("error", (error) => {
      reject(error);
    });
  });
}

const downloadFile = (request, response) => {
  AppConfig.findAll()
    .then((res) => {
      const appconf = JSON.parse(JSON.stringify(res));

      targetFolder = appconf[0].downloadPath;

      FileDetails.findAll({
        where: {
          downloadStatus: "pending",
        },
      })
        .then((records) => {
          records.forEach((record) => {
            record = JSON.parse(JSON.stringify(record));
            let downloadUrl = record.url;

            //when download is completed, update the status to completed
            downloadService(downloadUrl)
              .then(() => {
                console.log("Download completed:", downloadUrl);
              })
              .then(() => {
                record.downloadStatus = "completed";
                record.downloadFilename = filename;
                record.parseStatus = "pending";

                FileDetails.update(record, {
                  where: { id: record.id },
                })
                  .then((res) => {
                    console.log("Record status updated to completed.");
                  })
                  .catch((error) => {
                    console.log(
                      "Error occurred while updating status to completed: ",
                      error
                    );
                  });
              });
          });
          response.sendStatus(200);
        })
        .catch((error) => {
          console.log("Error occurred: ", error);
          response.status(400);
        });
    })
    .catch((error) => {
      console.log("error occurred: ", error);
    });
};

export default { downloadFile };
