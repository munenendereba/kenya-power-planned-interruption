import { error } from "console";
import County from "../db/models/county.js";

const createCounty = (request, response) => {
  const newCounty = request.body;

  County.create(newCounty)
    .then((res) => {
      response.sendStatus(201);
    })
    .catch((error) => {
      response.status(400).send("There's a problem with the request.");
      console.log("Failed to create the county: ", error);
    });
};

const getCounties = (request, response) => {
  County.findAll()
    .then((res) => {
      response.status(200).send(res);
    })
    .catch((error) => {
      res.sendStatus(500);
      console.log("Error retrieving counties: ", error);
    });
};

const getCountyById = (request, response) => {
  County.findByPk(request.params.id)
    .then((res) => {
      res
        ? response.status(200).send(res)
        : response.status(404).send("County not found!");
    })
    .catch((error) => {
      response.status(500).send("Error retrieving county.");
      console.log("Error retrieiving county: ", error);
    });
};

const deleteCounty = (request, response) => {
  County.destroy({
    where: {
      id: request.params.id,
    },
  })
    .then((res) => {
      res === 0
        ? response.status(404).send("County not found!")
        : response.sendStatus(200);
    })
    .catch(() => {
      response.status(500).send("Could not delete a county.");
      console.log("Could not delete a county: ", error);
    });
};

const updateCounty = (request, response) => {
  County.update(request.body, {
    where: {
      id: request.body.id,
    },
  })
    .then((res) => {
      console.log("the res is: ", res);
      res[0] === 0
        ? response.status(404).send("County not found!")
        : response.sendStatus(200);
    })
    .catch((error) => {
      response.status(500).send("Could not update the county.");
      console.log("Could not update the county: ", error);
    });
};

export default {
  createCounty,
  getCounties,
  getCountyById,
  deleteCounty,
  updateCounty,
};
