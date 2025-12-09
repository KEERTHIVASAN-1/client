import type { Attendance, AttendanceRecord, Block } from "@shared/schema";
import { apiClient } from "@/lib/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const attendanceService = {
  async getByDate(date: string, block?: Block): Promise<Attendance[]> {
    const response = await apiClient.get<ApiResponse<Attendance[]>>("/attendance", { date, block });
    return response.data || [];
  },
  
  async getByStudent(studentId: string, month?: string): Promise<Attendance[]> {
    const response = await apiClient.get<ApiResponse<Attendance[]>>(`/attendance/student/${studentId}`, { month });
    return response.data || [];
  },
  
  async getStudentsForAttendance(block: Block, date: string): Promise<AttendanceRecord[]> {
    const response = await apiClient.get<ApiResponse<AttendanceRecord[]>>("/attendance/students", { block, date });
    return response.data || [];
  },
  
  async markBulkAttendance(
    block: Block,
    date: string,
    records: AttendanceRecord[],
    markedBy: string
  ): Promise<Attendance[]> {
    const response = await apiClient.post<ApiResponse<Attendance[]>>("/attendance/bulk", {
      block,
      date,
      records,
      markedBy,
    });
    return response.data || [];
  },
  
  async getStats(block?: Block, month?: string): Promise<{
    totalDays: number;
    averageAttendance: number;
    presentCount: number;
    absentCount: number;
  }> {
    const response = await apiClient.get<ApiResponse<{
      totalDays: number;
      averageAttendance: number;
      presentCount: number;
      absentCount: number;
    }>>("/attendance/stats", { block, month });
    return response.data || { totalDays: 0, averageAttendance: 0, presentCount: 0, absentCount: 0 };
  },
};
