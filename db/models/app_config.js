import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";

const AppConfig = sequelize.define("app_config", {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  remoteUrl: DataTypes.STRING,
  downloadPath: DataTypes.STRING,
  twitterAccount: DataTypes.STRING,
});

export default AppConfig;
