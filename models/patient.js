import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  _id: String,
  patient: {
    type: Array,
    patientId: String,
    info: {
      type: Array,
    },
  },
});

export default mongoose.model("PatientRecords", patientSchema);
