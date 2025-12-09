import type { Notification, InsertNotification, Block, PaginatedResponse } from "@shared/schema";
import { apiClient } from "@/lib/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const notificationService = {
  async getAll(params?: {
    page?: number;
    pageSize?: number;
    targetType?: string;
  }): Promise<PaginatedResponse<Notification>> {
    return apiClient.get<PaginatedResponse<Notification>>("/notifications", params);
  },
  
  async getForStudent(studentId: string, block: Block): Promise<Notification[]> {
    const response = await apiClient.get<ApiResponse<Notification[]>>(`/notifications/student/${studentId}/${block}`);
    return response.data || [];
  },
  
  async getForWarden(wardenId: string, block: Block): Promise<Notification[]> {
    const response = await apiClient.get<ApiResponse<Notification[]>>(`/notifications/warden/${block}`);
    return response.data || [];
  },
  
  async create(data: InsertNotification, sentBy: string, sentByName: string): Promise<Notification> {
    const response = await apiClient.post<ApiResponse<Notification>>("/notifications", {
      ...data,
      sentBy,
      sentByName,
    });
    if (!response.data) throw new Error("Failed to create notification");
    return response.data;
  },
  
  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    if (!response.data) throw new Error("Failed to mark notification as read");
    return response.data;
  },
  
  async markAllAsRead(userId: string): Promise<void> {
    await apiClient.patch("/notifications/read-all");
  },
  
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },
  
  async getUnreadCount(userId: string, block?: Block): Promise<number> {
    const response = await apiClient.get<ApiResponse<number>>("/notifications/unread-count", { userId, block });
    return response.data || 0;
  },
};
