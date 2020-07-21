const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

module.exports = function () {
  const app = express();
  const client = require("./mongoDB")();

  app.use(cors());
  app.use(bodyParser.json());

  app.options("*", cors());

  require("../apis/serverIndex")(app);
  require("../apis/retrieveUserData")(app, client);
  require("../apis/storeUserData")(app, client);
  require("../apis/signUp")(app, client);
  require("../apis/signIn")(app, client);
  require("../apis/updateUserInfo")(app, client);

  require("./closeMongoDB")(client);

  return app;
};
