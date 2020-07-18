// import express, cors and body-parser

const PORT = process.env.PORT || 8555;
const DEV_ENV = process.env.NODE_ENV === "development" ? true : false;

var express = require("express");
var app = express();
var cors = require("cors");
var bodyParser = require("body-parser");
var tasks = require("node-schedule");
var nodemailer = require("nodemailer");

var ObjectID = require("mongodb").ObjectID;
const MongoClient = require("mongodb").MongoClient;
const uri = `${process.env.MONGODB_URL}`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(bodyParser.json());

// create email transport for automatically email sending function
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: `${process.env.GMAIL_USERNAME}`,
    pass: `${process.env.GMAIL_PASSWORD}`,
  },
});

client.connect((err) => {
  if (err) {
    console.log("unable to connect to database.");
  } else {
    var rule = new tasks.RecurrenceRule();

    // Email sending implementation
    tasks.scheduleJob(rule, function () {
      const scheduleCollection = client.db("testdb").collection("schedules");
      let emailScheduleDataWithUserId = [];
      const userCollection = client.db("testdb").collection("users");

      const arr = scheduleCollection.find({}).toArray();
      arr
        .then((arr) =>
          arr.forEach(
            (doc) => {
              let emailScheduleData = doc.scheduleData.filter(
                (item) => item.SendEmailTime > 0
              );

              if (doc.timetableData) {
                emailScheduleData = emailScheduleData.concat(
                  doc.timetableData.filter((item) => item.SendEmailTime > 0)
                );
              }

              for (const item of emailScheduleData) {
                emailScheduleDataWithUserId.push({
                  id: doc.userId,
                  emailScheduleData: item,
                });
              }
            },
            (err) => {
              console.log(err);
            }
          )
        )
        .then((data) => {
          const arr = userCollection
            .find(
              {},
              {
                projection: { emailAddress: 1 },
              }
            )
            .toArray();
          arr.then(
            (docs) => {
              const currentDateTime = new Date();
              const currentDate = currentDateTime.getUTCDate();
              const currentHour = currentDateTime.getUTCHours();
              const currentMinute = currentDateTime.getUTCMinutes();
              for (const item of emailScheduleDataWithUserId) {
                const startTime = Date.parse(item.emailScheduleData.StartTime);
                const sendEmailMin = item.emailScheduleData.SendEmailTime;
                const MS_PER_MINUTE = 60000;
                const notiTime = new Date(
                  startTime - sendEmailMin * MS_PER_MINUTE
                );
                const notiDate = notiTime.getUTCDate();
                const notiHour = notiTime.getUTCHours();
                const notiMinute = notiTime.getUTCMinutes();
                if (
                  currentDate === notiDate &&
                  currentHour === notiHour &&
                  currentMinute === notiMinute
                ) {
                  const userEmail = docs.find(
                    (e) => e._id.toString() === item.id
                  ).emailAddress;
                  console.log("Email is ready to send to: " + userEmail);

                  const mailOptions = {
                    from: "scheduler.helper@gmail.com",
                    to: userEmail,
                    subject: "Notification for your upcoming event",
                    text: `Your event ${item.emailScheduleData.Subject} is going to start in ${item.emailScheduleData.SendEmailTime} minutes.`,
                  };

                  transporter.sendMail(mailOptions, function (err, info) {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log("email sent: " + info.response);
                    }
                  });
                }
              }
            },
            (err) => {
              console.log(err);
            }
          );
        });
    });
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
          msg: 0,
        });
      } else {
        res.json({
          ...data,
          msg: "successful.",
        });
      }
    },
    (err) => {
      res.json({
        msg: -1,
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
              msg: 1, // succeed
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
            msg: 1,
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

app.listen(PORT, function () {
  console.log(`Listening on ${PORT}`);
});
