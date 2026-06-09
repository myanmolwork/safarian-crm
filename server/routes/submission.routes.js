import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { getSubmissions, reviewSubmission, submitWork } from "../controllers/submission.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/",roleMiddleware("WORKER"),upload.single("file"),submitWork);

router.get("/",roleMiddleware("BOSS","TEAM_LEADER","WORKER"),getSubmissions)

router.patch("/:id/review",roleMiddleware("BOSS","TEAM_LEADER"),reviewSubmission);

export default router;
