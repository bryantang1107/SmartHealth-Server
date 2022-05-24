import { createRequire } from "module";
const require = createRequire(import.meta.url);
import Appointment from "../models/appointment.js";
import activityModal from "../models/activity.js";
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

import express from "express";
const router = express.Router();
import bcrypt from "bcrypt";
import doctor from "../models/doctor.js";
import room from "../models/room.js";
import userModal from "../models/user.js";
import historyModal from "../models/history.js";
import AppointmentModal from "../models/appointment.js";
import { sendEmail } from "../confirmation.js";
import meetingModal from "../models/meeting.js";

const storeTimeSlot = async (id, time, date) => {
  const slot = { date, time: time };
  console.log(slot);
  let exist = false;
  const doctorData = await doctor.findOne({
    _id: id,
  });
  if (doctorData.timeSlot.length > 0) {
    doctorData.timeSlot.forEach((x) => {
      if (x.date === date && x.time === time) {
        exist = true;
      }
    });
    if (exist) return exist;
    exist = false;
    doctorData.timeSlot.push(slot);
    console.log(doctorData);
    await doctorData.save();
  } else {
    doctorData.timeSlot.push(slot);

    console.log(doctorData);

    await doctorData.save();
  }
  return exist;
};
const formatDate = (date, time) => {
  let hours = parseInt(time.split("T")[0]);
  let ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  let strTime = hours + ":00" + ampm;
  return (
    date.getDate() +
    "/" +
    (date.getMonth() + 1) +
    "/" +
    date.getFullYear() +
    "  " +
    strTime
  );
};

router.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const {
      userId,
      name,
      email,
      phone,
      dob,
      symptoms,
      date,
      gender,
      time,
      doctorInfo,
    } = req.body.userInfo;

    const doctorData = await doctor.findById(doctorInfo);
    if (doctorData.unavailable.includes(date)) {
      return res.status(403).send("Unavailable");
    }

    const exist = await storeTimeSlot(doctorInfo, time, date);
    if (exist) {
      return res.status(404).send("Slot Taken");
    }

    const roomCredentials = new room({
      room_id: req.body.room_id,
      password: req.body.password,
      hashedPassword,
    });
    const roomId = await roomCredentials.save();

    const userAppointment = new Appointment({
      _id: userId,
      name,
      email,
      phone,
      dob,
      gender,
      symptoms,
      date,
      doctorInfo,
      time,
      roomInfo: roomId._id,
    });

    await userAppointment.save();

    await doctor.findOneAndUpdate(
      {
        _id: doctorInfo,
      },
      {
        $push: { patientInfo: { userId } },
      }
    );
    const newDate = formatDate(new Date(date), time);
    const activity = await new activityModal({
      doctorId: doctorInfo,
      activityName: "New Appointment",
      sender: name,
      type: "appointment",
      email: email,
      message: `You have a new appointment scheduled with ${name} at ${newDate}`,
    });
    await activity.save();

    const userComplete = await userModal.findById(userId);
    userComplete.complete = false;
    await userComplete.save();

    const historyAppointment = await historyModal.findById(userId);
    const appointment = await AppointmentModal.findById(userId);
    appointment.status = "pending";
    if (historyAppointment) {
      historyAppointment.appointmentHistory = [
        ...historyAppointment.appointmentHistory,
        appointment,
      ];
      await historyAppointment.save();
    } else {
      const newHistory = new historyModal({
        _id: userId,
        appointmentHistory: [appointment],
      });
      await newHistory.save();
    }

    sendEmail(email);

    res.status(200).send(true);
  } catch (error) {
    console.log(error);
    res.status(500).send("Invalid");
  }
});
router.get("/getRoomInfoDoctor/:id", async (req, res) => {
  const roomId = req.params.id;
  let roomCreds;
  try {
    roomCreds = await room.findById(roomId);
    if (roomCreds === null) {
      return res.status(500).json({ message: "Server Error" });
    }

    res.status(200).send(roomCreds);
  } catch (err) {
    res.sendStatus(500);
  }
});

router.get("/getRoomInfo/:id", async (req, res) => {
  const userId = req.params.id;
  let user;
  let roomCreds;
  try {
    user = await Appointment.findById(userId);
    if (user === null) {
      return res.status(401).json({
        message: "Get your credentials when you have booked an appointment !",
      });
    }
    const roomInfo = user.roomInfo;
    roomCreds = await room.findById(roomInfo);
    if (roomCreds === null) {
      return res.status(500).json({ message: "Server Error" });
    }

    res.status(200).send(roomCreds);
  } catch (err) {
    res.sendStatus(500);
  }
});

router.post("/join-room/:id", async (req, res) => {
  try {
    let meeting = await new meetingModal({
      _id: req.params.id,
    });
    await meeting.save();
    res.status(203).send("Success");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/join-room/:id", async (req, res) => {
  let meeting;
  try {
    meeting = await meetingModal.findById(req.params.id);
    if (!meeting) return res.status(404).send("No user");
    res.status(200).send(meeting);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.delete("join-room/:id", async (req, res) => {
  try {
    await meetingModal.findByIdAndDelete(req.params.id);
    res.status(203).send("Success");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.post("/login", async (req, res) => {
  let roomCreds;
  try {
    roomCreds = await room.findById(req.body.id);
    if (req.body.room_id !== roomCreds.room_id) {
      return res.status(401).json({ message: "No Room Exists" });
    }
    if (await bcrypt.compare(req.body.password, roomCreds.hashedPassword)) {
      res.status(200).send("Success");
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

router.get("/appointment/:id", async (req, res) => {
  let userAppointment;

  try {
    userAppointment = await userModal.findById(req.params.id);
    if (!userAppointment) {
      return res.status(404).send("No user found");
    }
    res.status(200).send(userAppointment.complete);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
