import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: string;
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  mobile: string;
  parentMobile: string;
  address: string;
  block: "A" | "B" | "C" | "D";
  roomId?: mongoose.Types.ObjectId;
  roomNumber?: string;
  bedNumber?: number;
  admissionDate: Date;
  status: "active" | "removed";
  createdAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    parentMobile: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    block: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    roomNumber: {
      type: String,
    },
    bedNumber: {
      type: Number,
    },
    admissionDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "removed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.index({ block: 1, status: 1 });

export const Student = mongoose.model<IStudent>("Student", studentSchema);
