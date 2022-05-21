import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  _id: String,
  name: {
    type: String,
  },
  email: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
  },
  dob: {
    type: Date,
  },
  gender: {
    type: String,
  },
  symptoms: {
    type: String,
  },
  time: {
    type: String,
  },
  date: {
    type: String,
  },
  doctorInfo: {
    type: String,
  },
  roomInfo: {
    type: String,
    required: true,
  },
  status: {
    type: String,
  },
});

export default mongoose.model("appointments", appointmentSchema);
