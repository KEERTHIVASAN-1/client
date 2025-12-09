import mongoose, { Schema, Document } from "mongoose";

export interface IWarden extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  mobile: string;
  block: "A" | "B" | "C" | "D";
  createdAt: Date;
}

const wardenSchema = new Schema<IWarden>(
  {
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
    block: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Warden = mongoose.model<IWarden>("Warden", wardenSchema);
