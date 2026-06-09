import { changeTaskStatusService, createTaskService, getTasksService, updateTaskService } from "../services/task.service.js"

export const createTask = async(req,res)=>
{
    try {
        const task = await createTaskService(req.body,req.user._id);
        res.status(201).json({
            success:true,
            message:"Task created successfully",
            data:task,
        });
    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message,
        })
    }
};

export const getTasks = async(req,res)=>
{
    try {
        const tasks = await getTasksService(req.user);

        res.status(200).json({
            success:true,
            data:tasks,
        });
    } catch (error) {
        res.status(500).json(
            {
                success:false,
                message:error.message,
            }
        )
    }
}

export const updateTask = async(req,res)=>
{
    try {
       const task = await updateTaskService(req.params.id,req.body) ;
       res.status(200).json(
        {
            success:true,
            message:"Task updated successfully",
            data:task,
        }
       )
    } catch (error) {
        res.status(400).json(
            {
                success:false,
                message:error.message,
            }
        )
    }
}

export const changeTaskStatus = async(req,res)=>
{
    try {
        const task = await changeTaskStatusService(
            req.params.id,
            req.body.status,
            req.user._id
        );

        res.status(200).json(
            {
                success:true,
                message:"Task status updated",
                data:task,
            }
        );
    } catch (error) {
        res.status(400).json(
            {
                success:false,
                message:error.message,
            }
        )
    }
}
