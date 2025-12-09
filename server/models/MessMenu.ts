import mongoose, { Schema, Document } from "mongoose";

export interface IMessMenu extends Document {
  _id: mongoose.Types.ObjectId;
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  mealType: "breakfast" | "lunch" | "dinner";
  items: string[];
  createdAt: Date;
  updatedAt: Date;
}

const messMenuSchema = new Schema<IMessMenu>(
  {
    day: {
      type: String,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      required: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner"],
      required: true,
    },
    items: {
      type: [String],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

messMenuSchema.index({ day: 1, mealType: 1 }, { unique: true });

export const MessMenu = mongoose.model<IMessMenu>("MessMenu", messMenuSchema);
