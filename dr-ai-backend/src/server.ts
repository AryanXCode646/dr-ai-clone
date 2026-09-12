import mongoose from 'mongoose';
import { app } from './app';
import { config } from './config/env';
import { seedDatabase } from './seed/seed';

// MongoDB Connection
mongoose
  .connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
  .then(async () => {
    console.log('✅ Connected to MongoDB database:', config.MONGODB_URI);
    try {
      await seedDatabase();
    } catch (seedErr) {
      console.warn('⚠️ Seed check completed with notes:', seedErr);
    }
  })
  .catch((error) => {
    console.warn(
      '⚠️ MongoDB is not running locally. Dr.AI backend is running in resilient in-memory/mock fallback mode for unpersisted endpoints.'
    );
  });

// Start listening
app.listen(config.PORT, () => {
  console.log(`🚀 Dr.AI Clinical Backend listening on http://localhost:${config.PORT}`);
  console.log(`🩺 Health check: http://localhost:${config.PORT}/api/health`);
  console.log(`🔒 Security mode: ${config.NODE_ENV} | Demo mode: ${config.DEMO_MODE}`);
});