import type { Warden, InsertWarden, Block } from "@shared/schema";
import { apiClient } from "@/lib/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const wardenService = {
  async getAll(): Promise<Warden[]> {
    const response = await apiClient.get<ApiResponse<Warden[]>>("/wardens");
    return response.data || [];
  },
  
  async getById(id: string): Promise<Warden | null> {
    try {
      const response = await apiClient.get<ApiResponse<Warden>>(`/wardens/${id}`);
      return response.data || null;
    } catch {
      return null;
    }
  },
  
  async getByBlock(block: Block): Promise<Warden | null> {
    try {
      const response = await apiClient.get<ApiResponse<Warden>>(`/wardens/block/${block}`);
      return response.data || null;
    } catch {
      return null;
    }
  },
  
  async create(data: InsertWarden): Promise<Warden> {
    const response = await apiClient.post<ApiResponse<Warden>>("/wardens", data);
    if (!response.data) throw new Error("Failed to create warden");
    return response.data;
  },
  
  async update(id: string, data: Partial<InsertWarden>): Promise<Warden> {
    const response = await apiClient.patch<ApiResponse<Warden>>(`/wardens/${id}`, data);
    if (!response.data) throw new Error("Failed to update warden");
    return response.data;
  },
  
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/wardens/${id}`);
  },
};
