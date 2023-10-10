import { error } from "console";
import Region from "../db/models/region.js";

const createRegion = (request, response) => {
  const newRegion = request.body;

  Region.create(newRegion)
    .then((res) => {
      response.sendStatus(201);
    })
    .catch((error) => {
      response.status(400).send("There's a problem with the request.");
      console.log("Failed to create the region: ", error);
    });
};

const getRegions = (request, response) => {
  Region.findAll()
    .then((res) => {
      res.length === 0
        ? response.status(404).send("Region not found!")
        : response.status(200).send(res);
    })
    .catch((error) => {
      res.sendStatus(500);
      console.log("Error retrieving regions: ", error);
    });
};

const getRegionById = (request, response) => {
  Region.findByPk(request.params.id)
    .then((res) => {
      res
        ? response.status(200).send(res)
        : response.status(404).send("Region not found!");
    })
    .catch((error) => {
      response.status(500).send("Error retrieving region.");
      console.log("Error retrieiving region: ", error);
    });
};

const deleteRegion = (request, response) => {
  Region.destroy({
    where: {
      id: request.params.id,
    },
  })
    .then((res) => {
      res === 0
        ? response.status(404).send("Region not found!")
        : response.sendStatus(200);
    })
    .catch(() => {
      response.status(500).send("Could not delete a region.");
      console.log("Could not delete a region: ", error);
    });
};

const updateRegion = (request, response) => {
  Region.update(request.body, {
    where: {
      id: request.body.id,
    },
  })
    .then((res) => {
      console.log("the res is: ", res);
      res[0] === 0
        ? response.status(404).send("Region not found!")
        : response.sendStatus(200);
    })
    .catch((error) => {
      response.status(500).send("Could not update the region.");
      console.log("Could not update the region: ", error);
    });
};

export default {
  createRegion,
  getRegions,
  getRegionById,
  deleteRegion,
  updateRegion,
};
