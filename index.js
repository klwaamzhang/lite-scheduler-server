const PORT = process.env.PORT || 8555;
// const DEV_ENV = process.env.NODE_ENV === "development" ? true : false;

const app = require("./config/express")();

app.listen(PORT, function () {
  console.log(`Listening on ${PORT}`);
});
