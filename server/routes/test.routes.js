import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/boss-only",authMiddleware,roleMiddleware("BOSS"),(req,res)=>
{
    res.json(
        {
            success:true,
            message:"Welcome Boss",
        }
    )
})

export default router;