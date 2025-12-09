import mongoose, { Schema, Document } from "mongoose";

export interface IComplaint extends Document {
  _id: mongoose.Types.ObjectId;
  complaintId: string;
  studentId: mongoose.Types.ObjectId;
  studentIdNumber: string;
  studentName: string;
  studentMobile: string;
  block: "A" | "B" | "C" | "D";
  roomNumber: string;
  category: "mess" | "room" | "cleanliness" | "safety" | "other";
  title: string;
  description: string;
  status: "new" | "in_progress" | "resolved";
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
    },
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
    studentMobile: {
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
      required: true,
    },
    category: {
      type: String,
      enum: ["mess", "room", "cleanliness", "safety", "other"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "in_progress", "resolved"],
      default: "new",
    },
    adminNote: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

complaintSchema.index({ studentId: 1 });
complaintSchema.index({ status: 1 });

export const Complaint = mongoose.model<IComplaint>("Complaint", complaintSchema);
