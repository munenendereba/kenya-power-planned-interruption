import sequelize from "../config/connection.js";
import { Sequelize, DataTypes } from "sequelize";

const Region = sequelize.define("region", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
});

export default Region;
