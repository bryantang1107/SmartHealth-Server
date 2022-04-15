import mongoose from "mongoose";

const appointmentSchema = mongoose.Schema({
  _id: {
    type: String,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
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
  date: {
    type: Date,
  },
  doctorInfo: {
    type: String,
  },
  roomInfo: {
    type: String,
    required: true,
  },
});

export default mongoose.model("appointments", appointmentSchema);
