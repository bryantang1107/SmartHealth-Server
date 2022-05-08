import express from "express";
const router = express.Router();
import appointment from "../models/appointment.js";
import doctorModel from "../models/doctor.js";
import userModel from "../models/user.js";
import patientModal from "../models/patient.js";
import roomModal from "../models/room.js";

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
    res.status(200).send([doctorInfo, doctor.name]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/store-medical-record", async (req, res) => {
  let date;
  let time;
  let doctor;
  let doctorId;
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
    user.complete = true;
    await user.save();
    const appointmentData = await appointment.findById(req.body.id);
    await roomModal.findByIdAndDelete(appointmentData.roomInfo);

    doctorId = appointmentData.doctorInfo;
    date = appointmentData.date;
    time = appointmentData.time;

    await appointment.findByIdAndDelete(req.body.id);
    doctor = await doctorModel.findById(doctorId);
    if (doctor !== null) {
      doctor.timeSlot = doctor.timeSlot.filter((x) => {
        x.date !== date && x.time !== time;
      });
      doctor.patientInfo = doctor.patientInfo.filter((x) => {
        x !== req.body.id;
      });
      await doctor.save();
    }

    res.status(200).send("Successfully stored");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.post("/store-patient-record", async (req, res) => {
  let exist = false;
  let doctor;
  try {
    doctor = await patientModal.findById(req.body.doctorId);
    const { patientId, route, drug, prescription, category, additional } =
      req.body;

    const patientRecord = {
      route,
      drug,
      prescription,
      category,
      additional,
    };
    if (!doctor) {
      const newRecord = await new patientModal({
        _id: req.body.doctorId,
        patient: [{ patientId, info: [patientRecord] }],
      });
      await newRecord.save();
    } else {
      doctor.patient.push({ patientId, info: [patientRecord] });
    }
    await doctor.save();
    res.status(203).send("Patient Record Added");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
