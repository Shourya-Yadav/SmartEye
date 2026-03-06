import express from "express";
import { detectViolation, getAllViolations } from "../controllers/violation.controller.js";

const router = express.Router();

router.post("/detect", detectViolation);
router.get("/all", getAllViolations);

export default router;
