const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
// const tasks = require("node-schedule");
const ObjectID = require("mongodb").ObjectID;
const MongoClient = require("mongodb").MongoClient;
// const transporter = require("./transporter").transporter;
const emailSending = require("./emailSending");

module.exports = function () {
  const app = express();

  const uri = `${process.env.MONGODB_URL}`;
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  app.use(cors());
  app.use(bodyParser.json());

  app.options("*", cors());

  client.connect((err) => {
    if (err) {
      console.log("unable to connect to database.");
    } else {
      emailSending(client);
    }
  });

  app.get("/", function (req, res) {
    res.json({
      msg: "API ok.",
    });
  });

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

  app.post("/storeUserData", function (req, res) {
    const body = req.body;
    let userScheduleData;

    if (body.isTimetable) {
      userScheduleData = {
        userId: body.userId,
        timetableData: body.bindingData,
      };
    } else {
      userScheduleData = {
        userId: body.userId,
        scheduleData: body.bindingData,
      };
    }

    const scheduleCollection = client.db("testdb").collection("schedules");
    scheduleCollection.findOne({ userId: userScheduleData.userId }).then(
      (data) => {
        if (!data) {
          scheduleCollection.insertOne(userScheduleData).then(
            (data) => {
              res.json({
                msg: "created schedule data successfully.",
              });
            },
            (err) => {
              res.json({
                msg: "unable to insert data to database.",
              });
            }
          );
        } else {
          scheduleCollection
            .findOneAndUpdate(
              { userId: userScheduleData.userId },
              body.isTimetable
                ? {
                    $set: {
                      timetableData: userScheduleData.timetableData,
                    },
                  }
                : {
                    $set: {
                      scheduleData: userScheduleData.scheduleData,
                    },
                  }
            )
            .then(
              (data) => {
                if (!data) {
                  res.json({
                    msg: "",
                  });
                } else {
                  res.json({
                    msg: "update schedule data successfully.",
                  });
                }
              },
              (err) => {
                res.json({
                  msg: "unable to update data to database.",
                });
              }
            );
        }
      },
      (err) => {
        console.log("err" + err);
      }
    );
  });

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

  function cleanup() {
    console.log("clean up db connection...");
    client.close();
  }

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  return app;
};
