import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    totalHours: {
      type: Number,
      default: 0,
    },

    workStatus: {
      type: String,
      enum: ["ACTIVE", "BREAK", "OFFLINE"],
      default: "ACTIVE",
    },

    date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple attendance records per day
attendanceSchema.index(
  { userId: 1, date: 1 },
  { unique: true }
);

const Attendance = mongoose.model(
  "Attendance",
  attendanceSchema
);

export default Attendance;