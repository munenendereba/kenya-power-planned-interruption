import express from "express";
import bodyParser from "body-parser";
import morganBody from "morgan-body";
import { configDotenv } from "dotenv";
import regionMethods from "./controllers/region_controller.js";
import countyMethods from "./controllers/county_controller.js";
import interruptionMethods from "./controllers/interruption_controller.js";
import appConfigMethods from "./controllers/app_config_controller.js";
import fileDetailsMethods from "./controllers/file_details_controller.js";
import urlScraperMethods from "./services/url_scraper.js";
import downloadFilesMethods from "./services/file_downloader.js";
import parseFileMethods from "./services/parse_pdf.js";
import cors from "cors";

const app = express();

configDotenv();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

morganBody(app);

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.post("/region", regionMethods.createRegion);
app.get("/region", regionMethods.getRegions);
app.get("/region/:id", regionMethods.getRegionById);
app.delete("/region/:id", regionMethods.deleteRegion);
app.put("/region", regionMethods.updateRegion);

app.post("/county", countyMethods.createCounty);
app.get("/county", countyMethods.getCounties);
app.get("/county/:id", countyMethods.getCountyById);
app.delete("/county/:id", countyMethods.deleteCounty);
app.put("/county", countyMethods.updateCounty);

app.post("/interruption", interruptionMethods.createInterruption);
app.get("/interruption", interruptionMethods.getInterruptions);
app.get("/interruption/:id", interruptionMethods.getInterruptionById);
app.delete("/interruption/:id", interruptionMethods.deleteInterruption);
app.put("/interruption", interruptionMethods.updateInterruption);
app.get(
  "/interruption/search/:location",
  interruptionMethods.searchInterruption
);

app.get("/app-config", appConfigMethods.getAppConfig);
app.delete("/app-config", appConfigMethods.deleteAppConfig);
app.put("/app-config", appConfigMethods.updateAppConfig);

app.post("/file-details", fileDetailsMethods.createFileDetails);
app.get("/file-details", fileDetailsMethods.getFileDetailss);
app.get("/file-details/:id", fileDetailsMethods.getFileDetailsById);
app.delete("/file-details/:id", fileDetailsMethods.deleteFileDetails);
app.put("/file-details", fileDetailsMethods.updateFileDetails);

app.post("/get-upload-files", urlScraperMethods.uploadFileNames);
app.post("/download-files", downloadFilesMethods.downloadFile);
app.post("/parse-files", parseFileMethods.parseInterruptionsPdf);

const SERVER_PORT = process.env.SERVER_PORT || 4000;

app.listen(SERVER_PORT, () => {
  console.log("Listening on port: ", SERVER_PORT);
});
