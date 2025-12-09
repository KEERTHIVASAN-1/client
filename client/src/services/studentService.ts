import type { Student, InsertStudent, Block, PaginatedResponse } from "@shared/schema";
import { apiClient } from "@/lib/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const studentService = {
  async getAll(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    block?: Block;
    status?: string;
    feeStatus?: string;
  }): Promise<PaginatedResponse<Student>> {
    return apiClient.get<PaginatedResponse<Student>>("/students", params);
  },
  
  async getById(id: string): Promise<Student | null> {
    try {
      const response = await apiClient.get<ApiResponse<Student>>(`/students/${id}`);
      return response.data || null;
    } catch {
      return null;
    }
  },
  
  async getByBlock(block: Block): Promise<Student[]> {
    const response = await apiClient.get<ApiResponse<Student[]>>(`/students/block/${block}`);
    return response.data || [];
  },
  
  async create(data: InsertStudent): Promise<Student> {
    const response = await apiClient.post<ApiResponse<Student>>("/students", data);
    if (!response.data) throw new Error("Failed to create student");
    return response.data;
  },
  
  async update(id: string, data: Partial<InsertStudent>): Promise<Student> {
    const response = await apiClient.patch<ApiResponse<Student>>(`/students/${id}`, data);
    if (!response.data) throw new Error("Failed to update student");
    return response.data;
  },
  
  async allocateRoom(studentId: string, roomId: string, roomNumber: string, bedNumber: number): Promise<Student> {
    const response = await apiClient.post<ApiResponse<Student>>(`/students/${studentId}/allocate-room`, {
      roomId,
      roomNumber,
      bedNumber,
    });
    if (!response.data) throw new Error("Failed to allocate room");
    return response.data;
  },
  
  async removeFromHostel(id: string): Promise<Student> {
    const response = await apiClient.delete<ApiResponse<Student>>(`/students/${id}`);
    if (!response.data) throw new Error("Failed to remove student");
    return response.data;
  },
  
  async searchByStudentId(studentId: string): Promise<Student | null> {
    try {
      const response = await apiClient.get<ApiResponse<Student>>(`/students/search/${studentId}`);
      return response.data || null;
    } catch {
      return null;
    }
  },
};
