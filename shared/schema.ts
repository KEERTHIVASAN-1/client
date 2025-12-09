import { z } from "zod";

// ==========================================
// ENUMS AND CONSTANTS
// ==========================================
export const BLOCKS = ["A", "B", "C", "D"] as const;
export type Block = (typeof BLOCKS)[number];

export const USER_ROLES = ["admin", "warden", "student"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const COMPLAINT_STATUS = ["new", "in_progress", "resolved"] as const;
export type ComplaintStatus = (typeof COMPLAINT_STATUS)[number];

export const COMPLAINT_CATEGORIES = ["mess", "room", "cleanliness", "safety", "other"] as const;
export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

export const LEAVE_STATUS = ["pending", "approved", "rejected"] as const;
export type LeaveStatus = (typeof LEAVE_STATUS)[number];

export const FEE_STATUS = ["paid", "pending", "overdue"] as const;
export type FeeStatus = (typeof FEE_STATUS)[number];

export const ATTENDANCE_STATUS = ["present", "absent"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[number];

export const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

// ==========================================
// USER SCHEMAS
// ==========================================
export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  mobile: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  mobile: string;
  block?: Block;
  studentId?: string;
}

// ==========================================
// WARDEN SCHEMAS
// ==========================================
export interface Warden {
  id: string;
  userId: string;
  name: string;
  email: string;
  mobile: string;
  block: Block;
  createdAt: string;
}

export const insertWardenSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  block: z.enum(BLOCKS, { required_error: "Block is required" }),
});

export type InsertWarden = z.infer<typeof insertWardenSchema>;

// ==========================================
// STUDENT SCHEMAS
// ==========================================
export interface Student {
  id: string;
  studentId: string; // Auto-generated: HSTL2025A001
  userId: string;
  name: string;
  email: string;
  mobile: string;
  parentMobile: string;
  address: string;
  block: Block;
  roomId?: string;
  roomNumber?: string;
  bedNumber?: number;
  admissionDate: string;
  status: "active" | "removed";
  createdAt: string;
}

export const insertStudentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  parentMobile: z.string().min(10, "Parent mobile must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  block: z.enum(BLOCKS, { required_error: "Block is required" }),
  admissionDate: z.string().min(1, "Admission date is required"),
  roomId: z.string().optional(),
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;

// ==========================================
// ROOM SCHEMAS
// ==========================================
export interface Room {
  id: string;
  roomNumber: string;
  block: Block;
  floor: number;
  capacity: number;
  occupied: number;
  createdAt: string;
}

export const insertRoomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  block: z.enum(BLOCKS, { required_error: "Block is required" }),
  floor: z.number().min(0, "Floor must be 0 or greater"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
});

export type InsertRoom = z.infer<typeof insertRoomSchema>;

// ==========================================
// FEE SCHEMAS
// ==========================================
export interface Fee {
  id: string;
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  block: Block;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: FeeStatus;
  createdAt: string;
}

export const insertFeeSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  totalAmount: z.number().min(0, "Amount must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
});

export type InsertFee = z.infer<typeof insertFeeSchema>;

// ==========================================
// ATTENDANCE SCHEMAS
// ==========================================
export interface Attendance {
  id: string;
  studentId: string;
  studentIdNumber: string;
  studentName: string;
  block: Block;
  roomNumber: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
  createdAt: string;
}

export interface AttendanceRecord {
  studentId: string;
  studentIdNumber: string;
  studentName: string;
  roomNumber: string;
  status: AttendanceStatus;
}

// ==========================================
// LEAVE SCHEMAS
// ==========================================
export interface Leave {
  id: string;
  studentId: string;
  studentIdNumber: string;
  studentName: string;
  block: Block;
  roomNumber: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  createdAt: string;
}

export const insertLeaveSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

export type InsertLeave = z.infer<typeof insertLeaveSchema>;

// ==========================================
// VISITOR SCHEMAS
// ==========================================
export interface Visitor {
  id: string;
  visitorName: string;
  studentId: string;
  studentIdNumber: string;
  studentName: string;
  block: Block;
  purpose: string;
  inTime: string;
  outTime?: string;
  createdAt: string;
}

export const insertVisitorSchema = z.object({
  visitorName: z.string().min(2, "Visitor name is required"),
  studentIdNumber: z.string().min(1, "Student ID is required"),
  purpose: z.string().min(5, "Purpose must be at least 5 characters"),
});

export type InsertVisitor = z.infer<typeof insertVisitorSchema>;

// ==========================================
// COMPLAINT SCHEMAS
// ==========================================
export interface Complaint {
  id: string;
  complaintId: string; // UI-generated: CMPL001
  studentId: string;
  studentIdNumber: string;
  studentName: string;
  studentMobile: string;
  block: Block;
  roomNumber: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  status: ComplaintStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export const insertComplaintSchema = z.object({
  category: z.enum(COMPLAINT_CATEGORIES, { required_error: "Category is required" }),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

export type InsertComplaint = z.infer<typeof insertComplaintSchema>;

// ==========================================
// NOTIFICATION SCHEMAS
// ==========================================
export interface Notification {
  id: string;
  title: string;
  message: string;
  targetType: "all_students" | "block_students" | "all_wardens" | "block_warden" | "individual";
  targetBlock?: Block;
  targetId?: string;
  sentBy: string;
  sentByName: string;
  createdAt: string;
  read: boolean;
}

export const insertNotificationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  targetType: z.enum(["all_students", "block_students", "all_wardens", "block_warden", "individual"]),
  targetBlock: z.enum(BLOCKS).optional(),
  targetId: z.string().optional(),
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// ==========================================
// MESS MENU SCHEMAS
// ==========================================
export interface MessMenuItem {
  id: string;
  day: DayOfWeek;
  mealType: MealType;
  items: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MessMenu {
  [key: string]: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
  };
}

export const insertMessMenuItemSchema = z.object({
  day: z.enum(DAYS_OF_WEEK),
  mealType: z.enum(MEAL_TYPES),
  items: z.array(z.string()).min(1, "At least one item is required"),
});

export type InsertMessMenuItem = z.infer<typeof insertMessMenuItemSchema>;

// ==========================================
// DASHBOARD STATS SCHEMAS
// ==========================================
export interface AdminDashboardStats {
  totalStudents: number;
  totalRooms: number;
  availableBeds: number;
  pendingFees: number;
  todayAttendancePercentage: number;
  visitorCountToday: number;
  activeLeaveRequests: number;
  openComplaints: number;
  blockStats: {
    block: Block;
    studentCount: number;
    roomCount: number;
    wardenName: string;
    wardenMobile: string;
  }[];
}

export interface WardenDashboardStats {
  block: Block;
  totalStudents: number;
  totalRooms: number;
  presentToday: number;
  absentToday: number;
  pendingAttendance: number;
  activeLeaves: number;
  visitorsToday: number;
}

export interface StudentDashboardStats {
  studentId: string;
  name: string;
  block: Block;
  roomNumber: string;
  floor: number;
  bedNumber: number;
  roommates: string[];
  wardenName: string;
  wardenMobile: string;
  totalFee: number;
  paidFee: number;
  pendingFee: number;
  dueDate: string;
  todayAttendance: AttendanceStatus | "not_marked";
  monthlyAttendancePercentage: number;
  totalLeaves: number;
  pendingLeaves: number;
  unreadNotifications: number;
}

// ==========================================
// CHART DATA SCHEMAS
// ==========================================
export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface MonthlyChartData {
  month: string;
  attendance: number;
  fees: number;
  occupancy: number;
  visitors: number;
  complaints: number;
}

// ==========================================
// API RESPONSE SCHEMAS
// ==========================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Keep existing user schema for compatibility
export const users = {
  id: "",
  username: "",
  password: "",
};

export const insertUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
