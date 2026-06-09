import mongoose from "mongoose";

const dailyReportSchema =
new mongoose.Schema(
{
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  workDone: {
    type: String,
    required: true,
  },

  blockers: {
    type: String,
    default: "",
  },

  tomorrowPlan: {
    type: String,
    default: "",
  },

  date: {
    type: String,
    required: true,
  },
},
{
  timestamps: true,
}
);

export default mongoose.model(
  "DailyReport",
  dailyReportSchema
);