import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  _id: String,
});

export default mongoose.model("meetings", meetingSchema);
