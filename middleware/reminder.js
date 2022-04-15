//for reminder-email
import nodemailer from "nodemailer";
import schedule from "node-schedule";
import _jade from "jade";
import fs from "fs";
import "dotenv/config";
export const makeReminder = () => {
  const smtpTransport = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    auth: {
      user: process.env.SERVER_EMAIL,
      pass: process.env.SERVER_PASS,
    },
  });

  //when server starts, check the db for possible reminder for user
  //*/5 * * * * * --> is for every 5 second

  const scheduleJob = (content) => {
    const options = {
      from: "smarthealthorg11222@hotmail.com",
      to: "bryantang10@gmail.com", //to user's email address for reminder
      subject: "A Reminder From Smart Health 🏥", //get data from db

      html: "Description test" + content,
    };
    schedule.scheduleJob("job_name", "0 0 * * *", () => {
      smtpTransport.sendMail(options, (err, data) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log("Sent :" + data.response);
      });
    });
  };
  let template = process.cwd() + "/views/index.jade";
  fs.readFile(template, "utf-8", function (err, file) {
    if (err) {
      console.log(err);
    } else {
      var compiledTmp = _jade.compile(file, { filename: template });
      var context = { title: "Express" };
      var content = compiledTmp(context);
      scheduleJob(content);
    }
  });
};
