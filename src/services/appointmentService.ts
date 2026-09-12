import { apiClient } from './api';
import { Appointment, Doctor } from '../types';

export const appointmentService = {
  async getDoctors(specialty?: string, availability?: string): Promise<Doctor[]> {
    const params: Record<string, string> = {};
    if (specialty && specialty !== 'All') params.specialty = specialty;
    if (availability && availability !== 'All') params.availability = availability;

    const response = await apiClient.get<{ total: number; doctors: Doctor[] }>('/doctors', { params });
    return response.data.doctors;
  },

  async getDoctorById(id: string): Promise<Doctor> {
    const response = await apiClient.get<Doctor>(`/doctors/${id}`);
    return response.data;
  },

  async getAppointments(): Promise<Appointment[]> {
    const response = await apiClient.get<any[]>('/appointments');
    // Normalize backend documents to frontend Appointment interface
    return response.data.map((apt) => ({
      ...apt,
      id: apt.id || apt._id,
      date: apt.dateStr || apt.date,
      time: apt.timeStr || apt.time,
    }));
  },

  async bookAppointment(data: {
    doctorId: string;
    date: string;
    time: string;
    type?: 'video' | 'audio' | 'in-person';
    reason: string;
  }): Promise<Appointment> {
    const response = await apiClient.post<any>('/appointments', data);
    const apt = response.data;
    return {
      ...apt,
      id: apt.id || apt._id,
      date: apt.dateStr || apt.date,
      time: apt.timeStr || apt.time,
    };
  },

  async cancelAppointment(id: string, reason?: string): Promise<{ message: string; appointment: Appointment }> {
    const response = await apiClient.post<{ message: string; appointment: any }>(`/appointments/${id}/cancel`, {
      reason,
    });
    return {
      message: response.data.message,
      appointment: {
        ...response.data.appointment,
        id: response.data.appointment.id || response.data.appointment._id,
        date: response.data.appointment.dateStr || response.data.appointment.date,
        time: response.data.appointment.timeStr || response.data.appointment.time,
      },
    };
  },
};

export default appointmentService;
