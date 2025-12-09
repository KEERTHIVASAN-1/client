import mongoose, { Schema, Document } from "mongoose";

export interface IVisitor extends Document {
  _id: mongoose.Types.ObjectId;
  visitorName: string;
  studentId: mongoose.Types.ObjectId;
  studentIdNumber: string;
  studentName: string;
  block: "A" | "B" | "C" | "D";
  purpose: string;
  inTime: Date;
  outTime?: Date;
  createdAt: Date;
}

const visitorSchema = new Schema<IVisitor>(
  {
    visitorName: {
      type: String,
      required: true,
      trim: true,
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
    block: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    inTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    outTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

visitorSchema.index({ studentId: 1 });
visitorSchema.index({ block: 1, createdAt: -1 });

export const Visitor = mongoose.model<IVisitor>("Visitor", visitorSchema);
