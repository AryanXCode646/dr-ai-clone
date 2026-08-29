import express, { Request, Response } from 'express';

const router = express.Router();

let appointmentsStore: any[] = [
  {
    id: 'apt-101',
    doctorId: 'doc-1',
    doctorName: 'Dr. Sarah Johnson, MD',
    doctorSpecialty: 'General Physician & Telehealth',
    patientName: 'Alex Rivera',
    date: 'Today',
    time: '2:30 PM',
    type: 'video',
    status: 'upcoming',
    reason: 'Follow-up for seasonal allergies and asthma check',
    meetingRoomId: 'room-med-8492',
  },
];

// List appointments
router.get('/', (req: Request, res: Response) => {
  res.json(appointmentsStore);
});

// Book new appointment
router.post('/book', (req: Request, res: Response) => {
  const { doctorId, doctorName, doctorSpecialty, patientName, date, time, type, reason } = req.body;

  if (!doctorName || !date || !time) {
    return res.status(400).json({ error: 'Doctor name, date and time slot are required' });
  }

  const newApt = {
    id: 'apt-' + Date.now(),
    doctorId: doctorId || 'doc-1',
    doctorName,
    doctorSpecialty: doctorSpecialty || 'General Telehealth',
    patientName: patientName || 'Alex Rivera',
    date,
    time,
    type: type || 'video',
    status: 'upcoming',
    reason: reason || 'General consultation',
    meetingRoomId: 'room-' + Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString(),
  };

  appointmentsStore.unshift(newApt);
  res.status(201).json(newApt);
});

// Cancel appointment
router.post('/:id/cancel', (req: Request, res: Response) => {
  const apt = appointmentsStore.find((a) => a.id === req.params.id);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  apt.status = 'cancelled';
  res.json({ message: 'Appointment cancelled successfully', appointment: apt });
});

export default router;
