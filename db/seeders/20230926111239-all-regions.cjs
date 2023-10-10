"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("region", [
      {
        id: 1,
        name: "Central Rift",
      },
      {
        id: 2,
        name: "North Rift",
      },
      {
        id: 3,
        name: "Mt. Kenya",
      },
      {
        id: 4,
        name: "North Eastern",
      },
      {
        id: 5,
        name: "Coast",
      },
      {
        id: 6,
        name: "South Nyanza",
      },
      {
        id: 7,
        name: "Nairobi",
      },
      {
        id: 8,
        name: "Western",
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("region", null, {});
  },
};
