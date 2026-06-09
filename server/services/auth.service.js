import bcrypt from "bcrypt";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const registerUserSevice = async(data)=>
{
    const {fullName,email,password,role} = data;

    const existingUser = await User.findOne({email});

    if(existingUser)
    {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const user = await User.create(
        {
            fullName,
            email,
            password : hashedPassword,
            role,

        }
    );

    const token = generateToken(user._id);

    const safeUser = {
        _id:user._id,
        fullName:user.fullName,
        email:user.email,
        role:user.role,
    }

    return {
        user: safeUser,
        token,
    };

};

export const loginUserService = async(data)=>
{
    const {email,password} = data;

    const user = await User.findOne({email});

    if(!user){
        throw new Error("Invalid credentials")
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch)
    {
        throw new Error("Invalid credentials");
    };

    user.lastActive = new Date();

    await user.save();

    const token = generateToken(user._id);

   const safeUser = {
        _id:user._id,
        fullName:user.fullName,
        email:user.email,
        role:user.role,
    }

    return {
        user: safeUser,
        token,
    };
};
