import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  _id: mongoose.Types.ObjectId;
  roomNumber: string;
  block: "A" | "B" | "C" | "D";
  floor: number;
  capacity: number;
  occupied: number;
  createdAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    roomNumber: {
      type: String,
      required: true,
    },
    block: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },
    floor: {
      type: Number,
      required: true,
      min: 0,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    occupied: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ block: 1, roomNumber: 1 }, { unique: true });

export const Room = mongoose.model<IRoom>("Room", roomSchema);
