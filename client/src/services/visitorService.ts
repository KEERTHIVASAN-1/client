import type { Visitor, InsertVisitor, Block, PaginatedResponse } from "@shared/schema";
import { apiClient } from "@/lib/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const visitorService = {
  async getAll(params?: {
    page?: number;
    pageSize?: number;
    block?: Block;
    date?: string;
    search?: string;
    studentId?: string;
  }): Promise<PaginatedResponse<Visitor>> {
    return apiClient.get<PaginatedResponse<Visitor>>("/visitors", params);
  },
  
  async getByStudent(studentId: string): Promise<Visitor[]> {
    const response = await apiClient.get<ApiResponse<Visitor[]>>(`/visitors/student/${studentId}`);
    return response.data || [];
  },
  
  async checkIn(data: InsertVisitor): Promise<Visitor> {
    const response = await apiClient.post<ApiResponse<Visitor>>("/visitors", data);
    if (!response.data) throw new Error("Failed to check in visitor");
    return response.data;
  },
  
  async checkOut(id: string): Promise<Visitor> {
    const response = await apiClient.patch<ApiResponse<Visitor>>(`/visitors/${id}/checkout`);
    if (!response.data) throw new Error("Failed to check out visitor");
    return response.data;
  },
  
  async getTodayByBlock(block: Block): Promise<Visitor[]> {
    const response = await apiClient.get<ApiResponse<Visitor[]>>(`/visitors/today/${block}`);
    return response.data || [];
  },
  
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/visitors/${id}`);
  },
};
