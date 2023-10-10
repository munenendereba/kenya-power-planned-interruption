"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("app_config", {
      id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      remoteUrl: {
        type: Sequelize.STRING,
      },
      downloadPath: {
        type: Sequelize.STRING,
      },
      twitterAccount: {
        type: Sequelize.STRING,
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
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("app_config");
  },
};
