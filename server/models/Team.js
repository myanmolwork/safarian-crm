import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
    {
        teamName:{
            type:String,
            required:true,
            trim:true,
            unique:true,
        },
        departmentType:{
            type:String,
            enum:[
                "SOCIAL_MEDIA",
                "MARKETING",
                "CONTENT",
                "VIDEO_EDITING",
                "GRAPHIC_DESIGN",
            ],
            required:true,
        },
        leader:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },
        workers:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            }
        ],
        createdBy: {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        }
    },
    {
        timestamps:true,
    }
);

const Team = mongoose.model("Team",teamSchema);

export default Team;
