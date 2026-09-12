import { apiClient } from './api';
import { PrescriptionData } from '../types';

export const prescriptionService = {
  async getPrescriptions(): Promise<PrescriptionData[]> {
    const response = await apiClient.get<any[]>('/prescriptions');
    return response.data.map((rx) => ({
      ...rx,
      prescriptionId: rx.prescriptionId || rx._id,
      date: rx.issuedAt ? new Date(rx.issuedAt).toLocaleDateString() : new Date().toLocaleDateString(),
    }));
  },

  async getPrescriptionById(id: string): Promise<PrescriptionData> {
    const response = await apiClient.get<any>(`/prescriptions/${id}`);
    const rx = response.data;
    return {
      ...rx,
      prescriptionId: rx.prescriptionId || rx._id,
      date: rx.issuedAt ? new Date(rx.issuedAt).toLocaleDateString() : new Date().toLocaleDateString(),
    };
  },

  async issuePrescription(data: Partial<PrescriptionData> & { patientId: string }): Promise<PrescriptionData> {
    const response = await apiClient.post<any>('/prescriptions', data);
    const rx = response.data;
    return {
      ...rx,
      prescriptionId: rx.prescriptionId || rx._id,
      date: rx.issuedAt ? new Date(rx.issuedAt).toLocaleDateString() : new Date().toLocaleDateString(),
    };
  },
};

export default prescriptionService;
