import mongoose, { Schema, Document } from "mongoose";

export interface ILeave extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  studentIdNumber: string;
  studentName: string;
  block: "A" | "B" | "C" | "D";
  roomNumber: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const leaveSchema = new Schema<ILeave>(
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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

leaveSchema.index({ studentId: 1 });
leaveSchema.index({ block: 1, status: 1 });

export const Leave = mongoose.model<ILeave>("Leave", leaveSchema);
