import express from "express";
const router = express.Router();
import appointment from "../models/appointment.js";
import doctorModel from "../models/doctor.js";

//get appointment info
router.get("/:id", async (req, res) => {
  let user;
  try {
    user = await appointment.findById(req.params.id);
    if (user === null) {
      return res.status(401).json({ message: "Cannot find user" });
    }
    return res.status(200).send(user);
  } catch (error) {
    console.log(error);
  }
});

//get doctor info from appointment
router.get("/userDoctor/:id", async (req, res) => {
  let doctor;
  try {
    doctor = await appointment.findById(req.params.id);
    if (!doctor) return res.status(404).send("no doctor found");
    const doctorId = doctor.doctorInfo;
    const doctorInfo = await doctorModel.findById(doctorId);
    res.status(200).send(doctorInfo);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
