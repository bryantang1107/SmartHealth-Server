import express from "express";
const router = express.Router();
import AppointmentModal from "../models/appointment.js";
import roomModal from "../models/room.js";
import doctorModal from "../models/doctor.js";
import activityModal from "../models/activity.js";
import userModal from "../models/user.js";
import historyModal from "../models/history.js";

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

router.post("/done/:id", async (req, res) => {
  const id = req.params.id;
  let doctorId;
  let date;
  let time;
  let doctor;
  try {
    const appointment = await AppointmentModal.findById(id);
    const historyAppointment = await historyModal.findById(id);
    if (historyAppointment) {
      historyAppointment.appointmentHistory = [
        ...historyAppointment.appointmentHistory,
        appointment,
      ];
      await historyAppointment.save();
    } else {
      const newHistory = new historyModal({
        _id: id,
        appointmentHistory: [appointment],
      });
      await newHistory.save();
    }
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
    const activity = await new activityModal({
      doctorId,
      activityName: "Appointment Cancellation",
      type: "cancel",
      sender: req.body.name,
      email: req.body.email,
      reason: req.body.reason,
      message: ` cancelled the appointment with You.`,
    });
    await activity.save();
    const user = await userModal.findById(id);
    user.complete = true;
    await user.save();
    res.status(200).send("Success");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.patch("/updateInfo/:id", async (req, res) => {
  let appointment;
  try {
    appointment = await AppointmentModal.findById(req.params.id);
    if (!appointment) return res.status(404).send("no appointment exist");
    appointment.name = req.body.name;
    appointment.phone = req.body.phone;
    appointment.dob = req.body.dob;
    appointment.symptoms = req.body.symptoms;

    await appointment.save();

    res.status(200).send("update completed");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/detail/:id", async (req, res) => {
  let userAppointment;

  try {
    userAppointment = await AppointmentModal.findById(req.params.id);
    if (userAppointment !== null) {
      const doctor = await doctorModal.findById(userAppointment.doctorInfo);
      return res.status(200).send([userAppointment, doctor]);
    }
    return res.status(404).send("No Appointment");
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
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
    const activity = await new activityModal({
      doctorId,
      activityName: "Appointment Cancellation",
      type: "cancel",
      sender: req.body.name,
      email: req.body.email,
      reason: req.body.reason,
      message: ` cancelled the appointment with You.`,
    });
    await activity.save();
    const user = await userModal.findById(id);
    user.complete = true;
    await user.save();
    res.status(200).send("Success");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }

  //store in activity (the sender,message (reason of cancellation),activity name)
});

export default router;
