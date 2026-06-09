import express from "express";

import {
  getNotifications,
  markAsRead,
  getUnreadCount,
} from "../controllers/notification.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getNotifications);

router.get(
  "/unread-count",
  getUnreadCount
);

router.patch(
  "/:id/read",
  markAsRead
);

export default router;