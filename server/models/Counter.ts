import mongoose, { Schema, Document } from "mongoose";

export interface ICounter extends Document {
  seq: number;
}

const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model("Counter", counterSchema);

export async function getNextStudentId(block: string): Promise<string> {
  const year = new Date().getFullYear();
  const counterId = `student_${year}_${block}`;
  
  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  
  const sequence = String(counter.seq).padStart(3, "0");
  return `HSTL${year}${block}${sequence}`;
}

export async function getNextComplaintId(): Promise<string> {
  const counter = await Counter.findByIdAndUpdate(
    "complaint",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  
  return `CMPL${String(counter.seq).padStart(3, "0")}`;
}
