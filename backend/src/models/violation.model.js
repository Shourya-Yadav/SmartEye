import mongoose from "mongoose";

const violationSchema = new mongoose.Schema({
  vehicleNumber: String,
  violationType: String,
  imageUrl: String,
  location: String,
  fineAmount: Number,
  detectedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Violation", violationSchema);
