import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import { createUser, getUsers, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/",roleMiddleware("BOSS"),createUser);

router.get("/",roleMiddleware("BOSS","TEAM_LEADER"),getUsers);

router.put("/:id",roleMiddleware("BOSS"),updateUser);

export default router;
