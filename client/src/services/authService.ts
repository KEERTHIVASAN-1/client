import type { AuthUser, UserRole } from "@shared/schema";
import { apiClient } from "@/lib/api";

interface LoginResponse {
  success: boolean;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  async login(email: string, password: string, role: UserRole): Promise<AuthUser> {
    const response = await apiClient.post<LoginResponse>("/auth/login", {
      email,
      password,
      role,
    });
    
    if (response.data) {
      apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data.user;
    }
    
    throw new Error("Login failed");
  },
  
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      apiClient.clearTokens();
    }
  },
  
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: AuthUser }>("/auth/me");
      return response.data || null;
    } catch {
      return null;
    }
  },
};
