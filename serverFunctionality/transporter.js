const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: `${process.env.GMAIL_USERNAME}`,
    pass: `${process.env.GMAIL_PASSWORD}`,
  },
});
