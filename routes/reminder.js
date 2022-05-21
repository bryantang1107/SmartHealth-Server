import express from "express";
const router = express.Router();
import userModel from "../models/user.js";
import reminderModel from "../models/reminder.js";
import MomentTimezone from "moment-timezone";
import moment from "moment";
import "dotenv/config";

const getTimeZones = () => {
  return MomentTimezone.tz.names();
};

router.get("/create", (req, res) => {
  res.status(200).send(getTimeZones());
});

router.get("/:id/edit", async (req, res) => {
  const id = req.params.id;
  try {
    const appointment = await reminderModel.findOne({ _id: id });
    if (!appointment) return res.status(404).send("No reminder");
    res.status(200).send(appointment);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.post("/:id", async (req, res) => {
  const name = req.body.name;
  const phoneNumber = req.body.phoneNumber;
  const notification = req.body.notification;
  const timeZone = req.body.timeZone;
  const detail = req.body.detail;
  const date = new Date(req.body.time);
  const time = moment(date, "MM-DD-YYYY hh:mma");
  console.log(name, phoneNumber, notification, timeZone, time);
  const appointment = new reminderModel({
    _id: req.params.id,
    name,
    phoneNumber,
    notification,
    timeZone,
    detail,
    time,
  });
  await appointment.save();
  res.status(200).send("Success");
});

//edit route
router.post("/:id/edit", async (req, res) => {
  const id = req.params.id;
  const name = req.body.name;
  const phoneNumber = req.body.phoneNumber;
  const notification = req.body.notification;
  const time = moment(req.body.time, "MM-DD-YYYY hh:mma");
  let appointment;
  try {
    appointment = await reminderModel.findOne({ _id: id });
    if (!appointment) return res.status(404).send("No Reminder");
    appointment.name = name;
    appointment.phoneNumber = phoneNumber;
    appointment.notification = notification;
    appointment.time = time;

    await appointment.save();
    res.status(200).send("Success");
  } catch (error) {}
});

//delete
router.post("/:id/delete", async (req, res) => {
  const id = req.params.id;
  try {
    await reminderModel.remove({ _id: id });
    res.status(203).send("Successfully delete");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/email-reminder/:id", async (req, res) => {
  let user;
  try {
    user = await reminderModel.findById(req.params.id);
    if (user === null) {
      return res.status(200).send(false);
    }
    return res.status(200).send(true);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/get-reminder/:id", async (req, res) => {
  let user;
  try {
    user = await userModel.findById(req.params.id);
    if (user) {
      return res.status(200).json(user.reminder);
    }
    res.status(404).send("No reminder");
  } catch (error) {
    console.log(error);
  }
});
router.delete("/cancel-email-reminder", async (req, res) => {
  //delete from db
  try {
    await reminderModel.findByIdAndDelete(req.body.userData);
    res.status(202).send("Deleted Succesfully");
  } catch (error) {
    res.status(500).send("Internal Server Errror");
  }
});

router.post("/update", async (req, res) => {
  let user;
  try {
    user = await userModel.findById(req.body.userData);
    let reminder = user.reminder;
    reminder = [...reminder, req.body.obj];
    user.reminder = reminder;
    await user.save();
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

export default router;
