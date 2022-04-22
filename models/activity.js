import mongoose from "mongoose";

const activitySchema = mongoose.Schema({
  activityName: String,
  date: {
    type: Date,
    default: Date.now(),
  },
  sender: String,
  email: String,
  message: String,
});

export default mongoose.model("activity", activitySchema);
