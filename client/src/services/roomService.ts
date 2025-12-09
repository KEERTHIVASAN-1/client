import type { Room, InsertRoom, Block, PaginatedResponse } from "@shared/schema";
import { apiClient } from "@/lib/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const roomService = {
  async getAll(params?: {
    page?: number;
    pageSize?: number;
    block?: Block;
    search?: string;
  }): Promise<PaginatedResponse<Room>> {
    return apiClient.get<PaginatedResponse<Room>>("/rooms", params);
  },
  
  async getById(id: string): Promise<Room | null> {
    try {
      const response = await apiClient.get<ApiResponse<Room>>(`/rooms/${id}`);
      return response.data || null;
    } catch {
      return null;
    }
  },
  
  async getByBlock(block: Block): Promise<Room[]> {
    const response = await apiClient.get<ApiResponse<Room[]>>(`/rooms/block/${block}`);
    return response.data || [];
  },
  
  async getAvailable(block?: Block): Promise<Room[]> {
    const response = await apiClient.get<ApiResponse<Room[]>>("/rooms/available", { block });
    return response.data || [];
  },
  
  async create(data: InsertRoom): Promise<Room> {
    const response = await apiClient.post<ApiResponse<Room>>("/rooms", data);
    if (!response.data) throw new Error("Failed to create room");
    return response.data;
  },
  
  async update(id: string, data: Partial<InsertRoom>): Promise<Room> {
    const response = await apiClient.patch<ApiResponse<Room>>(`/rooms/${id}`, data);
    if (!response.data) throw new Error("Failed to update room");
    return response.data;
  },
  
  async updateOccupancy(id: string, occupied: number): Promise<Room> {
    const response = await apiClient.patch<ApiResponse<Room>>(`/rooms/${id}/occupancy`, { occupied });
    if (!response.data) throw new Error("Failed to update room occupancy");
    return response.data;
  },
  
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/rooms/${id}`);
  },
};
