"use strict";

import moment from "moment";
import mongoose from "mongoose";
import "dotenv/config";
import Twilio from "twilio";

const reminderSchema = new mongoose.Schema({
  _id: String,
  name: String,
  phoneNumber: String,
  notification: Number,
  detail: String,
  timeZone: String,
  time: { type: Date, index: true },
});

reminderSchema.methods.requiresNotification = function (date) {
  return (
    Math.round(
      moment
        .duration(
          moment(this.time).tz(this.timeZone).utc().diff(moment(date).utc())
        )
        .asMinutes()
    ) === this.notification
  );
};

reminderSchema.statics.sendNotifications = function (callback) {
  // now
  const searchDate = new Date();
  //error here
  Reminder.find().then(function (appointments) {
    appointments = appointments.filter(function (appointment) {
      return appointment.requiresNotification(searchDate);
    });
    if (appointments.length > 0) {
      console.log("Sending reminder");
      sendNotifications(appointments);
    }
  });

  function sendNotifications(appointments) {
    const client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    appointments.forEach(function (appointment) {
      // Create options to send the message
      const options = {
        to: `+ ${appointment.phoneNumber}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: `Hi ${appointment.name}. Just a reminder that you have an appointment coming up.\n get the detail in the reminder list`,
      };

      // Send the message!
      client.messages.create(options, function (err, response) {
        if (err) {
          console.error(err);
        } else {
          // Log the last few digits of a phone number
          let masked = appointment.phoneNumber.substr(
            0,
            appointment.phoneNumber.length - 5
          );
          masked += "*****";
          console.log(`Message sent to ${masked}`);
        }
      });
    });

    // Don't wait on success/failure, just indicate all messages have been
    // queued for delivery
    if (callback) {
      callback.call();
    }
  }
};
const Reminder = mongoose.model("reminders", reminderSchema);
export default Reminder;
