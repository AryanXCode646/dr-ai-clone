// Node 26+ compatibility polyfill for legacy dependencies
import buffer from 'buffer';
if (!(buffer as any).SlowBuffer) {
  (buffer as any).SlowBuffer = buffer.Buffer;
}

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import doctorRoutes from './routes/doctors';
import appointmentRoutes from './routes/appointments';
import prescriptionRoutes from './routes/prescriptions';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/observability';
import { noSqlInjectionSanitizer } from './middleware/sanitize';
import { NotFoundError } from './errors/AppError';
import { config } from './config/env';

export const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for API prototype compatibility with frontend
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: config.CORS_ORIGIN === '*' ? true : [config.CORS_ORIGIN, 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    credentials: true,
  })
);

// Body parsing with safe size boundary
app.use(express.json({ limit: '5mb' }));

// Observability and Structured Request Logging
app.use(requestLogger);

// Global NoSQL Query Injection Neutralizer
app.use(noSqlInjectionSanitizer);

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Dr.AI Telehealth & Clinical Intelligence API',
    version: '2.0.0',
    environment: config.NODE_ENV,
    demoMode: config.DEMO_MODE,
  });
});

// Primary API Namespaces
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Catch-all 404 for undefined routes
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

// Centralized Safe Error Handler
app.use(errorHandler);

export default app;
