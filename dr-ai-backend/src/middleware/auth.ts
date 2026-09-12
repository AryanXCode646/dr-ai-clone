import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from '../errors/AppError';
import { config } from '../config/env';
import { UserRole } from '../models/User';

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  name?: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

/**
 * Verifies JWT token and binds verified user identity to the request.
 * Strictly enforces HS256 to defeat alg:none and algorithm confusion attacks.
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      throw new AuthenticationError('No authorization header provided');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Authorization header must use Bearer scheme');
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new AuthenticationError('Authentication token is missing');
    }

    const decoded = jwt.verify(token, config.JWT_SECRET, {
      algorithms: ['HS256'],
    }) as AuthPayload;

    if (!decoded.userId || !decoded.role) {
      throw new AuthenticationError('Malformed token payload');
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    if (err instanceof AuthenticationError) {
      return next(err);
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Authentication token has expired. Please log in again.'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new AuthenticationError('Invalid authentication token'));
    }
    next(new AuthenticationError('Authentication failed'));
  }
};

/**
 * Role-Based Access Control (RBAC) middleware.
 * Verifies that the authenticated user possesses one of the required roles.
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required before authorization'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AuthorizationError(
          `Forbidden: Required role [${allowedRoles.join(', ')}], but your role is '${req.user.role}'`
        )
      );
    }

    next();
  };
};

/**
 * Optional authentication: attaches user if valid token present, does not reject if missing.
 */
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET, {
      algorithms: ['HS256'],
    }) as AuthPayload;
    req.user = decoded;
  } catch {
    // Ignore invalid tokens in optional auth
  }

  next();
};