"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "file_details",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        url: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        downloadStatus: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        downloadFilename: {
          type: Sequelize.STRING,
        },
        parseStatus: {
          type: Sequelize.STRING,
        },
        parseText: {
          type: Sequelize.TEXT,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn("NOW"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn("NOW"),
        },
      },
      {
        indexes: [
          {
            fields: ["status"],
          },
        ],
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("file_details");
  },
};
