import bcrypt from "bcrypt";
import User from "../models/User.js";
import { createActivity } from "./activity.service.js";

export const createUserService = async (data, createdBy)=>
{
    const {
        fullName,
        email,
        password,
        role,
        phoneNumber,
        teamId,
    } = data;

    const existingUser = await User.findOne({email});

    if(existingUser){
        throw new Error("User already exists.")
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const user = await User.create({
        fullName,
        email,
        password:hashedPassword,
        role,
        phoneNumber,
        teamId,
    });

    await createActivity({
        userId: createdBy,
        action: "EMPLOYEE_CREATED",
        description: `Created employee: ${user.fullName}`,
    });

    return user;
}

export const getUserService = async(user)=>
{
    const query = user?.role === "TEAM_LEADER"
        ? {
            $or: [
                { teamId: user.teamId },
                { _id: user._id },
            ],
        }
        : {};

    const users = await User.find(query)
    .select("-password")
    .populate("teamId","teamName departmentType");

    return users;
}

export const updateUserService = async(userId, data)=>
{
    const user = await User.findById(userId);

    if(!user)
    {
        throw new Error("User not found");
    }

    delete data.password;

    Object.assign(user,data);

    await user.save();

    return user;
}
