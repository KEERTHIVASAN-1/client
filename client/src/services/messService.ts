import type { MessMenuItem, DayOfWeek, MealType, MessMenu } from "@shared/schema";
import { apiClient } from "@/lib/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const messService = {
  async getAll(): Promise<MessMenuItem[]> {
    const response = await apiClient.get<ApiResponse<MessMenuItem[]>>("/mess");
    return response.data || [];
  },
  
  async getWeeklyMenu(): Promise<MessMenu> {
    const response = await apiClient.get<ApiResponse<MessMenu>>("/mess/weekly");
    return response.data || {};
  },
  
  async getByDay(day: DayOfWeek): Promise<MessMenuItem[]> {
    const response = await apiClient.get<ApiResponse<MessMenuItem[]>>(`/mess/day/${day}`);
    return response.data || [];
  },
  
  async getToday(): Promise<MessMenuItem[]> {
    const response = await apiClient.get<ApiResponse<MessMenuItem[]>>("/mess/today");
    return response.data || [];
  },
  
  async update(day: DayOfWeek, mealType: MealType, items: string[]): Promise<MessMenuItem> {
    const response = await apiClient.put<ApiResponse<MessMenuItem>>("/mess", { day, mealType, items });
    if (!response.data) throw new Error("Failed to update menu");
    return response.data;
  },
  
  async updateWeeklyMenu(menu: MessMenu): Promise<void> {
    await apiClient.put("/mess/weekly", { menu });
  },
};
