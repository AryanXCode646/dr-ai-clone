export type UserRole = 'patient' | 'doctor' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  height?: string;
  weight?: string;
  location?: string;
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  allergies?: string[];
  chronicConditions?: string[];
  medications?: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    prescribedBy: string;
  }>;
  specialty?: string;
  licenseNumber?: string;
  rating?: number;
  isDemo?: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  title: string;
  experienceYears?: number;
  experience?: string;
  rating: number;
  reviewsCount: number;
  image: string;
  availability: 'Available Now' | 'Today' | 'Tomorrow' | 'In 2 Days';
  languages: string[];
  fee: number;
  education: string;
  hospital: string;
  about: string;
  verificationStatus?: 'verified' | 'pending_verification' | 'demo_provider';
  licenseNumber?: string;
  isDemo?: boolean;
  nextSlot?: string;
  availableSlots: Array<{
    date: string;
    times: string[];
  }>;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'upcoming';

export interface Appointment {
  _id?: string;
  id: string;
  patient?: string;
  patientName: string;
  patientEmail?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorImage?: string;
  doctorFee?: number;
  scheduledStart?: string;
  scheduledEnd?: string;
  date: string;
  time: string;
  type: 'video' | 'audio' | 'in-person';
  status: AppointmentStatus;
  reason: string;
  symptoms?: string[];
  meetingRoomId: string;
  notes?: string;
  prescription?: any;
}

export interface StructuredClinicalAssessment {
  summary: string;
  possibleConditions: Array<{
    name: string;
    description: string;
    urgency: 'Low' | 'Moderate' | 'High' | 'Emergency';
  }>;
  redFlags: string[];
  recommendedNextStep: string;
  urgency: 'Low' | 'Moderate' | 'High' | 'Emergency';
  isEmergency: boolean;
  disclaimer: string;
  confidence: null;
  model: string;
  provenance: 'llm_triage' | 'emergency_escalation' | 'simulated_fallback';
  generatedAt: string;
}

export interface PrescriptionData {
  prescriptionId: string;
  patientName: string;
  patientAge?: string | number;
  patientGender?: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorHospital?: string;
  date: string;
  diagnosis: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  advice: string;
  followUp?: string;
  signingStatus: 'demo_unsigned' | 'digitally_signed';
}
