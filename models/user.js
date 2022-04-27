import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  reminder: {
    type: Array,
  },
  medicalRecord: {
    type: Array,
  },
  complete: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("user", userSchema);
