import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { uploadFile } from "../controllers/upload.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/",upload.single("file"),uploadFile);

export default router;