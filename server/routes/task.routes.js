import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import { changeTaskStatus, createTask, getTasks, updateTask } from "../controllers/task.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/",roleMiddleware("BOSS","TEAM_LEADER"),createTask);

router.get("/",roleMiddleware("BOSS","TEAM_LEADER","WORKER"),getTasks);

router.put("/:id",roleMiddleware("BOSS","TEAM_LEADER"),updateTask);

router.patch("/:id/status",roleMiddleware("BOSS","TEAM_LEADER","WORKER"),changeTaskStatus);

export default router;