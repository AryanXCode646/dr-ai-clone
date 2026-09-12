import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Doctor, Appointment } from '../types';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from './AuthContext';

export type { Doctor, Appointment };

export interface AppointmentContextType {
  doctors: Doctor[];
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  bookAppointment: (data: {
    doctorId: string;
    date: string;
    time: string;
    type?: 'video' | 'audio' | 'in-person';
    reason: string;
  }) => Promise<Appointment>;
  cancelAppointment: (id: string, reason?: string) => Promise<void>;
  refreshAppointments: () => Promise<void>;
  activeCall: Appointment | null;
  startCall: (appointment: Appointment) => void;
  endCall: () => void;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Johnson, MD',
    specialty: 'General Physician & Telehealth',
    title: 'Senior Attending Physician (Demo Profile)',
    experienceYears: 14,
    rating: 4.9,
    reviewsCount: 342,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=80',
    availability: 'Available Now',
    languages: ['English', 'Spanish'],
    fee: 49,
    education: 'Simulated Credential • Demo Profile',
    hospital: 'Johns Hopkins Hospital (Demo Affiliate)',
    about: 'Specialist in preventive medicine, acute symptom diagnosis, and digital health triage (Demo Provider).',
    verificationStatus: 'demo_provider',
    licenseNumber: 'DEMO-MD-849204',
    isDemo: true,
    nextSlot: 'Today, 2:30 PM',
    availableSlots: [
      { date: 'Today', times: ['2:30 PM', '3:00 PM', '4:15 PM', '5:00 PM'] },
      { date: 'Tomorrow', times: ['10:00 AM', '11:30 AM', '2:00 PM', '4:00 PM'] },
    ],
  },
  {
    id: 'doc-2',
    name: 'Dr. Michael Chen, MD, FACC',
    specialty: 'Cardiologist & Vascular Care',
    title: 'Chief of Cardiovascular Health (Demo Profile)',
    experienceYears: 16,
    rating: 4.95,
    reviewsCount: 489,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80',
    availability: 'Today',
    languages: ['English', 'Mandarin'],
    fee: 75,
    education: 'Simulated Credential • Demo Profile',
    hospital: 'Mount Sinai Hospital (Demo Affiliate)',
    about: 'Cardiologist specializing in hypertension, arrhythmias, and remote cardiac monitoring (Demo Provider).',
    verificationStatus: 'demo_provider',
    licenseNumber: 'DEMO-MD-991204',
    isDemo: true,
    nextSlot: 'Today, 4:00 PM',
    availableSlots: [
      { date: 'Today', times: ['4:00 PM', '4:45 PM', '6:00 PM'] },
      { date: 'Tomorrow', times: ['9:00 AM', '10:30 AM', '1:30 PM'] },
    ],
  },
  {
    id: 'doc-3',
    name: 'Dr. Emily Rodriguez, MD, FAAP',
    specialty: 'Pediatrician & Adolescent Medicine',
    title: 'Pediatric Care Director (Demo Profile)',
    experienceYears: 11,
    rating: 4.85,
    reviewsCount: 290,
    image: 'https://images.unsplash.com/photo-1594824813626-d621187d7b37?w=500&auto=format&fit=crop&q=80',
    availability: 'Available Now',
    languages: ['English', 'Spanish', 'Portuguese'],
    fee: 55,
    education: 'Simulated Credential • Demo Profile',
    hospital: "Children's National Hospital (Demo Affiliate)",
    about: 'Pediatric wellness, child developmental milestones, and gentle telehealth consultations (Demo Provider).',
    verificationStatus: 'demo_provider',
    licenseNumber: 'DEMO-MD-772183',
    isDemo: true,
    nextSlot: 'Today, 3:15 PM',
    availableSlots: [
      { date: 'Today', times: ['3:15 PM', '4:00 PM', '5:30 PM'] },
      { date: 'Tomorrow', times: ['10:00 AM', '11:15 AM'] },
    ],
  },
  {
    id: 'doc-4',
    name: 'Dr. James Wilson, MD, FAAD',
    specialty: 'Dermatologist & Skin Health',
    title: 'Consultant Dermatologist (Demo Profile)',
    experienceYears: 18,
    rating: 4.9,
    reviewsCount: 520,
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&auto=format&fit=crop&q=80',
    availability: 'Tomorrow',
    languages: ['English'],
    fee: 65,
    education: 'Simulated Credential • Demo Profile',
    hospital: 'UCSF Medical Center (Demo Affiliate)',
    about: 'Clinical dermatology, tele-dermatoscopy, eczema, and acne management (Demo Provider).',
    verificationStatus: 'demo_provider',
    licenseNumber: 'DEMO-MD-441029',
    isDemo: true,
    nextSlot: 'Tomorrow, 11:00 AM',
    availableSlots: [
      { date: 'Tomorrow', times: ['11:00 AM', '1:00 PM', '3:30 PM'] },
    ],
  },
];

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<Appointment | null>(null);

  // Load doctors from backend
  useEffect(() => {
    let isMounted = true;
    const fetchDoctors = async () => {
      try {
        const fetched = await appointmentService.getDoctors();
        if (isMounted && fetched && fetched.length > 0) {
          setDoctors(fetched);
        }
      } catch (err) {
        console.warn('Backend doctors fetch failed; utilizing fallback directory:', err);
      }
    };
    fetchDoctors();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch user appointments when authenticated
  const refreshAppointments = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setAppointments([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getAppointments();
      setAppointments(data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load appointments.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    refreshAppointments();
  }, [refreshAppointments]);

  const bookAppointment = async (data: {
    doctorId: string;
    date: string;
    time: string;
    type?: 'video' | 'audio' | 'in-person';
    reason: string;
  }): Promise<Appointment> => {
    setError(null);
    try {
      const newApt = await appointmentService.bookAppointment(data);
      setAppointments((prev) => [newApt, ...prev]);
      return newApt;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to schedule appointment.';
      setError(message);
      throw new Error(message);
    }
  };

  const cancelAppointment = async (id: string, reason?: string) => {
    try {
      await appointmentService.cancelAppointment(id, reason);
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: 'cancelled' } : apt))
      );
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to cancel appointment.';
      setError(message);
      throw new Error(message);
    }
  };

  const startCall = (appointment: Appointment) => {
    setActiveCall(appointment);
  };

  const endCall = () => {
    setActiveCall(null);
  };

  return (
    <AppointmentContext.Provider
      value={{
        doctors,
        appointments,
        isLoading,
        error,
        bookAppointment,
        cancelAppointment,
        refreshAppointments,
        activeCall,
        startCall,
        endCall,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = (): AppointmentContextType => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};

export default AppointmentContext;
