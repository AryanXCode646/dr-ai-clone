import express, { Request, Response } from 'express';

const router = express.Router();

const DOCTORS = [
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
    about: 'Specialist in preventive medicine, acute symptom diagnosis, and digital health triage.',
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
    about: 'Board-certified cardiologist specializing in hypertension, arrhythmias, and remote cardiac monitoring.',
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
    languages: ['English', 'Spanish'],
    fee: 55,
    education: 'Columbia University Vagelos College of P&S',
    hospital: "Children's National Hospital, Washington DC",
    about: 'Passionate about pediatric wellness, child developmental milestones, and gentle telehealth consultations.',
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
    about: 'Expert in clinical dermatology, tele-dermatoscopy, eczema, acne management, and early skin lesion detection.',
  },
];

// Get all verified doctors
router.get('/', (req: Request, res: Response) => {
  const { specialty, availability } = req.query;
  let results = [...DOCTORS];

  if (specialty && specialty !== 'All') {
    results = results.filter((d) => d.specialty.toLowerCase().includes(String(specialty).toLowerCase()));
  }
  if (availability && availability !== 'All') {
    results = results.filter((d) => d.availability.toLowerCase().includes(String(availability).toLowerCase()));
  }

  res.json({
    total: results.length,
    doctors: results,
  });
});

// Get doctor by ID
router.get('/:id', (req: Request, res: Response) => {
  const doctor = DOCTORS.find((d) => d.id === req.params.id);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }
  res.json(doctor);
});

export default router;
