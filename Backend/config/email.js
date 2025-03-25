const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.camcel.com.uy",
  port: 587,
  auth: {
    user: "info@camcel.com.uy",
    pass: "GJ0*hvStmNF$"
  }
});

module.exports = transporter;
