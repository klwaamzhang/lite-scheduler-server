module.exports = function (app) {
  app.get("/", function (req, res) {
    res.json({
      msg: "API ok.",
    });
  });
};
