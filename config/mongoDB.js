const { MongoClient } = require("mongodb");
const sendEmail = require("../serverFunctionality/sendEmail");

module.exports = function () {
  const uri = `${process.env.MONGODB_URL}`;
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  client.connect((err) => {
    if (err) {
      console.log("unable to connect to database.");
    } else {
      sendEmail(client);
    }
  });

  return client;
};
