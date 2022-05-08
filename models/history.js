import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  _id: String,
  appointmentHistory: {
    type: Array,
  },
});

export default mongoose.model("histories", historySchema);
