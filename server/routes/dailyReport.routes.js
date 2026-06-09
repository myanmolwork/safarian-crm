import express from "express";

import authMiddleware
from "../middleware/auth.middleware.js";

import {
  submitReport,
  getAllReports,
}
from "../controllers/dailyReport.controller.js";

const router =
express.Router();

router.use(authMiddleware);

router.post(
  "/",
  submitReport
);

router.get(
  "/",
  getAllReports
);

export default router;