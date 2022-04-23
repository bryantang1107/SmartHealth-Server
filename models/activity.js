import mongoose from "mongoose";

const activitySchema = mongoose.Schema({
  doctorId: String,
  activityName: String,
  date: {
    type: Date,
    default: Date.now(),
  },
  type: String,
  sender: String,
  email: { type: String, trim: true },
  message: String,
  reason: String,
});

export default mongoose.model("activity", activitySchema);
