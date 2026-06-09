import Attendance from "../models/Attendance.js";
import { createActivity } from "./activity.service.js";

export const checkInService = async(userId)=>
{
    const today = new Date()
    .toISOString()
    .split("T")[0];

    const existingAttendance = await Attendance.findOne({
        userId,
        date:today,
    });

    if(existingAttendance)
    {
        throw new Error("You have already checked in today");
    }

    const attendance = await Attendance.create(
        {
            userId,
            checkIn:new Date(),
            date:today,
            workStatus:"ACTIVE",
        }
    );

    await createActivity({
        userId,
        action: "ATTENDANCE_CHECK_IN",
        description: "Checked in for work",
    });

    return attendance;
}

export const checkOutService = async(userId)=>
{
    const today = new Date()
    .toISOString()
    .split("T")[0];

    const attendance = await Attendance.findOne(
        {
            userId,
            date:today,
        }
    );

    if(!attendance){
        throw new Error("Attendance record not found");
    }

    if(attendance.checkOut)
    {
        throw new Error("You have already check out");
    }

    attendance.checkOut = new Date();

    const totalMilliseconds = attendance.checkOut - attendance.checkIn;

    attendance.totalHours = Number((totalMilliseconds/(1000*60*60)).toFixed(2));

    attendance.workStatus = "OFFLINE";

    await attendance.save();

    await createActivity({
        userId,
        action: "ATTENDANCE_CHECK_OUT",
        description: "Checked out from work",
    });

    return attendance;
}

export const getAttendanceService = async(user)=>
{
    let query = {};

    //BOSS sess all attendance
    if(user.role === "BOSS")
    {
        query = {};
    }

    //TEam leader sees own team attendance 
    else if(user.role === "TEAM_LEADER")
    {
        query = {
            userId:{
                $in:user.teamId?.workers || [],
            },
        }
    }

    //Worker sees own attendance
    else{
        query.userId = user._id;
    }

    const attendance = await Attendance.find(query)
    .populate("userId","fullName email role")
    .sort({createdAt:-1});

    return attendance;

    //
}
