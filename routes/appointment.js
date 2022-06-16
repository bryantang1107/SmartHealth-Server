import express from "express";
const router = express.Router();
import AppointmentModal from "../models/appointment.js";
import roomModal from "../models/room.js";
import doctorModal from "../models/doctor.js";
import activityModal from "../models/activity.js";
import userModal from "../models/user.js";
import historyModal from "../models/history.js";
import reminderModal from "../models/reminder.js";
import joinModal from "../models/join.js";

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

router.post("/joinroom/:id", async (req, res) => {
  let appointment;

  try {
    await joinModal.findByIdAndDelete(req.params.id);
    appointment = await new joinModal({
      _id: req.params.id,
      roomID: req.body.roomID,
      username: req.body.username,
    });
    await appointment.save();
    res.status(200).send("ok");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/joinroom/:id", async (req, res) => {
  let appointment;
  try {
    appointment = await joinModal.findById(req.params.id);
    res.status(200).send(appointment);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get(`/patient-record/:id`, async (req, res) => {
  let patient;
  try {
    patient = await historyModal.findById(req.params.id);
    if (!patient) return res.status(404).send("No patient found");
    res.status(200).send(patient);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.patch("/unavailable/:id", async (req, res) => {
  const startDate = new Date(req.body.startDate.split("T")[0]);
  const endDate = new Date(req.body.endDate.split("T")[0]);
  const dates = [];
  const date = new Date(startDate.getTime());
  while (date <= endDate) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  const newdate = dates.map((x) => {
    return x.toISOString().split("T")[0];
  });
  let exist = false;
  try {
    const doctorData = await doctorModal.findById(req.params.id);
    if (doctorData?.unavailable.length < 1) {
      doctorData?.timeSlot.forEach((date) => {
        if (newdate.includes(date.date)) {
          exist = true;
        }
      });
      if (exist) {
        return res.status(403).send("Date Available");
      }
      doctorData.unavailable = newdate;
      await doctorData.save();
      res.status(200).send("Done");
    } else {
      newdate.forEach((x) => {
        doctorData?.timeSlot.forEach((date) => {
          if (date.date === x) {
            exist = true;
          }
        });
        if (doctorData?.unavailable.includes(x)) {
          exist = true;
        }

        doctorData?.unavailable.push(x);
      });
      if (exist) return res.status(403).send("Date Available");
      await doctorData.save();
      res.status(200).send("Done");
    }
  } catch (error) {
    console.log(error);
  }
});

router.delete("/unavailable/:id", async (req, res) => {
  try {
    const doctor = await doctorModal.findById(req.params.id);
    if (!doctor) return res.status(404).send("No Doctor");
    const list = doctor.unavailable.filter((x) => {
      return x !== req.body.removeDate;
    });
    doctor.unavailable = list;
    await doctor.save();
    res.status(200).send("Success");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/past-appointment/:id", async (req, res) => {
  let history;
  try {
    history = await historyModal.findById(req.params.id);

    if (!history) return res.status(404).send("No History found");

    res.status(200).send(history);
  } catch (error) {
    console.log(error);
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
  const id = req.params.id;
  let doctorId;
  let date;
  let time;
  let doctor;
  try {
    const appointment = await AppointmentModal.findById(id);
    await roomModal.findByIdAndDelete(appointment.roomInfo);
    await joinModal.findByIdAndDelete(id);
    await joinModal.findByIdAndDelete(doctorId);
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

    const history = await historyModal.findById(id);
    const latestHistory =
      history.appointmentHistory[history.appointmentHistory.length - 1];
    latestHistory.status = "Cancelled";
    history.appointmentHistory[history.appointmentHistory.length - 1] =
      latestHistory;
    await history.save();

    await reminderModal.findByIdAndDelete(id);

    res.status(200).send("Success");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
