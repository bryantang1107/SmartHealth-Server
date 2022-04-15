import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
  hospital: {
    type: String,
    required: true,
  },
  specialisation: {
    type: String,
    required: true,
  },
  qualification: {
    type: String,
    required: true,
  },
  registry: {
    type: Array,
    required: true,
  },
  languages: {
    type: String,
    required: true,
  },
  conditions: {
    type: Array,
    required: true,
  },
  service: {
    type: Array,
    required: true,
  },
  patientInfo: {
    type: Array,
  },
});

export default mongoose.model("doctors", doctorSchema);
