"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("file_details", "downloadFilename", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("file_details", "parseStatus", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("file_details", "parseText", {
      type: Sequelize.TEXT,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("file_details", "downloadFilename");
    await queryInterface.removeColumn("file_details", "parseStatus");
    await queryInterface.removeColumn("file_details", "parseText");
  },
};
