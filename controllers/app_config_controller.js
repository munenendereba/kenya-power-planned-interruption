import AppConfig from "../db/models/app_config.js";

//there's no create config because it is initiated by the seeders, then a user updates
//there will only ever be one record.

const getAppConfig = (request, response) => {
  AppConfig.findOne({
    where: {
      id: 1,
    },
  })
    .then((res) => {
      res.length === 0
        ? response.status(404).send("AppConfig not found!")
        : response.status(200).send(res);
    })
    .catch((err) => {
      response.status(500);
      console.log("Error retrieving appConfigs: ", err);
    });
};

const deleteAppConfig = (request, response) => {
  AppConfig.destroy({
    where: {
      id: 1,
    },
  })
    .then((res) => {
      res === 0
        ? response.status(404).send("AppConfig not found!")
        : response.sendStatus(200);
    })
    .catch(() => {
      response.status(500).send("Could not delete a appConfig.");
      console.log("Could not delete a appConfig: ", error);
    });
};

const updateAppConfig = (request, response) => {
  AppConfig.update(request.body, {
    where: {
      id: 1,
    },
  })
    .then((res) => {
      console.log("the res is: ", res);
      res[0] === 0
        ? response.status(404).send("AppConfig not found!")
        : response.sendStatus(200);
    })
    .catch((err) => {
      response.status(500).send("Could not update the appConfig.");
      console.log("Could not update the appConfig: ", err);
    });
};

export default {
  getAppConfig,
  deleteAppConfig,
  updateAppConfig,
};
