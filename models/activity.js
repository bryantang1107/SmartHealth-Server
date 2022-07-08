import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  doctorId: String,
  activityName: String,
  date: {
    type: Date,
    default: new Date().toLocaleTimeString("en-US", {
      timeZone: "Asia/Kuala_Lumpur",
    }),
  },
  type: String,
  sender: String,
  email: { type: String, trim: true },
  message: String,
  reason: String,
});

export default mongoose.model("activity", activitySchema);
