import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'Admin' | 'Student';
    status: 'Active' | 'Suspended';
  };
}

interface JwtPayload {
  id: string;
  email: string;
  role: 'Admin' | 'Student';
  status: 'Active' | 'Suspended';
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Check headers or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kp_youth_secret_key_access_2026_987654321') as JwtPayload;
    
    // Find the user to ensure they still exist and are active
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }

    req.user = {
      id: user._id.toString() as string,
      email: user.email,
      role: user.role,
      status: user.status
    };

    return next();
  } catch (error) {
    console.error('[AUTH-MIDDLEWARE] Token verification failed:', (error as Error).message);
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'Admin') {
    return next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
  }
};

export const studentOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'Student') {
    return next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied. Student privileges required.' });
  }
};
