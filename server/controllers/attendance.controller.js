import { checkInService, checkOutService, getAttendanceService } from "../services/attendance.service.js"

export const checkIn = async(req,res)=>
{
    try {
        const attendance = await checkInService(req.user._id);

        res.status(201).json(
            {
                success:true,
                message:"Checked in successfully",
                data:attendance,
            }
        );
    } catch (error) {
        res.status(400).json(
            {
                success:false,
                message:error.message ,
            }
        )
    }
};

export const checkOut = async(req,res)=>
{
    try {
        const attendance = await checkOutService(req.user._id);

        res.status(200).json({
            success:true,
            message:"Checked out successfully",
            data:attendance,
        });
    } catch (error) {
        res.status(400).json(
            {
                success:false,
                message:error.message,
            }
        );
    }
}

export const getAttendance = async(req,res)=>
{
    try {
        const attendance = await getAttendanceService(req.user);

        res.status(200).json({
            success:true,
            data:attendance,
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}