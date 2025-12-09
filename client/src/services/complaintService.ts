import type { Complaint, InsertComplaint, Block, ComplaintStatus, PaginatedResponse } from "@shared/schema";
import { apiClient } from "@/lib/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const complaintService = {
  async getAll(params?: {
    page?: number;
    pageSize?: number;
    block?: Block;
    status?: ComplaintStatus;
    search?: string;
    studentId?: string;
  }): Promise<PaginatedResponse<Complaint>> {
    return apiClient.get<PaginatedResponse<Complaint>>("/complaints", params);
  },
  
  async getById(id: string): Promise<Complaint | null> {
    try {
      const response = await apiClient.get<ApiResponse<Complaint>>(`/complaints/${id}`);
      return response.data || null;
    } catch {
      return null;
    }
  },
  
  async getByStudent(studentId: string): Promise<Complaint[]> {
    const response = await apiClient.get<ApiResponse<Complaint[]>>(`/complaints/student/${studentId}`);
    return response.data || [];
  },
  
  async create(studentId: string, data: InsertComplaint): Promise<Complaint> {
    const response = await apiClient.post<ApiResponse<Complaint>>(`/complaints/student/${studentId}`, data);
    if (!response.data) throw new Error("Failed to create complaint");
    return response.data;
  },
  
  async updateStatus(id: string, status: ComplaintStatus, adminNote?: string): Promise<Complaint> {
    const response = await apiClient.patch<ApiResponse<Complaint>>(`/complaints/${id}`, { status, adminNote });
    if (!response.data) throw new Error("Failed to update complaint status");
    return response.data;
  },
  
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/complaints/${id}`);
  },
  
  async getStats(): Promise<{ new: number; inProgress: number; resolved: number; total: number }> {
    const response = await apiClient.get<ApiResponse<{ new: number; inProgress: number; resolved: number; total: number }>>("/complaints/stats");
    return response.data || { new: 0, inProgress: 0, resolved: 0, total: 0 };
  },
};
