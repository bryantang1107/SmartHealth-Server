import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  room_id: String,
  password: String,
  hashedPassword: String,
});

export default mongoose.model("rooms", roomSchema);
