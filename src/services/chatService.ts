import { apiClient } from './api';
import { StructuredClinicalAssessment } from '../types';

export const chatService = {
  async sendMessage(
    message: string,
    persona: string = 'general',
    history: Array<{ sender: 'user' | 'assistant'; content: string }> = []
  ): Promise<StructuredClinicalAssessment> {
    const response = await apiClient.post<StructuredClinicalAssessment>('/chat/message', {
      message,
      persona,
      history,
    });
    return response.data;
  },

  async uploadImage(imageBase64: string, filename: string, mimeType: string): Promise<any> {
    const response = await apiClient.post('/chat/upload-image', {
      imageBase64,
      filename,
      mimeType,
    });
    return response.data;
  },

  async getHistory(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/chat/history');
    return response.data;
  },
};

export default chatService;
