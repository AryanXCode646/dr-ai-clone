import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import doctorRoutes from './routes/doctors';
import appointmentRoutes from './routes/appointments';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Dr.AI Telehealth & Clinical Intelligence API',
    version: '2.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// Graceful MongoDB Connection (Doesn't crash the server if MongoDB is offline)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dr-ai';

mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 2500 })
  .then(() => console.log('✅ Connected to MongoDB database.'))
  .catch((error) => {
    console.warn('⚠️ MongoDB is not running locally. Dr.AI backend is running in resilient in-memory/mock fallback mode.');
  });

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Dr.AI Clinical Backend listening on http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
});