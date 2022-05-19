import nodemailer from "nodemailer";
import "dotenv/config";
import _jade from "jade";
import hbs from "nodemailer-express-handlebars";

export const sendEmail = (email) => {
  const smtpTransport = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    auth: {
      user: process.env.SERVER_EMAIL,
      pass: process.env.SERVER_PASS,
    },
  });

  smtpTransport.use(
    "compile",
    hbs({
      viewEngine: "express-handlebars",
      viewPath: "./views",
    })
  );

  const options = {
    from: "smarthealthorg11222@hotmail.com",
    to: email,
    subject: "Smart Health 🏥 Appointment Booking",
    template: "appointment",
  };

  smtpTransport.sendMail(options, (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Sent :" + data.response);
  });
};
