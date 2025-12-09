import type { Fee, InsertFee, Block, FeeStatus, PaginatedResponse } from "@shared/schema";
import { apiClient } from "@/lib/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const feeService = {
  async getAll(params?: {
    page?: number;
    pageSize?: number;
    block?: Block;
    status?: FeeStatus;
    search?: string;
    studentId?: string;
  }): Promise<PaginatedResponse<Fee>> {
    return apiClient.get<PaginatedResponse<Fee>>("/fees", params);
  },
  
  async getByStudentId(studentId: string): Promise<Fee | null> {
    try {
      const response = await apiClient.get<ApiResponse<Fee>>(`/fees/student/${studentId}`);
      return response.data || null;
    } catch {
      return null;
    }
  },
  
  async create(data: InsertFee): Promise<Fee> {
    const response = await apiClient.post<ApiResponse<Fee>>("/fees", data);
    if (!response.data) throw new Error("Failed to create fee");
    return response.data;
  },
  
  async recordPayment(id: string, amount: number): Promise<Fee> {
    const response = await apiClient.patch<ApiResponse<Fee>>(`/fees/${id}/payment`, { amount });
    if (!response.data) throw new Error("Failed to record payment");
    return response.data;
  },
  
  async updateStatus(id: string, status: FeeStatus): Promise<Fee> {
    const response = await apiClient.patch<ApiResponse<Fee>>(`/fees/${id}/status`, { status });
    if (!response.data) throw new Error("Failed to update fee status");
    return response.data;
  },
  
  async update(id: string, data: { totalAmount?: number; dueDate?: string; status?: FeeStatus }): Promise<Fee> {
    const response = await apiClient.patch<ApiResponse<Fee>>(`/fees/${id}`, data);
    if (!response.data) throw new Error("Failed to update fee");
    return response.data;
  },
  
  async delete(id: string): Promise<{ id: string }> {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/fees/${id}`);
    if (!response.data) throw new Error("Failed to delete fee");
    return response.data;
  },
  
  async getStats(): Promise<{ total: number; paid: number; pending: number; overdue: number }> {
    const response = await apiClient.get<ApiResponse<{ total: number; paid: number; pending: number; overdue: number }>>("/fees/stats");
    return response.data || { total: 0, paid: 0, pending: 0, overdue: 0 };
  },
};
