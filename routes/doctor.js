import express from "express";
const router = express.Router();
import { doctor } from "../data/doctor.js";
import Doctor from "../models/doctor.js";

router.get("/", async (req, res) => {
  try {
    const doctorData = await Doctor.find();
    res.status(200).json(doctorData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", getDoctor, (req, res) => {
  res.status(200).json(res.doctorData);
});

router.post("/", async (req, res) => {
  doctor.map((data) => {
    const {
      _id,
      name,
      image,
      category,
      gender,
      experience,
      about,
      hospital,
      specialisation,
      qualification,
      registry,
      languages,
      conditions,
      service,
    } = data;
    const doctorData = new Doctor({
      _id,
      name,
      image,
      category,
      gender,
      experience,
      about,
      hospital,
      specialisation,
      qualification,
      registry,
      languages,
      conditions,
      service,
    });

    saveData(doctorData);
  });
});

const saveData = async (doctorData) => {
  try {
    await doctorData.save();
    console.log("Doctor info saved successfully");
  } catch (err) {
    console.log("Cant save");
  }
};

async function getDoctor(req, res, next) {
  let doctorData;
  try {
    doctorData = await Doctor.findById(req.params.id);
    if (doctorData === null) {
      return res.status(404).json({ message: "Cannot find Doctor" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.doctorData = doctorData;
  next();
}

export default router;
