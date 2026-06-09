import express from "express";

import authMiddleware
from "../middleware/auth.middleware.js";

import {
  getDashboardStats,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/stats",
  getDashboardStats
);

export default router;