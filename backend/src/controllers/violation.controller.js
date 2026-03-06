import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";
import Violation from "../models/violation.model.js";

// Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export const detectViolation = async (req, res) => {
  try {
    const { vehicleType, vehicleNumber, speed, signalJumped, helmetWorn, location } = req.body;

    let violationType = "No Violation";
    let fineAmount = 0;

    if (speed > 80) {
      violationType = "Overspeeding";
      fineAmount = 1000;
    }

    if (signalJumped) {
      violationType = "Signal Jumping";
      fineAmount = 1500;
    }

    if (vehicleType === "bike" && !helmetWorn) {
      violationType = "No Helmet";
      fineAmount = 1000;
    }

    // Clean structured prompt (faster response)
    const prompt = `
Generate a SHORT traffic violation report.

Vehicle: ${vehicleNumber}
Type: ${vehicleType}
Location: ${location}
Violation: ${violationType}
Speed: ${speed} km/h
Fine: ₹${fineAmount}

Provide 1 safety recommendation.
`;

    let report;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      report =
        response.text ||
        response.candidates?.[0]?.content?.parts?.[0]?.text;

    } catch (err) {
      console.log("Gemini fallback used");

      // fallback report
      report = `
TRAFFIC VIOLATION REPORT

Vehicle Number: ${vehicleNumber}
Vehicle Type: ${vehicleType}
Location: ${location}

Violation: ${violationType}
Detected Speed: ${speed} km/h
Fine Amount: ₹${fineAmount}

Safety Note: Please follow traffic rules and drive safely.
`;
    }

    // Save violation in MongoDB (model unchanged)
    const violation = await Violation.create({
      vehicleNumber,
      violationType,
      location,
      fineAmount,
      imageUrl: ""
    });

    res.json({
      message: "Violation detected",
      data: violation,
      report
    });

  } catch (error) {
    console.error("Error:", error);

    res.status(500).json({
      message: "Violation detection failed"
    });
  }
};


// Dashboard API
export const getAllViolations = async (req, res) => {
  try {

    const violations = await Violation
      .find()
      .sort({ detectedAt: -1 });

    res.json({
      message: "Violations fetched successfully",
      data: violations
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch violations"
    });

  }
};