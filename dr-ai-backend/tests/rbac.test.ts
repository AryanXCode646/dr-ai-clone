import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import User from '../src/models/User';
import Appointment from '../src/models/Appointment';
import { connectTestDb, closeTestDb, clearTestDb } from './setup';
import { config } from '../src/config/env';

describe('RBAC & Authorization Escalation Test Matrix', () => {
  let patientAToken: string;
  let patientAId: string;
  let patientBToken: string;
  let patientBId: string;
  let doctorToken: string;
  let doctorId: string;
  let appointmentAId: string;

  beforeAll(async () => {
    await connectTestDb();

    // 1. Create Patient A
    const userA = new User({
      name: 'Patient Alpha',
      email: 'patient.a@example.com',
      password: 'Password123!',
      role: 'patient',
    });
    await userA.save();
    patientAId = String(userA._id);
    patientAToken = jwt.sign(
      { userId: patientAId, email: userA.email, role: userA.role },
      config.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    // 2. Create Patient B
    const userB = new User({
      name: 'Patient Beta',
      email: 'patient.b@example.com',
      password: 'Password123!',
      role: 'patient',
    });
    await userB.save();
    patientBId = String(userB._id);
    patientBToken = jwt.sign(
      { userId: patientBId, email: userB.email, role: userB.role },
      config.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    // 3. Create Doctor
    const doc = new User({
      name: 'Dr. Physician',
      email: 'doctor@example.com',
      password: 'Password123!',
      role: 'doctor',
    });
    await doc.save();
    doctorId = String(doc._id);
    doctorToken = jwt.sign(
      { userId: doctorId, email: doc.email, role: doc.role },
      config.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    // 4. Create an Appointment belonging strictly to Patient A
    const apt = new Appointment({
      patient: userA._id,
      patientName: userA.name,
      patientEmail: userA.email,
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Johnson, MD',
      doctorSpecialty: 'Internal Medicine',
      scheduledStart: new Date(),
      scheduledEnd: new Date(Date.now() + 30 * 60000),
      dateStr: 'Today',
      timeStr: '2:30 PM',
      type: 'video',
      status: 'scheduled',
      reason: 'Confidential Patient A Consultation',
      meetingRoomId: 'room-sec-test-01',
    });
    await apt.save();
    appointmentAId = String(apt._id);
  });

  afterAll(async () => {
    await closeTestDb();
  });

  describe('JWT Cryptographic Verification & Anti-Tampering', () => {
    it('rejects requests with missing Authorization header', async () => {
      const res = await request(app).get('/api/appointments');
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('No authorization header');
    });

    it('rejects tokens without Bearer prefix', async () => {
      const res = await request(app)
        .get('/api/appointments')
        .set('Authorization', patientAToken);
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Bearer scheme');
    });

    it('neutralizes alg:none exploit attempt', async () => {
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({ userId: patientAId, role: 'admin' })
      ).toString('base64url');
      const forgedNoneToken = `${header}.${payload}.`;

      const res = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${forgedNoneToken}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid authentication token');
    });

    it('detects and rejects tampered signature', async () => {
      const parts = patientAToken.split('.');
      // Tamper signature by modifying last byte
      const tamperedSig = parts[2].slice(0, -2) + 'XX';
      const tamperedToken = `${parts[0]}.${parts[1]}.${tamperedSig}`;

      const res = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid authentication token');
    });

    it('rejects expired JWT token', async () => {
      const expiredToken = jwt.sign(
        { userId: patientAId, email: 'patient.a@example.com', role: 'patient' },
        config.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '-10s' }
      );

      const res = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('expired');
    });
  });

  describe('Horizontal Privilege Escalation Prevention', () => {
    it('allows Patient A to access their own appointment', async () => {
      const res = await request(app)
        .get(`/api/appointments/${appointmentAId}`)
        .set('Authorization', `Bearer ${patientAToken}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(appointmentAId);
      expect(res.body.patientName).toBe('Patient Alpha');
    });

    it('blocks Patient B from accessing Patient A appointment (Horizontal Escalation)', async () => {
      const res = await request(app)
        .get(`/api/appointments/${appointmentAId}`)
        .set('Authorization', `Bearer ${patientBToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('do not have permission to view');
    });

    it('blocks Patient B from cancelling Patient A appointment', async () => {
      const res = await request(app)
        .post(`/api/appointments/${appointmentAId}/cancel`)
        .set('Authorization', `Bearer ${patientBToken}`)
        .send({ reason: 'Malicious cancellation attempt' });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('do not have permission to cancel');
    });
  });

  describe('Vertical Privilege Escalation Prevention', () => {
    it('blocks a patient from issuing medical prescriptions', async () => {
      const res = await request(app)
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${patientAToken}`)
        .send({
          patientId: patientBId,
          patientName: 'Patient Beta',
          diagnosis: 'Self-diagnosed prescription',
          medications: [{ name: 'Controlled Drug', dosage: '100mg', frequency: 'Daily', duration: '30d' }],
          advice: 'Take daily',
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Patients are not authorized to issue prescriptions');
    });

    it('allows a verified doctor to issue an official prescription', async () => {
      const res = await request(app)
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patientId: patientAId,
          patientName: 'Patient Alpha',
          doctorName: 'Dr. Physician',
          doctorSpecialty: 'Internal Medicine',
          diagnosis: 'Allergic Rhinitis',
          medications: [{ name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '14 days' }],
          advice: 'Avoid dust allergens',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('prescriptionId');
      expect(res.body.prescriptionId).toMatch(/^RX-[0-9A-F]{4}-[0-9A-F]{4}$/);
      expect(res.body.signingStatus).toBe('demo_unsigned'); // Truthful status
    });
  });
});
