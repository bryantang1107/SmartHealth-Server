import express from "express";
const router = express.Router();
import AppointmentModal from "../models/appointment.js";

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

export default router;
