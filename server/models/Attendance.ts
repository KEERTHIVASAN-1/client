import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  studentIdNumber: string;
  studentName: string;
  block: "A" | "B" | "C" | "D";
  roomNumber: string;
  date: string;
  status: "present" | "absent";
  markedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentIdNumber: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    block: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },
    roomNumber: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      default: "present",
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ block: 1, date: 1 });
attendanceSchema.index({ date: 1 });

export const Attendance = mongoose.model<IAttendance>("Attendance", attendanceSchema);
