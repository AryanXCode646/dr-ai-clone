import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import User from '../src/models/User';
import Doctor from '../src/models/Doctor';
import Appointment from '../src/models/Appointment';
import { connectTestDb, closeTestDb, clearTestDb } from './setup';
import { config } from '../src/config/env';
import { SEED_DOCTORS } from '../src/seed/seed';

describe('Appointments Engine & Concurrency Suite', () => {
  let patientToken: string;
  let patientId: string;
  let doctorId = 'doc-1';

  beforeAll(async () => {
    await connectTestDb();

    // Ensure seed doctor exists in DB
    for (const doc of SEED_DOCTORS) {
      await Doctor.findOneAndUpdate({ id: doc.id }, doc, { upsert: true });
    }

    const patient = new User({
      name: 'Verified Patient',
      email: 'verified.patient@example.com',
      password: 'Password123!',
      role: 'patient',
    });
    await patient.save();
    patientId = String(patient._id);
    patientToken = jwt.sign(
      { userId: patientId, email: patient.email, role: patient.role },
      config.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await Appointment.deleteMany({});
  });

  it('books an appointment deriving authoritative identity server-side', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: 'doc-1',
        date: '2026-10-15',
        time: '10:00 AM',
        type: 'video',
        reason: 'Persistent sinus pressure',
        // Malicious client attempting to inject fake patient info:
        patientName: 'Fake Injected Name',
        patientEmail: 'injected@hacker.com',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.patient).toBe(patientId);
    // Verified: Server ignores client-supplied names and uses verified user profile
    expect(res.body.patientName).toBe('Verified Patient');
    expect(res.body.patientEmail).toBe('verified.patient@example.com');
    expect(res.body.status).toBe('scheduled');
    expect(res.body.meetingRoomId).toMatch(/^room-[0-9a-f]{16}$/);

    // Verify persisted directly in MongoDB
    const persisted = await Appointment.findById(res.body._id);
    expect(persisted).not.toBeNull();
    expect(persisted!.reason).toBe('Persistent sinus pressure');
  });

  it('prevents duplicate double-booking of the same doctor and time slot', async () => {
    // First booking succeeds
    const firstRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: 'doc-1',
        date: '2026-10-20',
        time: '3:00 PM',
        type: 'video',
        reason: 'First consultation',
      });
    expect(firstRes.status).toBe(201);

    // Second booking at exact same slot must be rejected with 409 Conflict
    const secondRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: 'doc-1',
        date: '2026-10-20',
        time: '3:00 PM',
        type: 'video',
        reason: 'Conflicting consultation',
      });

    expect(secondRes.status).toBe(409);
    expect(secondRes.body.message).toContain('already has a confirmed booking');
  });

  it('enforces legal state transitions and rejects invalid state transitions', async () => {
    const bookRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: 'doc-1',
        date: '2026-10-22',
        time: '11:00 AM',
        reason: 'Transition check',
      });

    const aptId = bookRes.body._id;

    // 1. Legal transition: scheduled -> cancelled
    const cancelRes = await request(app)
      .post(`/api/appointments/${aptId}/cancel`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ reason: 'Need to reschedule' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.appointment.status).toBe('cancelled');
    expect(cancelRes.body.appointment.cancellationReason).toBe('Need to reschedule');

    // 2. Illegal transition: cancelled -> cancelled again or cancelled -> completed
    const reCancelRes = await request(app)
      .post(`/api/appointments/${aptId}/cancel`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ reason: 'Attempt duplicate cancel' });

    expect(reCancelRes.status).toBe(400);
    expect(reCancelRes.body.message).toContain('Cannot cancel appointment with current status');
  });
});
