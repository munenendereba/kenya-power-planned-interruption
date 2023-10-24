import Fs from "fs";
import Https from "https";
import AppConfig from "../db/models/app_config.js";
import FileDetails from "../db/models/file_details.js";
import path from "path";

const promisifiedHttpsGet = function (url) {
  return new Promise((resolve, reject) => {
    Https.get(url, (response) => {
      resolve(response);
    });
  });
};

/**
 * Download a file from the given `url` into the `targetFolder`.
 *
 * @param {String} url
 * @param {String} targetFolder
 *
 * @returns {Promise<void>}
 */

function downloadService(url, targetFolder) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await promisifiedHttpsGet(url);
      const code = response.statusCode ?? 0;

      let filename = "";

      if (code >= 400) {
        return reject(new Error(response.statusMessage));
      }

      // handle redirects
      if (code > 300 && !!response.headers.location) {
        return resolve(
          await downloadService(response.headers.location, targetFolder)
        );
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
        reject(error);
      });

      fileWriter.on("finish", () => {
        resolve({ filename });
      });

      response.pipe(fileWriter);
    } catch (error) {
      reject(error);
    }
  });
}

const downloadFile = async (request, response) => {
  try {
    const appConf = await AppConfig.findOne({
      where: {
        id: 1,
      },
    });

    const targetFolder = appConf.downloadPath;
    const records = await FileDetails.findAll({
      where: {
        downloadStatus: "pending",
      },
    });

    for (const record of records) {
      const downloadUrl = record.url;

      //when download is completed, update the status to completed
      const result = await downloadService(downloadUrl, targetFolder);
      if (!result.filename) {
        continue;
      }

      record.downloadStatus = "completed";
      record.downloadFilename = result.filename;
      record.parseStatus = "pending";
      await record.save();

      console.log("File downloaded and record status updated to completed.");
    }

    response.sendStatus(200);
  } catch (error) {
    console.log("Error occurred: ", error);
    response.status(400);
  }
};

export default { downloadFile };
