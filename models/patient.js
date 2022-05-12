import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  _id: String,
  patient: {
    type: Array,
    patientId: String,
    date: {
      type: Date,
    },
    info: {
      diagnosis: String,
      route: String,
      drug: String,
      prescription: String,
      category: String,
      additional: String,
    },
  },
});

export default mongoose.model("patientrecords", patientSchema);
