import mongoose from "mongoose";

const activitySchema =
new mongoose.Schema({

  userId:{
    type:
    mongoose.Schema.Types.ObjectId,

    ref:"User",
  },

  action:{
    type:String,
    required:true,
  },

  description:{
    type:String,
    required:true,
  },

},
{
  timestamps:true,
});

export default mongoose.model(
  "Activity",
  activitySchema
);