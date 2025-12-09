import type { AdminDashboardStats, WardenDashboardStats, StudentDashboardStats, MonthlyChartData, Block } from "@shared/schema";
import { apiClient } from "@/lib/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const dashboardService = {
  async getAdminStats(): Promise<AdminDashboardStats> {
    const response = await apiClient.get<ApiResponse<AdminDashboardStats>>("/dashboard/admin");
    return response.data || {
      totalStudents: 0,
      totalRooms: 0,
      availableBeds: 0,
      pendingFees: 0,
      todayAttendancePercentage: 0,
      visitorCountToday: 0,
      activeLeaveRequests: 0,
      openComplaints: 0,
      blockStats: [],
    };
  },
  
  async getWardenStats(block: Block): Promise<WardenDashboardStats> {
    const response = await apiClient.get<ApiResponse<WardenDashboardStats>>("/dashboard/warden", { block });
    return response.data || {
      block,
      totalStudents: 0,
      totalRooms: 0,
      presentToday: 0,
      absentToday: 0,
      pendingAttendance: 0,
      activeLeaves: 0,
      visitorsToday: 0,
    };
  },
  
  async getStudentStats(studentId: string): Promise<StudentDashboardStats | null> {
    try {
      const response = await apiClient.get<ApiResponse<StudentDashboardStats>>(`/dashboard/student/${studentId}`);
      return response.data || null;
    } catch {
      return null;
    }
  },
  
  async getMonthlyChartData(): Promise<MonthlyChartData[]> {
    const response = await apiClient.get<ApiResponse<MonthlyChartData[]>>("/dashboard/monthly");
    return response.data || [];
  },
};
