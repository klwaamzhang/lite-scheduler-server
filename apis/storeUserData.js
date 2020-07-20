module.exports = function (app, client) {
  app.post("/storeUserData", function (req, res) {
    const body = req.body;
    const scheduleCollection = client.db("testdb").collection("schedules");
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
};
