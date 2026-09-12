import rateLimit from 'express-rate-limit';
import { RateLimitError } from '../errors/AppError';
import { config } from '../config/env';

// In test environment, keep windows small or disabled to avoid flake
const isTest = config.NODE_ENV === 'test';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 1000 : 15, // 15 attempts per 15 minutes in production
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitError('Too many login or registration attempts. Please try again after 15 minutes.'));
  },
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isTest ? 1000 : 5, // 5 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitError('Too many password reset requests. Please try again later.'));
  },
});

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isTest ? 1000 : 30, // 30 messages per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitError('Chat rate limit reached. Please pause for a moment before sending another message.'));
  },
});

export const appointmentBookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isTest ? 1000 : 10, // 10 booking attempts per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitError('Booking rate limit exceeded. Please wait a moment before trying again.'));
  },
});
