import request from 'supertest';
import app from '../src/app';
import User from '../src/models/User';
import { connectTestDb, closeTestDb, clearTestDb } from './setup';
import { emailService, TestEmailService } from '../src/services/EmailService';

describe('Authentication & Password Recovery Integration Suite', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
    if (emailService instanceof TestEmailService) {
      emailService.clear();
    }
  });

  describe('POST /api/auth/register', () => {
    it('successfully registers a new patient with securely hashed password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          password: 'SecurePassword123!',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        role: 'patient',
      });

      // Verify password in DB is hashed and not plaintext
      const dbUser = await User.findOne({ email: 'jane.doe@example.com' }).select('+password');
      expect(dbUser).not.toBeNull();
      expect(dbUser!.password).not.toBe('SecurePassword123!');
      expect(dbUser!.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt format
    });

    it('prevents role escalation via client registration payload', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Malicious Actor',
          email: 'hacker@example.com',
          password: 'Password123!',
          role: 'admin', // Attempt vertical privilege escalation
        });

      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('patient'); // Server enforced patient role

      const dbUser = await User.findOne({ email: 'hacker@example.com' });
      expect(dbUser!.role).toBe('patient');
    });

    it('rejects duplicate email registration', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'duplicate@example.com',
          password: 'Password123!',
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane 2',
          email: 'duplicate@example.com',
          password: 'AnotherPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already exists');
    });

    it('rejects passwords shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Pass',
          email: 'short@example.com',
          password: 'short',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('at least 8 characters');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Patient',
          email: 'patient@example.com',
          password: 'CorrectPassword123!',
        });
    });

    it('authenticates valid credentials and issues JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'patient@example.com',
          password: 'CorrectPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('patient@example.com');
    });

    it('rejects invalid password with 401 AuthenticationError', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'patient@example.com',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('rejects non-existent account with 401 AuthenticationError', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nobody@example.com',
          password: 'AnyPassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid email or password');
    });
  });

  describe('Password Recovery Lifecycle', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Reset User',
          email: 'reset.user@example.com',
          password: 'InitialPassword123!',
        });
    });

    it('executes full secure recovery flow: request -> verify -> update -> invalidate', async () => {
      // 1. Request reset
      const forgotRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'reset.user@example.com' });

      expect(forgotRes.status).toBe(200);
      expect(forgotRes.body.message).toContain('If an account exists');

      // 2. Extract reset token from email test spy
      const testEmailSvc = emailService as TestEmailService;
      expect(testEmailSvc.sentEmails.length).toBe(1);
      const emailContent = testEmailSvc.sentEmails[0].text;
      const match = emailContent.match(/token is:\s+([a-f0-9]{64})/i);
      expect(match).not.toBeNull();
      const rawToken = match![1];

      // 3. Reset password using token
      const resetRes = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: rawToken,
          newPassword: 'BrandNewPassword123!',
        });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.message).toContain('Password successfully updated');

      // 4. Invalidation: Attempt replay with same token must fail
      const replayRes = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: rawToken,
          newPassword: 'AnotherPassword123!',
        });

      expect(replayRes.status).toBe(400);
      expect(replayRes.body.message).toContain('invalid or has expired');

      // 5. Old password no longer authenticates
      const oldLoginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'reset.user@example.com',
          password: 'InitialPassword123!',
        });
      expect(oldLoginRes.status).toBe(401);

      // 6. New password authenticates successfully
      const newLoginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'reset.user@example.com',
          password: 'BrandNewPassword123!',
        });
      expect(newLoginRes.status).toBe(200);
      expect(newLoginRes.body).toHaveProperty('token');
    });

    it('rejects expired password reset token', async () => {
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'reset.user@example.com' });

      const testEmailSvc = emailService as TestEmailService;
      const rawToken = testEmailSvc.sentEmails[0].text.match(/token is:\s+([a-f0-9]{64})/i)![1];

      // Manually expire the token in DB
      await User.updateOne(
        { email: 'reset.user@example.com' },
        { resetPasswordExpires: new Date(Date.now() - 10000) }
      );

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: rawToken,
          newPassword: 'BrandNewPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('invalid or has expired');
    });
  });
});
