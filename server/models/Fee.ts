import mongoose, { Schema, Document } from "mongoose";

export interface IFee extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentIdNumber: string;
  block: "A" | "B" | "C" | "D";
  totalAmount: number;
  paidAmount: number;
  dueDate: Date;
  status: "paid" | "pending" | "overdue";
  createdAt: Date;
}

const feeSchema = new Schema<IFee>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentIdNumber: {
      type: String,
      required: true,
    },
    block: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "pending", "overdue"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

feeSchema.index({ studentId: 1 });
feeSchema.index({ studentIdNumber: 1 });
feeSchema.index({ status: 1 });

export const Fee = mongoose.model<IFee>("Fee", feeSchema);
