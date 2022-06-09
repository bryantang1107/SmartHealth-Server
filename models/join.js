import mongoose from "mongoose";

const joinSchema = new mongoose.Schema({
  _id: String,
  username: String,
  roomID: String,
});

export default mongoose.model("joinroom", joinSchema);
