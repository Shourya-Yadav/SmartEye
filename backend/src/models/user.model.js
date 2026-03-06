import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: {
      type: String,
      default: "admin"
    },
    token: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

