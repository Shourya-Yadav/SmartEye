import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load env explicitly from backend root BEFORE anything else
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Debug env load
console.log("MONGO_URI =", process.env.MONGO_URI ? "Loaded" : "Missing");
// console.log("EMAIL_USER =", process.env.EMAIL_USER || "Missing");
// console.log("EMAIL_PASS =", process.env.EMAIL_PASS ? "Loaded" : "Missing");

// Import routes AFTER dotenv loads
import userRoutes from "./routes/user.routes.js";
import violationRoutes from "./routes/violation.routes.js";
import serviceRoutes from "./routes/service.routes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Test route
app.get("/home", (req, res) => {
  res.status(200).json({ message: "Backend running successfully" });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/violations", violationRoutes);
app.use("/api/services", serviceRoutes);

// Start Server + DB
const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
