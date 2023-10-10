import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";

const FileDetails = sequelize.define(
  "file_details",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    url: {
      type: DataTypes.STRING,
      unique: true,
    },
    type: DataTypes.STRING,
    downloadStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    downloadFilename: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parseStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parseText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    indexes: [
      {
        fields: ["downloadStatus"],
      },
    ],
  }
);

export default FileDetails;
