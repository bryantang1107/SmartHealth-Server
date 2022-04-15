import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },

});

export default mongoose.model("user", userSchema);
