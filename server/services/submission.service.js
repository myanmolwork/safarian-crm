import Submission from "../models/Submission.js";
import Task from "../models/Task.js";
import { createNotificationService } from "./notification.service.js";
import { getIo } from "../config/socket.js";
import { createActivity } from "./activity.service.js";

export const submitWorkService = async(data,userId)=>
{
    const {taskId,files,message}=data;

    const task = await Task.findById(taskId);

    if(!task){
        throw new Error("Task not found");
    }

    const submission = await Submission.create(
        {
            taskId,
            submittedBy:userId,
            files,
            message,
        }
    )

    //move task into review

    task.status = "UNDER_REVIEW";
    await task.save();

    await createActivity({
        userId,
        action: "SUBMISSION_CREATED",
        description: `Submitted work for task: ${task.title}`,
    });

    getIo()?.emit("taskUpdated", task);

    //Notify task Creator

    await createNotificationService(
        {
            recipient:task.assignedBy,
            message:`New Submission received for task :${task.title}`,
            type:"SUBMISSION_RECEIVED",
        }
    )

    return submission;
}

export const reviewSubmissionService = async(submissionId,reviewStatus,reviewerId)=>
{
    const submission = await Submission.findById(submissionId)
    .populate("taskId");

    if(!submission)
    {
        throw new Error("Submission not found");
    }

    submission.reviewStatus = reviewStatus;
    submission.reviewedBy = reviewerId,
    submission.reviewedAt = new Date();
    await submission.save();

    //update task status
    if(reviewStatus ==="APPROVED")
    {
        submission.taskId.status = "APPROVED";
    }
    else{
        submission.taskId.status = "IN_PROGRESS";
    }

    await submission.taskId.save();

    if(reviewStatus === "APPROVED")
    {
        await createActivity({
            userId: reviewerId,
            action: "SUBMISSION_APPROVED",
            description: `Approved submission for task: ${submission.taskId.title}`,
        });
    }

    getIo()?.emit("taskUpdated", submission.taskId);

    //NOtify worker
    await createNotificationService({
        recipient:submission.submittedBy,
        message:`Your submission has been ${reviewStatus}`,
        type:"SUBMISSION_REVIEWED",
    })

    return submission;
}

export const getSubmissionsService = async(user)=>
{
    let query = {};

    //worker sees only own sub,issions
    if(user.role==="WORKER")
    {
        query.submittedBy = user._id;
    }

    const submissions = await Submission.find(query)
    .populate("taskId","title status")
    .populate("submittedBy","fullName email role")
    .populate("reviewedBy","fullName email role");

    return submissions;
}

