import Task from "../models/Task.js";
import { createNotificationService } from "./notification.service.js";
import { getIo } from "../config/socket.js";
import { createActivity } from "./activity.service.js";

export const  createTaskService = async(data,assignedBy)=>
{
    const task = await Task.create({
        ...data,
        assignedBy
    });

    for(const userId of task.assignedTo)
    {
        await createNotificationService({
            recipient:userId,
            message:`You have been assigned a new task: ${task.title}`,
            type:"TASK_ASSIGNED",
        })
    }

    await createActivity({
        userId: assignedBy,
        action: "TASK_CREATED",
        description: `Created task: ${task.title}`,
    });

    return task;
};

export const getTasksService = async(user)=>
{
    let query = {};

    //BOSS sees evertything
    if(user.role === "BOSS")
    {
        query={};
    }
    
    // Team Leader sees team tasks
    else if(user.role==="TEAM_LEADER"){
        query = {
            $or: [
                { assignedTeam: user.teamId },
                { assignedBy: user._id },
            ],
        };
    }

    //Worker sees only own tasks
    else{
        query.assignedTo = user._id;
    }
    const tasks = await Task.find(query)
    .populate("assignedBy","fullName email")
    .populate("assignedTo","fullName email role")
    .populate("assignedTeam","teamName departmentType")

    return tasks;
};

export const updateTaskService = async (taskId,data)=>
{
    const task = await Task.findById(taskId);
    if(!task)
    {
        throw new Error("Task not found");
    }
    Object.assign(task,data);
    await task.save();
    getIo()?.emit("taskUpdated");
    return task;
}

export const changeTaskStatusService = async(taskId,status,updatedBy)=>
{
    const task = await Task.findById(taskId);

    if(!task)
    {
        throw new Error("Task not found");
    }

    task.status = status;

    await task.save();

    if(status === "APPROVED")
    {
        await createActivity({
            userId: updatedBy,
            action: "TASK_APPROVED",
            description: `Approved task: ${task.title}`,
        });
    }

    getIo()?.emit("taskUpdated", task);

    return task;
}
