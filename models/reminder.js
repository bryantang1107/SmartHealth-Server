import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  email: { type: String, required: true, trim: true },
});

export default mongoose.model("reminders", reminderSchema);
