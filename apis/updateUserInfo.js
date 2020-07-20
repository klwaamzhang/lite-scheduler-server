const { ObjectID } = require("mongodb");

module.exports = function (app, client) {
  app.post("/updateUserInfo", function (req, res) {
    const userInfo = req.body;
    const userCollection = client.db("testdb").collection("users");

    userCollection
      .updateOne(
        { _id: new ObjectID(userInfo._id) },
        {
          $set: {
            emailAddress: userInfo.emailAddress,
            userName: userInfo.userName,
            password: userInfo.password,
            accountType: userInfo.accountType,
          },
        }
      )
      .then(
        (data) => {
          if (data) {
            res.json({
              msg: "Updated successful",
            });
          } else {
            res.json({
              msg: "Update failed",
            });
          }
        },
        (err) => {
          console.log("err" + err);
          res.json({
            msg: err,
          });
        }
      );
  });
};
