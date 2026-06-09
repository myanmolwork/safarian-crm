import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        message:
        {
            type:String,
            trim:true,
        },
        createdAt:
        {
            type:Date,
            default:Date.now,
        },
    },
    {
        _id:false,
    }
);

const attachmentSchema = new mongoose.Schema(
    {
        url:String,
        publicId:String,
        originalName:String,
    },
    {
        _id:false,
    }
);

const taskSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
            trim:true,
        },
        description:
        {
            type:String,
            trim:true,
            default:""
        },
        assignedBy:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },
        assignedTo:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
            },
        ],

        assignedTeam:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Team",
            default:null,
        },
        priority:
        {
            type:String,
            enum:["LOW","MEDIUM","HIGH","URGENT"],
            default:"MEDIUM",
        },
        status:
        {
            type:String,
            enum:["TODO","IN_PROGRESS","UNDER_REVIEW","APPROVED",],
            default:"TODO",
        },
        deadline:
        {
            type:Date,
            required:true
        },
        attachements:[attachmentSchema],
        comments:[commentSchema],
    },
    {
        timestamps:true,
    }
);

const Task = mongoose.model("Task",taskSchema);

export default Task;