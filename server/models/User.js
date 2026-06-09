import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullName:{
            type:String,
            required:true,
            trim:true,
        },

        email:
        {
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        password:
        {
            type:String,
            required:true,
            minLength:6,
        },
        role:
        {
            type:String,
            enum:["BOSS","TEAM_LEADER","WORKER"],
            default:"WORKER",
        },
        teamId:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Team",
            default:null,
        },
        profileImage:
        {
            url:String,
            publicId:String,
        },
        phoneNumber:
        {
            type:String,
            default:"",
        },
        isActive:
        {
            type:Boolean,
            default:true
        },
        lastActive:
        {
            type:Date,
            default:Date.now,
        },

        //future ready archietecture
        permission:
        {
            type:[String],
            default:[],
        }
    },
    {
        timestamps:true,
    }
)

const User = mongoose.model("User",userSchema);

export default User;
