import express from "express";
import { getCurrentUser, login, register } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  changePassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register",register);

router.post("/login",login);

router.get("/me",authMiddleware,getCurrentUser)
router.patch(
  "/change-password",
  authMiddleware,
  changePassword
);
export default router;
