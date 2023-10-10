import { Sequelize } from "sequelize";
import { configDotenv } from "dotenv";

configDotenv();

const dbname = process.env.DB_NAME;
const dbuser = process.env.DB_USER;
const dbpaswword = process.env.DB_PASSWORD;
const dialect = process.env.DB_DIALECT;
const dbhost = process.env.DB_HOST;
const dbport = process.env.DB_PORT;

const sequelize = new Sequelize(dbname, dbuser, dbpaswword, {
  host: dbhost,
  port: dbport,
  dialect: dialect,
  define: {
    freezeTableName: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    connectTimeout: 60000,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database: ", error);
  });

export default sequelize;
