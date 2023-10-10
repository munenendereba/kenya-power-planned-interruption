const Sequelize = require("sequelize");
const configDotenv = require("dotenv").config();

//configDotenv();

const dbname = process.env.DB_NAME;
const dbuser = process.env.DB_USER;
const dbpaswword = process.env.DB_PASSWORD;
const dialect = process.env.DB_DIALECT;
const dbhost = process.env.DB_HOST;
const dbport = process.env.DB_PORT;

module.exports = {
  development: {
    username: dbuser,
    password: dbpaswword,
    database: dbname,
    host: dbhost,
    port: dbport,
    dialect: dialect,
  },
};

/*
const sequelize = new Sequelize(dbname, dbuser, dbpaswword, {
  host: dbhost,
  port: dbport,
  dialect: dialect,
  define: {
    freezeTableName: true,
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

  */
//export default sequelize;
