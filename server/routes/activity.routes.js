import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getActivities } from "../services/activity.service.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const activities =
      await getActivities();

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;