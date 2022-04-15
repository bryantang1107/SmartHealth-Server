import { createRequire } from "module";
const require = createRequire(import.meta.url);
import Appointment from "../models/appointment.js";
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

import express from "express";
const router = express.Router();
import bcrypt from "bcrypt";
import doctor from "../models/doctor.js";
import room from "../models/room.js";

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
      doctorInfo,
    } = req.body.userInfo;

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
      roomInfo: roomId._id,
    });

    await userAppointment.save();

    await doctor.findOneAndUpdate(
      {
        _id: doctorInfo,
      },
      {
        $push: { patientInfo: userId },
      }
    );
    res.status(200).send(true);
  } catch (error) {
    res.status(500).send("Invalid");
  }
});
router.get("/getRoomInfo/:id", async (req, res) => {
  const userId = req.params.id;
  let user;
  let roomCreds;
  let doctorInfo;
  try {
    //check if user or doctor made req
    user = await Appointment.findById(userId);
    if (user === null) {
      return res.status(401).json({
        message: "Get your credentials when you have booked an appointment !",
      });
    }
    const roomInfo = user.roomInfo;
    roomCreds = await room.findById(roomInfo);
    if (roomCreds === null) {
      res.status(500).json({ message: "Server Error" });
    }

    res.status(200).send(roomCreds);
  } catch (err) {
    res.sendStatus(500);
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
    userAppointment = await Appointment.findById(req.params.id);

    if (userAppointment !== null) {
      return res.send(false);
    }
    return res.send(true);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
