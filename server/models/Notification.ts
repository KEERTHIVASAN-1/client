import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  message: string;
  targetType: "all_students" | "block_students" | "all_wardens" | "block_warden" | "individual";
  targetBlock?: "A" | "B" | "C" | "D";
  targetId?: mongoose.Types.ObjectId;
  sentBy: mongoose.Types.ObjectId;
  sentByName: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["all_students", "block_students", "all_wardens", "block_warden", "individual"],
      required: true,
    },
    targetBlock: {
      type: String,
      enum: ["A", "B", "C", "D"],
    },
    targetId: {
      type: Schema.Types.ObjectId,
    },
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sentByName: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ targetType: 1 });
notificationSchema.index({ targetBlock: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>("Notification", notificationSchema);
