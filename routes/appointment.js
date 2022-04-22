import express from "express";
const router = express.Router();
import AppointmentModal from "../models/appointment.js";
import roomModal from "../models/room.js";
import doctorModal from "../models/doctor.js";

router.get("/:id", async (req, res) => {
  let appointment;
  try {
    appointment = await AppointmentModal.find()
      .where("doctorInfo")
      .equals(req.params.id);
    res.status(200).send(appointment);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/:id", async (req, res) => {
  //delete from room
  const id = req.params.id;
  let doctorId;
  let date;
  let time;
  let doctor;
  try {
    const appointment = await AppointmentModal.findById(id);
    await roomModal.findByIdAndDelete(appointment.roomInfo);
    doctorId = appointment.doctorInfo;
    date = appointment.date;
    time = appointment.time;
    await AppointmentModal.findByIdAndDelete(id);
    doctor = await doctorModal.findById(doctorId);
    if (doctor !== null) {
      doctor.timeSlot = doctor.timeSlot.filter((x) => {
        x.date !== date && x.time !== time;
      });
      doctor.patientInfo = doctor.patientInfo.filter((x) => {
        x !== id;
      });
      await doctor.save();
    }
    res.status(200).send("Success");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }

  //store in activity (the sender,message (reason of cancellation),activity name)
});

export default router;
