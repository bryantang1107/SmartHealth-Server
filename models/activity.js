import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  doctorId: String,
  activityName: String,
  date: String,
  time: String,
  type: String,
  sender: String,
  email: { type: String, trim: true },
  message: String,
  reason: String,
});

export default mongoose.model("activity", activitySchema);
