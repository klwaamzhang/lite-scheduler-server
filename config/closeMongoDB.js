module.exports = function (client) {
  function cleanup() {
    console.log("clean up db connection...");
    client.close();
  }

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
};
