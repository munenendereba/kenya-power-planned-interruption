import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";

const County = sequelize.define("county", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  headquarters: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  region: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
});

export default County;
