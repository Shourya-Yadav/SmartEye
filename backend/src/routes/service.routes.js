import express from "express";
import { requestPoliceService } from "../controllers/service.controller.js";

const router = express.Router();

router.post("/request", requestPoliceService);

export default router;

