import express from "express";
const router = express.Router();
import appointment from "../models/appointment.js";
import doctorModel from "../models/doctor.js";
import userModel from "../models/user.js";
import patientModal from "../models/patient.js";

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

router.get("/medical-record/:id", async (req, res) => {
  let user;
  try {
    user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).send("User Do not exist");
    res.status(200).send(user.medicalRecord);
  } catch (error) {
    res.status(500).send("Internal Server Error");
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

router.get("/patient-record/:id", async (req, res) => {
  let doctorInfo;
  try {
    doctorInfo = await patientModal.findById(req.params.id);
    if (!doctorInfo) return res.status(404).send("No Information found");
    const groups = doctorInfo.patient.reduce((groups, item) => {
      const group = groups[item.patientId] || [];
      group.push(item);
      groups[item.patientId] = group;
      return groups;
    }, {});
    res.status(200).send(groups);
  } catch (err) {
    res.status(500).send("Internal server Error");
  }
});

router.post("/store-medical-record", async (req, res) => {
  let doctorId;
  let date;
  let time;
  let doctor;
  try {
    const user = await userModel.findById(req.body.id);
    const appointmentData = await appointment.findById(req.body.id);
    if (!user) return res.status(404).send("No user Found");
    user.medicalRecord = [
      ...user.medicalRecord,
      {
        diagnosis: req.body.diagnosis,
        route: req.body.route,
        category: req.body.category,
        doctorConsulted: req.body.doctorConsulted,
        prescription: req.body.prescription,
        drug: req.body.drug,
        date: new Date(),
      },
    ];
    user.complete = true;
    await user.save();
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
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/store-patient-record", async (req, res) => {
  let doctor;
  try {
    doctor = await patientModal.findById(req.body.doctorId);
    const {
      patientId,
      route,
      drug,
      prescription,
      category,
      additional,
      diagnosis,
    } = req.body;

    const patientRecord = {
      diagnosis,
      route,
      drug,
      prescription,
      category,
      additional,
    };
    if (!doctor) {
      const newRecord = await new patientModal({
        _id: req.body.doctorId,
        patient: [{ patientId, date: new Date(), info: patientRecord }],
      });
      await newRecord.save();
    } else {
      doctor.patient.push({
        patientId,
        date: new Date(),
        info: patientRecord,
      });
      await doctor.save();
    }

    res.status(203).send("Patient Record Added");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
