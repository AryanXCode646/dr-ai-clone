import mongoose from 'express';
import User from '../models/User';
import Doctor from '../models/Doctor';
import Appointment from '../models/Appointment';
import Prescription from '../models/Prescription';
import crypto from 'crypto';

export const SEED_DOCTORS = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Johnson, MD',
    specialty: 'General Physician & Telehealth',
    title: 'Senior Attending Physician (Demo Profile)',
    experienceYears: 14,
    rating: 4.9,
    reviewsCount: 342,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=80',
    availability: 'Available Now' as const,
    languages: ['English', 'Spanish'],
    fee: 49,
    education: 'Simulated Credential • Demo Profile',
    hospital: 'Johns Hopkins Hospital (Demo Affiliate)',
    about: 'Specialist in preventive medicine, acute symptom diagnosis, and digital health triage (Demo Provider).',
    verificationStatus: 'demo_provider' as const,
    licenseNumber: 'DEMO-MD-849204',
    isDemo: true,
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
    availability: 'Today' as const,
    languages: ['English', 'Mandarin'],
    fee: 75,
    education: 'Simulated Credential • Demo Profile',
    hospital: 'Mount Sinai Hospital (Demo Affiliate)',
    about: 'Cardiologist specializing in hypertension, arrhythmias, and remote cardiac monitoring (Demo Provider).',
    verificationStatus: 'demo_provider' as const,
    licenseNumber: 'DEMO-MD-991204',
    isDemo: true,
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
    availability: 'Available Now' as const,
    languages: ['English', 'Spanish'],
    fee: 55,
    education: 'Simulated Credential • Demo Profile',
    hospital: "Children's National Hospital (Demo Affiliate)",
    about: 'Pediatric wellness, child developmental milestones, and gentle telehealth consultations (Demo Provider).',
    verificationStatus: 'demo_provider' as const,
    licenseNumber: 'DEMO-MD-772183',
    isDemo: true,
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
    availability: 'Tomorrow' as const,
    languages: ['English'],
    fee: 65,
    education: 'Simulated Credential • Demo Profile',
    hospital: 'UCSF Medical Center (Demo Affiliate)',
    about: 'Clinical dermatology, tele-dermatoscopy, eczema, and acne management (Demo Provider).',
    verificationStatus: 'demo_provider' as const,
    licenseNumber: 'DEMO-MD-441029',
    isDemo: true,
    availableSlots: [
      { date: 'Tomorrow', times: ['11:00 AM', '1:00 PM', '3:30 PM'] },
    ],
  },
];

export async function seedDatabase() {
  console.log('🌱 Checking seed data...');

  // 1. Seed Doctors
  for (const docData of SEED_DOCTORS) {
    await Doctor.findOneAndUpdate({ id: docData.id }, docData, {
      upsert: true,
      new: true,
    });
  }

  // 2. Seed Demo Users if they don't exist
  let demoPatient = await User.findOne({ email: 'alex.rivera@example.com' });
  if (!demoPatient) {
    demoPatient = new User({
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      password: 'Password123!',
      role: 'patient',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      phone: '+1 (555) 234-5678',
      dateOfBirth: '1994-05-18',
      bloodGroup: 'A+',
      height: '178 cm',
      weight: '72 kg',
      location: 'San Francisco, CA',
      emergencyContact: {
        name: 'Elena Rivera',
        relation: 'Sister',
        phone: '+1 (555) 987-6543',
      },
      allergies: ['Penicillin', 'Peanuts', 'Dust Mites'],
      chronicConditions: ['Mild Asthma', 'Seasonal Rhinitis'],
      medications: [
        {
          id: 'med_01',
          name: 'Albuterol Inhaler',
          dosage: '90mcg / 2 puffs',
          frequency: 'As needed for shortness of breath',
          startDate: '2023-04-12',
          prescribedBy: 'Dr. Sarah Johnson, MD',
        },
      ],
      isVerified: true,
      isDemo: true,
    });
    await demoPatient.save();
  }

  let demoDoctor = await User.findOne({ email: 'dr.johnson@mediai.com' });
  if (!demoDoctor) {
    demoDoctor = new User({
      name: 'Dr. Sarah Johnson, MD',
      email: 'dr.johnson@mediai.com',
      password: 'Password123!',
      role: 'doctor',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
      phone: '+1 (555) 432-1098',
      location: 'Medical Center, Suite 400, New York',
      specialty: 'Internal Medicine & AI Diagnostics',
      licenseNumber: 'DEMO-MD-849204-NY',
      rating: 4.9,
      isVerified: true,
      isDemo: true,
    });
    await demoDoctor.save();
  }

  let demoAdmin = await User.findOne({ email: 'admin@dr-ai.local' });
  if (!demoAdmin) {
    demoAdmin = new User({
      name: 'System Administrator',
      email: 'admin@dr-ai.local',
      password: 'AdminPassword123!',
      role: 'admin',
      isVerified: true,
      isDemo: true,
    });
    await demoAdmin.save();
  }

  // 3. Seed Initial Appointments for demo patient
  const existingAptCount = await Appointment.countDocuments({ patient: demoPatient._id });
  if (existingAptCount === 0) {
    const today = new Date();
    const scheduledStart = new Date(today);
    scheduledStart.setHours(14, 30, 0, 0);
    const scheduledEnd = new Date(today);
    scheduledEnd.setHours(15, 0, 0, 0);

    const apt = new Appointment({
      patient: demoPatient._id,
      patientName: demoPatient.name,
      patientEmail: demoPatient.email,
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Johnson, MD',
      doctorSpecialty: 'General Physician & Telehealth',
      doctorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=80',
      doctorFee: 49,
      scheduledStart,
      scheduledEnd,
      dateStr: 'Today',
      timeStr: '2:30 PM',
      type: 'video',
      status: 'scheduled',
      reason: 'Follow-up for seasonal allergies and asthma check',
      meetingRoomId: 'room-med-' + crypto.randomBytes(4).toString('hex'),
    });
    await apt.save();
  }

  console.log('✅ Seed data successfully verified and initialized.');
}
