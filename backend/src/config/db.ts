import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedData } from './seeder';
import User from '../models/User';

dotenv.config();

let mongoServer: any = null;

export const connectDB = async (): Promise<void> => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    let isInMemory = false;

    if (!mongoUri) {
      console.log('[DB] No MONGODB_URI found in environment variables.');
    }

    try {
      // 1. Attempt to connect to configured/local MongoDB
      const targetUri = mongoUri || 'mongodb://127.0.0.1:27017/kp_hostel';
      console.log(`[DB] Attempting connection to: ${targetUri.replace(/:([^@]+)@/, ':****@')}`);
      await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 3000 });
      console.log('[DB] Connected to MongoDB server.');
    } catch (err) {
      // 2. Fall back to MongoMemoryServer
      console.log('[DB] MongoDB server not reachable. Starting in-memory MongoDB fallback...');
      
      // Dynamic import to handle ignore-scripts installation
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      isInMemory = true;

      console.log(`[DB] Connecting to In-Memory instance: ${mongoUri}`);
      await mongoose.connect(mongoUri as string);
      console.log('[DB] Connected to In-Memory MongoDB.');
    }

    // 3. Auto-seed database if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[DB] Database is empty. Seeding initial data...');
      await seedData();
      console.log('[DB] Database auto-seeded successfully.');
    } else {
      console.log(`[DB] Database already has ${userCount} users. Auto-seeding skipped.`);
    }

  } catch (error) {
    console.error(`[DB] Error during connection initialization: ${(error as Error).message}`);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      console.log('[DB] In-Memory MongoDB stopped.');
    }
  } catch (error) {
    console.error(`[DB] Error disconnecting: ${(error as Error).message}`);
  }
};

export default connectDB;
