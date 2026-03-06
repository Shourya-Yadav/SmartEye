import express from "express";
import {
  register,
  login,
  logout,
  getProfile
} from "../controllers/user.controller.js";

const router = express.Router();

/**
 * @route   POST /api/users/register
 * @desc    Register new user
 */
router.post("/register", register);

/**
 * @route   POST /api/users/login
 * @desc    Login user
 */
router.post("/login", login);

/**
 * @route   GET /api/users/logout
 * @desc    Logout user (token based)
 */
router.get("/logout", logout);

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile using token
 */
router.get("/profile", getProfile);

export default router;
