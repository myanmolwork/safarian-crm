import express from "express";

import {
  checkIn,
  checkOut,
  getAttendance,
} from "../controllers/attendance.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/check-in",
  roleMiddleware("WORKER", "TEAM_LEADER"),
  checkIn
);

router.post(
  "/check-out",
  roleMiddleware("WORKER", "TEAM_LEADER"),
  checkOut
);

router.get(
  "/",
  roleMiddleware(
    "BOSS",
    "TEAM_LEADER",
    "WORKER"
  ),
  getAttendance
);

export default router;