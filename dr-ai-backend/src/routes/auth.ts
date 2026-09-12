import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser, UserRole } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter';
import { ValidationError, AuthenticationError, NotFoundError } from '../errors/AppError';
import { config } from '../config/env';
import { emailService } from '../services/EmailService';

const router = express.Router();

/**
 * Register new patient or provider.
 * Role defaults strictly to 'patient' to prevent privilege escalation via mass assignment.
 */
router.post('/register', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ValidationError('Valid name is required.');
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError('A valid email address is required.');
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ValidationError('An account with this email address already exists.');
    }

    // Role cannot be escalated from the client
    const user: IUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'patient' as UserRole, // Strictly derived server-side
    });

    await user.save();

    // Sign JWT with strict claims
    const token = jwt.sign(
      {
        userId: String(user._id),
        email: user.email,
        role: user.role,
        name: user.name,
      },
      config.JWT_SECRET,
      { expiresIn: '24h', algorithm: 'HS256' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Login existing user.
 */
router.post('/login', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required.');
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Explicitly select password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      throw new AuthenticationError('Invalid email or password.');
    }

    const isMatch = await user.comparePassword(String(password));
    if (!isMatch) {
      throw new AuthenticationError('Invalid email or password.');
    }

    const token = jwt.sign(
      {
        userId: String(user._id),
        email: user.email,
        role: user.role,
        name: user.name,
      },
      config.JWT_SECRET,
      { expiresIn: '24h', algorithm: 'HS256' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        bloodGroup: user.bloodGroup,
        height: user.height,
        weight: user.weight,
        location: user.location,
        allergies: user.allergies,
        chronicConditions: user.chronicConditions,
        medications: user.medications,
        specialty: user.specialty,
        licenseNumber: user.licenseNumber,
        isDemo: user.isDemo,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get current authenticated user profile.
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      throw new NotFoundError('User profile not found.');
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        bloodGroup: user.bloodGroup,
        height: user.height,
        weight: user.weight,
        location: user.location,
        emergencyContact: user.emergencyContact,
        allergies: user.allergies,
        chronicConditions: user.chronicConditions,
        medications: user.medications,
        specialty: user.specialty,
        licenseNumber: user.licenseNumber,
        isDemo: user.isDemo,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update authenticated user profile.
 * Rejects mass assignment of role or credentials.
 */
router.put('/profile', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const allowedUpdates = [
      'name',
      'avatar',
      'phone',
      'dateOfBirth',
      'bloodGroup',
      'height',
      'weight',
      'location',
      'emergencyContact',
      'allergies',
      'chronicConditions',
      'medications',
    ];

    const updates: Record<string, any> = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(req.user!.userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new NotFoundError('User profile not found.');
    }

    res.json({
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        dateOfBirth: updatedUser.dateOfBirth,
        bloodGroup: updatedUser.bloodGroup,
        height: updatedUser.height,
        weight: updatedUser.weight,
        location: updatedUser.location,
        emergencyContact: updatedUser.emergencyContact,
        allergies: updatedUser.allergies,
        chronicConditions: updatedUser.chronicConditions,
        medications: updatedUser.medications,
        isDemo: updatedUser.isDemo,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Request password recovery.
 * Generates cryptographic reset token, stores hash + expiration.
 * Does not reveal whether the account exists.
 */
router.post('/forgot-password', passwordResetLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ValidationError('Email address is required.');
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Generate unguessable reset token (32 random bytes)
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Hash token before storing in database
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity
      await user.save();

      // Dispatch via email service abstraction
      await emailService.sendEmail({
        to: user.email,
        subject: 'Dr.AI - Password Reset Request',
        text: `You requested a password reset for your Dr.AI account.\n\nYour reset token is: ${resetToken}\n\nThis token will expire in 60 minutes.\nIf you did not request this, please ignore this message.`,
      });
    }

    // Always respond with identical message to prevent user enumeration
    res.json({
      message: 'If an account exists with that email address, password reset instructions have been sent.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Complete password reset using verified token.
 */
router.post('/reset-password', passwordResetLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || typeof token !== 'string') {
      throw new ValidationError('Reset token is required.');
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters long.');
    }

    // Hash incoming token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      throw new ValidationError('Password reset token is invalid or has expired.');
    }

    // Set new password (will be re-hashed by pre-save hook)
    user.password = newPassword;
    // Invalidate reset token to prevent replay attacks
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      message: 'Password successfully updated. You may now log in with your new credentials.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Logout endpoint.
 */
router.post('/logout', (req: Request, res: Response) => {
  res.json({ message: 'Successfully logged out.' });
});

export default router;