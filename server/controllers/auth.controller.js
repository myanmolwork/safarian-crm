import { loginUserService, registerUserSevice } from "../services/auth.service.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
export const register = async(req,res) =>
{
    try {
        const result = await registerUserSevice(req.body);

        res.status(201).json({
            success:true,
            message:"User registered successfully",
            data:result,
        });
    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message,
        });
    }
};

export const login = async(req,res) =>
{
    try {
        const result = await loginUserService(req.body);

        res.status(200).json(
            {
                success:true,
                message:"Login successful",
                data:result,
            }
        );
    } catch (error) {
        res.status(401).json({
            success:false,
            message:error.message,
        })
    }
};

export const getCurrentUser = async(req,res)=>{
    try {
        res.status(200).json({
            success:true,
            data:req.user,
        })
    } catch (error) {
        res.status(500).json(
            {
                success:false,
                message:error.message,
            }
        )
    }
}

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } =
      req.body;

    const user =
      await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    user.password =
      hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password updated successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
