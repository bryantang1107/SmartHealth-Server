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
});

export default mongoose.model("user", userSchema);
