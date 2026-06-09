import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
    {
        url:String,
        publicId:String,
        originalName:String,
        mimetype:String,
        size:Number,
    },
    {
        _id:false,
    }
)

const submissionSchema = new mongoose.Schema(
    {
        taskId:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Task",
            required:true,
        },
        submittedBy:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        files:[fileSchema],
        message:
        {
            type:String,
            trim:true,
            default:"",
        },
        reviewStatus:{
            type:String,
            enum: ["PENDING","APPROVED","REVISION_REQUIRED"],
            default:"PENDING"
        },
        reviewedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            default:null,
        },
        reviewedAt:
        {
            type:Date,
            default:null,
        }
    },
    {
        timestamps:true,
    }
)
const Submission = mongoose.model(
  "Submission",
  submissionSchema
);

export default Submission;
