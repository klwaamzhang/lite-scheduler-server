module.exports = function (app, client) {
  app.post("/retrieveUserData", function (req, res) {
    const body = req.body;
    console.log(body);
    const scheduleCollection = client.db("testdb").collection("schedules");
    scheduleCollection.findOne({ userId: body.userId }).then(
      (data) => {
        if (!data) {
          res.json({
            msg: "No Data Retrieved",
          });
        } else {
          res.json({
            ...data,
            msg: "Data Retrieved Successful",
          });
        }
      },
      (err) => {
        res.json({
          msg: "Data Retrieved Error",
        });
      }
    );
  });
};
