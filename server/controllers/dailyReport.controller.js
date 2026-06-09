import {
  createReport,
  getReports,
}
from "../services/dailyReport.service.js";

export const submitReport =
async (req,res) => {

  try {

    const report =
    await createReport({
      employeeId:
        req.user.id,

      ...req.body,
    });

    res.status(201).json({
      success:true,
      data:report,
    });

  } catch(error){

    res.status(400).json({
      success:false,
      message:error.message,
    });

  }
};

export const getAllReports =
async (req,res) => {

  try {

    const reports =
    await getReports();

    res.status(200).json({
      success:true,
      data:reports,
    });

  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }
};