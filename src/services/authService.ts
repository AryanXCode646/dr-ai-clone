import { apiClient } from './api';
import { UserProfile } from '../types';

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export const authService = {
  async register(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  async getMe(): Promise<{ user: UserProfile }> {
    const response = await apiClient.get<{ user: UserProfile }>('/auth/me');
    return response.data;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<{ user: UserProfile }> {
    const response = await apiClient.put<{ user: UserProfile }>('/auth/profile', updates);
    return response.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
  },
};

export default authService;
