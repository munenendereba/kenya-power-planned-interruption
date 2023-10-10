import { error } from "console";
import FileDetails from "../db/models/file_details.js";

const createFileDetails = (request, response) => {
  const newFileDetails = request.body;

  FileDetails.create(newFileDetails)
    .then((res) => {
      response.sendStatus(201);
    })
    .catch((error) => {
      response.status(400).send("There's a problem with the request.");
      console.log("Failed to create the fileDetails: ", error);
    });
};

const getFileDetailss = (request, response) => {
  FileDetails.findAll()
    .then((res) => {
      res.length === 0
        ? response.status(404).send("FileDetails not found!")
        : response.status(200).send(res);
    })
    .catch((error) => {
      response.sendStatus(500);
      console.log("Error retrieving fileDetailss: ", error);
    });
};

const getFileDetailsById = (request, response) => {
  FileDetails.findByPk(request.params.id)
    .then((res) => {
      res
        ? response.status(200).send(res)
        : response.status(404).send("FileDetails not found!");
    })
    .catch((error) => {
      response.status(500).send("Error retrieving fileDetails.");
      console.log("Error retrieiving fileDetails: ", error);
    });
};

const deleteFileDetails = (request, response) => {
  FileDetails.destroy({
    where: {
      id: request.params.id,
    },
  })
    .then((res) => {
      res === 0
        ? response.status(404).send("FileDetails not found!")
        : response.sendStatus(200);
    })
    .catch(() => {
      response.status(500).send("Could not delete a fileDetails.");
      console.log("Could not delete a fileDetails: ", error);
    });
};

const updateFileDetails = (request, response) => {
  FileDetails.update(request.body, {
    where: {
      id: request.body.id,
    },
  })
    .then((res) => {
      console.log("the res is: ", res);
      res[0] === 0
        ? response.status(404).send("FileDetails not found!")
        : response.sendStatus(200);
    })
    .catch((error) => {
      response.status(500).send("Could not update the fileDetails.");
      console.log("Could not update the fileDetails: ", error);
    });
};

export default {
  createFileDetails,
  getFileDetailss,
  getFileDetailsById,
  deleteFileDetails,
  updateFileDetails,
};
