const tasks = require("node-schedule");
const transporter = require("./transporter");

module.exports = function (client) {
  var rule = new tasks.RecurrenceRule();
  tasks.scheduleJob(rule, function () {
    const scheduleCollection = client.db("testdb").collection("schedules");
    const userCollection = client.db("testdb").collection("users");
    const arr = scheduleCollection.find({}).toArray();
    let emailScheduleDataWithUserId = [];
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
                const userEmail = docs.find((e) => e._id.toString() === item.id)
                  .emailAddress;
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

  return tasks;
};
