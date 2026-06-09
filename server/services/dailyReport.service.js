import DailyReport
from "../models/DailyReport.js";
import { createActivity }
from "./activity.service.js";

export const createReport =
async (data) => {

  const today =
  new Date()
    .toISOString()
    .split("T")[0];

  const existing =
  await DailyReport.findOne({
    employeeId:
      data.employeeId,
    date: today,
  });

  if (existing) {
    throw new Error(
      "Today's report already submitted"
    );
  }

  const report =
  await DailyReport.create({
    ...data,
    date: today,
  });

  await createActivity({
    userId: data.employeeId,
    action: "DAILY_REPORT_SUBMITTED",
    description: "Submitted daily report",
  });

  return report;
};

export const getReports =
async () => {

  return await DailyReport.find()
    .populate(
      "employeeId",
      "fullName email"
    )
    .sort({
      createdAt: -1,
    });
};
