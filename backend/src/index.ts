import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectDB } from './config/db';
import { startCronScheduler } from './services/scheduler';

import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import roomRoutes from './routes/roomRoutes';
import feeRoutes from './routes/feeRoutes';
import announcementRoutes from './routes/announcementRoutes';
import facilityRoutes from './routes/facilityRoutes';
import hostelRoutes from './routes/hostelRoutes';
import messageRoutes from './routes/messageRoutes';
import reportRoutes from './routes/reportRoutes';
import notificationRoutes from './routes/notificationRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading images locally if stored in backend public
}));

// Enable CORS
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting (Prevent Brute force/DDoS on APIs)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Serve static public assets (Warden/MD pictures, gallery items, etc.)
app.use('/public', express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Test Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'KP Hostel Management API is running' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[SERVER-ERROR]', err.message);
  res.status(500).json({ success: false, message: 'An internal server error occurred' });
});

// Start auto fee reminders scheduler
startCronScheduler();

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
