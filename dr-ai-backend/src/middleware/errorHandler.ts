import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { config } from '../config/env';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Extract or assign status code
  const statusCode = err instanceof AppError ? err.statusCode : (err.status || err.statusCode || 500);

  // Determine safe message
  let message = 'Internal Server Error';
  if (err instanceof AppError && err.isOperational) {
    message = err.message;
  } else if (config.NODE_ENV !== 'production' && err.message) {
    message = err.message;
  }

  // Server-side diagnostic log (never leak stack or raw internals to client)
  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} - ${statusCode}:`, err);
  }

  const responsePayload: {
    error: string;
    message: string;
    details?: any;
    requestId?: string;
  } = {
    error: err.name || 'Error',
    message,
  };

  if (err instanceof AppError && err.details) {
    responsePayload.details = err.details;
  }

  if (req.headers['x-request-id']) {
    responsePayload.requestId = String(req.headers['x-request-id']);
  }

  res.status(statusCode).json(responsePayload);
};
