import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { seedData } from '../config/seeder';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kp_hostel';

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    await seedData();
    process.exit(0);
  } catch (err) {
    console.error('[SEED-CLI] Error during execution:', (err as Error).message);
    process.exit(1);
  }
};

run();
