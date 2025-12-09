import type { Block } from "@shared/schema";

let studentCounter: Record<Block, number> = {
  A: 0,
  B: 0,
  C: 0,
  D: 0,
};

export function generateStudentId(block: Block): string {
  const year = new Date().getFullYear();
  studentCounter[block]++;
  const sequence = String(studentCounter[block]).padStart(3, "0");
  return `HSTL${year}${block}${sequence}`;
}

export function parseStudentId(studentId: string): { year: number; block: Block; sequence: number } | null {
  const match = studentId.match(/^HSTL(\d{4})([A-D])(\d{3})$/);
  if (!match) return null;
  return {
    year: parseInt(match[1]),
    block: match[2] as Block,
    sequence: parseInt(match[3]),
  };
}

export function setStudentCounter(block: Block, count: number): void {
  studentCounter[block] = count;
}

export function getStudentCounter(): Record<Block, number> {
  return { ...studentCounter };
}
