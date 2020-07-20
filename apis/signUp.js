module.exports = function (app, client) {
  app.post("/signup", function (req, res) {
    const userData = req.body;
    const userCollection = client.db("testdb").collection("users");

    userCollection.findOne({ emailAddress: userData.emailAddress }).then(
      (data) => {
        if (!data) {
          // insert data to database
          userCollection.insertOne(userData).then(
            (data) => {
              res.json({
                msg: "SignUp Succeeded", // succeed
              });
            },
            (err) => {
              res.json({
                msg: "unable to insert data to database.",
              });
            }
          );
        } else {
          res.json({
            msg: "This email has been registered, please input again.",
          });
        }
      },
      (err) => {
        console.log("err" + err);
      }
    );
  });
};
