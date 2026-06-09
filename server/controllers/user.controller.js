import { createUserService, getUserService, updateUserService } from "../services/user.service.js"
import sanitizeUser from "../utils/sanitizeUser.js";



export const createUser = async(req,res)=>
{
    try {
        const user = await createUserService(req.body, req.user._id);

        const safeUser = sanitizeUser(user);

        res.status(201).json({
            success:true,
            message:"User created successfully",
            data:safeUser,
        })
    } catch (error) {
        res.status(400,).json({
            success:false,
            message:error.message
        })
    }
}

export const getUsers = async(req,res)=>
{
    try {
        const users = await getUserService(req.user);

        const safeUser = users.map((user)=>
            sanitizeUser(user)
        );

        res.status(200).json({
            success:true,
            data:safeUser,
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

export const updateUser = async(req,res)=>
{
    try {
        const user = await updateUserService(
            req.params.id,
            req.body,
        )
        const safeUser = sanitizeUser(user);
        
        res.status(200).json({
            success:true,
            message:"User updated successfully",
            data:safeUser,
        })

    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message,
        })
    }
}
