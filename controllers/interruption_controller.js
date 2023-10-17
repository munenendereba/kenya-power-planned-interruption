import { error } from "console";
import Interruption from "../db/models/interruption.js";
import sequelize from "../db/config/connection.js";
import { QueryTypes } from "sequelize";

const createInterruption = (request, response) => {
  const newInterruption = request.body;

  Interruption.create(newInterruption)
    .then((res) => {
      response.sendStatus(201);
    })
    .catch((error) => {
      response.status(400).send("There's a problem with the request.");
      console.log("Failed to create the interruption: ", error);
    });
};

const getInterruptions = (request, response) => {
  Interruption.findAll()
    .then((res) => {
      res.length === 0
        ? response.status(404).send("Interruption not found!")
        : response.status(200).send(res);
    })
    .catch((error) => {
      res.sendStatus(500);
      console.log("Error retrieving interruptions: ", error);
    });
};

const getInterruptionById = (request, response) => {
  Interruption.findByPk(request.params.id)
    .then((res) => {
      res
        ? response.status(200).send(res)
        : response.status(404).send("Interruption not found!");
    })
    .catch((error) => {
      response.status(500).send("Error retrieving interruption.");
      console.log("Error retrieiving interruption: ", error);
    });
};

const deleteInterruption = (request, response) => {
  Interruption.destroy({
    where: {
      id: request.params.id,
    },
  })
    .then((res) => {
      res === 0
        ? response.status(404).send("Interruption not found!")
        : response.sendStatus(200);
    })
    .catch(() => {
      response.status(500).send("Could not delete a interruption.");
      console.log("Could not delete a interruption: ", error);
    });
};

const updateInterruption = (request, response) => {
  Interruption.update(request.body, {
    where: {
      id: request.body.id,
    },
  })
    .then((res) => {
      res[0] === 0
        ? response.status(404).send("Interruption not found!")
        : response.sendStatus(200);
    })
    .catch((error) => {
      response.status(500).send("Could not update the interruption.");
      console.log("Could not update the interruption: ", error);
    });
};

async function searchInterruption(request, response) {
  const searchTerm = request.params.location;

  await sequelize
    .query("SELECT * FROM `interruption` WHERE locations LIKE :search", {
      replacements: { search: "%" + searchTerm + "%" },
      type: QueryTypes.SELECT,
    })
    .then((res) => {
      res
        ? response.status(200).send(res)
        : response.status(404).send("Location not found!");
    })
    .catch((error) => {
      response.sendStatus(500);
      console.log("Error retrieiving interruption: ", error);
    });
}

export default {
  createInterruption,
  getInterruptions,
  getInterruptionById,
  deleteInterruption,
  updateInterruption,
  searchInterruption,
};
