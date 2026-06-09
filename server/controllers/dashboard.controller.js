import User from "../models/User.js";
import Task from "../models/Task.js";
import Team from "../models/Team.js";
import Attendance from "../models/Attendance.js";

export const getDashboardStats =
  async (req, res) => {
    try {
      const totalEmployees =
        await User.countDocuments();

      const totalTeams =
        await Team.countDocuments();

      const totalTasks =
        await Task.countDocuments();

      const completedTasks =
        await Task.countDocuments({
          status: "APPROVED",
        });

      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      const attendanceToday =
        await Attendance.countDocuments({
          date: today,
        });

      res.status(200).json({
        success: true,

        data: {
          totalEmployees,
          totalTeams,
          totalTasks,
          completedTasks,
          attendanceToday,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };