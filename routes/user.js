import express from "express";
const router = express.Router();
import appointment from "../models/appointment.js";
import doctorModel from "../models/doctor.js";
import userModel from "../models/user.js";

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
    console.log(doctor.name);
    const doctorId = doctor.doctorInfo;
    const doctorInfo = await doctorModel.findById(doctorId);
    res.status(200).send([doctorInfo, doctor.name]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/store-medical-record", async (req, res) => {
  try {
    const user = await userModel.findById(req.body.id);
    if (!user) return res.status(404).send("No user Found");
    user.medicalRecord = [
      ...user.medicalRecord,
      {
        diagnosis: req.body.diagnosis,
        route: req.body.route,
        category: req.body.category,
        prescription: req.body.prescription,
        drug: req.body.drug,
      },
    ];
    await user.save();
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

export default router;
