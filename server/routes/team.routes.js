import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import { createTeam, getTeams, updateTeam } from "../controllers/team.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/",roleMiddleware("BOSS"),createTeam);

router.get("/",roleMiddleware("BOSS","TEAM_LEADER"),getTeams);

router.put("/:id",roleMiddleware("BOSS"),updateTeam);

export default router;