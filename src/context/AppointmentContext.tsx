import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  title: string;
  experience: string;
  rating: number;
  reviewsCount: number;
  image: string;
  availability: 'Available Now' | 'Today' | 'Tomorrow' | 'In 2 Days';
  languages: string[];
  fee: number;
  education: string;
  hospital: string;
  about: string;
  nextSlot: string;
  availableSlots: {
    date: string;
    times: string[];
  }[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorImage: string;
  doctorFee: number;
  patientName: string;
  patientEmail?: string;
  date: string;
  time: string;
  type: 'video' | 'audio' | 'in-person';
  status: 'upcoming' | 'completed' | 'cancelled';
  reason: string;
  symptoms?: string[];
  meetingRoomId: string;
  notes?: string;
  prescription?: {
    diagnosis: string;
    medicines: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
    advice: string;
    issueDate: string;
  };
}

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Johnson, MD',
    specialty: 'General Physician & Telehealth',
    title: 'Senior Attending Physician',
    experience: '14 years exp.',
    rating: 4.9,
    reviewsCount: 342,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=80',
    availability: 'Available Now',
    languages: ['English', 'Spanish'],
    fee: 49,
    education: 'Harvard Medical School • Johns Hopkins Residency',
    hospital: 'Johns Hopkins Hospital, Baltimore',
    about: 'Specialist in preventive medicine, acute symptom diagnosis, and digital health triage with over 14 years of clinical experience.',
    nextSlot: 'Today, 2:30 PM',
    availableSlots: [
      { date: 'Today', times: ['2:30 PM', '3:00 PM', '4:15 PM', '5:00 PM'] },
      { date: 'Tomorrow', times: ['10:00 AM', '11:30 AM', '2:00 PM', '4:00 PM'] },
      { date: 'Thursday', times: ['9:30 AM', '1:00 PM', '3:30 PM', '5:30 PM'] },
    ],
  },
  {
    id: 'doc-2',
    name: 'Dr. Michael Chen, MD, FACC',
    specialty: 'Cardiologist & Vascular Care',
    title: 'Chief of Cardiovascular Health',
    experience: '16 years exp.',
    rating: 4.95,
    reviewsCount: 489,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80',
    availability: 'Today',
    languages: ['English', 'Mandarin'],
    fee: 75,
    education: 'Stanford University School of Medicine • Mayo Clinic Fellow',
    hospital: 'Mount Sinai Hospital, New York',
    about: 'Board-certified cardiologist specializing in hypertension, arrhythmias, preventative heart health, and remote cardiac monitoring.',
    nextSlot: 'Today, 4:00 PM',
    availableSlots: [
      { date: 'Today', times: ['4:00 PM', '4:45 PM', '6:00 PM'] },
      { date: 'Tomorrow', times: ['9:00 AM', '10:30 AM', '1:30 PM', '3:00 PM'] },
      { date: 'Friday', times: ['11:00 AM', '2:30 PM', '4:30 PM'] },
    ],
  },
  {
    id: 'doc-3',
    name: 'Dr. Emily Rodriguez, MD, FAAP',
    specialty: 'Pediatrician & Adolescent Medicine',
    title: 'Pediatric Care Director',
    experience: '11 years exp.',
    rating: 4.85,
    reviewsCount: 290,
    image: 'https://images.unsplash.com/photo-1594824813626-d621187d7b37?w=500&auto=format&fit=crop&q=80',
    availability: 'Available Now',
    languages: ['English', 'Spanish', 'Portuguese'],
    fee: 55,
    education: 'Columbia University Vagelos College of P&S',
    hospital: "Children's National Hospital, Washington DC",
    about: 'Passionate about pediatric wellness, child developmental milestones, vaccinations, respiratory infections, and gentle telehealth consultations.',
    nextSlot: 'Today, 3:15 PM',
    availableSlots: [
      { date: 'Today', times: ['3:15 PM', '4:00 PM', '5:30 PM'] },
      { date: 'Tomorrow', times: ['10:00 AM', '11:15 AM', '1:45 PM', '3:30 PM'] },
    ],
  },
  {
    id: 'doc-4',
    name: 'Dr. James Wilson, MD, FAAD',
    specialty: 'Dermatologist & Skin Health',
    title: 'Consultant Dermatologist',
    experience: '18 years exp.',
    rating: 4.9,
    reviewsCount: 520,
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&auto=format&fit=crop&q=80',
    availability: 'Tomorrow',
    languages: ['English'],
    fee: 65,
    education: 'UCSF School of Medicine • Mass General Hospital',
    hospital: 'UCSF Medical Center, San Francisco',
    about: 'Expert in clinical dermatology, tele-dermatoscopy, eczema, acne management, psoriasis, and early skin lesion detection.',
    nextSlot: 'Tomorrow, 9:30 AM',
    availableSlots: [
      { date: 'Tomorrow', times: ['9:30 AM', '11:00 AM', '1:30 PM', '3:00 PM'] },
      { date: 'Friday', times: ['10:00 AM', '12:00 PM', '2:30 PM', '4:00 PM'] },
    ],
  },
  {
    id: 'doc-5',
    name: 'Dr. Aisha Patel, MD',
    specialty: 'Psychiatrist & Mental Health',
    title: 'Clinical Neuropsychiatrist',
    experience: '12 years exp.',
    rating: 4.92,
    reviewsCount: 310,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=80',
    availability: 'Available Now',
    languages: ['English', 'Hindi', 'Gujarati'],
    fee: 70,
    education: 'Yale School of Medicine • Bellevue Psychiatric Fellowship',
    hospital: 'NYU Langone Health, New York',
    about: 'Dedicated to compassionate mental wellness, anxiety disorders, depression, burnout management, and cognitive behavioral telemedicine.',
    nextSlot: 'Today, 2:00 PM',
    availableSlots: [
      { date: 'Today', times: ['2:00 PM', '3:30 PM', '5:00 PM'] },
      { date: 'Tomorrow', times: ['11:00 AM', '1:00 PM', '4:30 PM'] },
    ],
  },
  {
    id: 'doc-6',
    name: 'Dr. David Kim, MD, PhD',
    specialty: 'Neurologist & Pain Specialist',
    title: 'Head of Neurology',
    experience: '15 years exp.',
    rating: 4.88,
    reviewsCount: 275,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80',
    availability: 'Today',
    languages: ['English', 'Korean'],
    fee: 80,
    education: 'Johns Hopkins School of Medicine',
    hospital: 'Northwestern Memorial Hospital, Chicago',
    about: 'Specialized in migraines, neuropathic pain, sleep disorders, and tele-neurology consultations.',
    nextSlot: 'Today, 5:30 PM',
    availableSlots: [
      { date: 'Today', times: ['5:30 PM', '6:15 PM'] },
      { date: 'Tomorrow', times: ['10:00 AM', '2:00 PM', '3:30 PM'] },
    ],
  },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-101',
    doctorId: 'doc-1',
    doctorName: 'Dr. Sarah Johnson, MD',
    doctorSpecialty: 'General Physician & Telehealth',
    doctorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=80',
    doctorFee: 49,
    patientName: 'Alex Rivera',
    date: 'Today',
    time: '2:30 PM',
    type: 'video',
    status: 'upcoming',
    reason: 'Follow-up for seasonal allergies and asthma check',
    meetingRoomId: 'room-med-8492',
  },
  {
    id: 'apt-102',
    doctorId: 'doc-4',
    doctorName: 'Dr. James Wilson, MD, FAAD',
    doctorSpecialty: 'Dermatologist & Skin Health',
    doctorImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&auto=format&fit=crop&q=80',
    doctorFee: 65,
    patientName: 'Alex Rivera',
    date: 'Tomorrow',
    time: '11:00 AM',
    type: 'video',
    status: 'upcoming',
    reason: 'Skin rash inspection on left forearm',
    meetingRoomId: 'room-skin-3391',
  },
  {
    id: 'apt-100',
    doctorId: 'doc-2',
    doctorName: 'Dr. Michael Chen, MD, FACC',
    doctorSpecialty: 'Cardiologist & Vascular Care',
    doctorImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80',
    doctorFee: 75,
    patientName: 'Alex Rivera',
    date: 'Last Week',
    time: '4:00 PM',
    type: 'video',
    status: 'completed',
    reason: 'Routine ECG review and blood pressure checkup',
    meetingRoomId: 'room-card-1029',
    notes: 'BP is well controlled at 122/78 mmHg. Continue current lifestyle and moderate cardio.',
    prescription: {
      diagnosis: 'Mild Essential Hypertension - Well Controlled',
      medicines: [
        { name: 'CoQ10 Supplement', dosage: '100mg', frequency: 'Once daily with meal', duration: '90 days' },
      ],
      advice: 'Maintain daily 30-minute brisk walk and reduce sodium intake below 2000mg/day.',
      issueDate: '2024-05-10',
    },
  },
];

interface AppointmentContextType {
  doctors: Doctor[];
  appointments: Appointment[];
  bookAppointment: (data: Omit<Appointment, 'id' | 'meetingRoomId' | 'status'>) => Appointment;
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, newDate: string, newTime: string) => void;
  completeAppointment: (id: string, notes?: string, prescription?: any) => void;
  activeCall: Appointment | null;
  startCall: (appointment: Appointment) => void;
  endCall: () => void;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('dr_ai_appointments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_APPOINTMENTS;
      }
    }
    return INITIAL_APPOINTMENTS;
  });
  const [activeCall, setActiveCall] = useState<Appointment | null>(null);

  useEffect(() => {
    localStorage.setItem('dr_ai_appointments', JSON.stringify(appointments));
  }, [appointments]);

  const bookAppointment = (data: Omit<Appointment, 'id' | 'meetingRoomId' | 'status'>): Appointment => {
    const newAppointment: Appointment = {
      ...data,
      id: 'apt-' + Date.now(),
      meetingRoomId: 'room-' + Math.random().toString(36).substring(2, 9),
      status: 'upcoming',
    };
    setAppointments((prev) => [newAppointment, ...prev]);
    return newAppointment;
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'cancelled' as const } : apt))
    );
  };

  const rescheduleAppointment = (id: string, newDate: string, newTime: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, date: newDate, time: newTime } : apt))
    );
  };

  const completeAppointment = (id: string, notes?: string, prescription?: any) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id
          ? {
              ...apt,
              status: 'completed' as const,
              notes: notes || apt.notes,
              prescription: prescription || apt.prescription,
            }
          : apt
      )
    );
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
        bookAppointment,
        cancelAppointment,
        rescheduleAppointment,
        completeAppointment,
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
