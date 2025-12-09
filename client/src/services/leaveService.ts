import type { Leave, InsertLeave, Block, LeaveStatus, PaginatedResponse } from "@shared/schema";
import { apiClient } from "@/lib/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const leaveService = {
  async getAll(params?: {
    page?: number;
    pageSize?: number;
    block?: Block;
    status?: LeaveStatus;
    search?: string;
    studentId?: string;
  }): Promise<PaginatedResponse<Leave>> {
    return apiClient.get<PaginatedResponse<Leave>>("/leaves", params);
  },
  
  async getByStudent(studentId: string): Promise<Leave[]> {
    const response = await apiClient.get<ApiResponse<Leave[]>>(`/leaves/student/${studentId}`);
    return response.data || [];
  },
  
  async create(studentId: string, data: InsertLeave): Promise<Leave> {
    const response = await apiClient.post<ApiResponse<Leave>>(`/leaves/student/${studentId}`, data);
    if (!response.data) throw new Error("Failed to create leave request");
    return response.data;
  },
  
  async updateStatus(id: string, status: LeaveStatus): Promise<Leave> {
    const response = await apiClient.patch<ApiResponse<Leave>>(`/leaves/${id}`, { status });
    if (!response.data) throw new Error("Failed to update leave status");
    return response.data;
  },
  
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/leaves/${id}`);
  },
  async getPendingByBlock(block: Block): Promise<Leave[]> {
    const response = await apiClient.get<ApiResponse<Leave[]>>(`/leaves/pending/${block}`);
    return response.data || [];
  },
};
