module.exports = function (app, client) {
  app.post("/signin", function (req, res) {
    const loginData = req.body;
    const userCollection = client.db("testdb").collection("users");

    userCollection
      .findOne({
        emailAddress: loginData.emailAddress,
        password: loginData.password,
      })
      .then(
        (data) => {
          if (!data) {
            res.json({
              msg: "Wrong email address or password, please input again.",
            });
          } else {
            res.json({
              ...data,
              msg: "SignIn Succeeded",
            });
          }
        },
        (err) => {
          console.log("err" + err);
        }
      );
  });
};
