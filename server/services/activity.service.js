import Activity
from "../models/Activity.js";

export const createActivity =
async ({
  userId,
  action,
  description,
}) => {

  return await Activity.create({
    userId,
    action,
    description,
  });
};

export const getActivities =
async () => {

  return await Activity.find()
    .populate(
      "userId",
      "fullName"
    )
    .sort({
      createdAt:-1,
    })
    .limit(100);
};