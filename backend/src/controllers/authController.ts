import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendEmail } from '../services/email';

const JWT_SECRET = process.env.JWT_SECRET || 'kp_youth_secret_key_access_2026_987654321';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'kp_youth_secret_key_refresh_2026_123456789';

const generateTokens = (user: any) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role, status: user.status },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role, status: user.status },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Temp store for password reset OTPs in memory for MVP simplicity
const otpStore = new Map<string, { otp: string; expires: number }>();

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }

    const isMatch = await bcrypt.compare(password as string, user.password as string);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
    const cookieMaxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 7 days or 1 day
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 mins
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profilePhoto: user.profilePhoto,
        roomNumber: user.roomNumber
      }
    });
  } catch (error) {
    console.error('[AUTH-CONTROLLER] Login Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    let token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    console.error('[AUTH-CONTROLLER] Refresh Error:', (error as Error).message);
    return res.status(401).json({ success: false, message: 'Invalid token, please login again' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error('[AUTH-CONTROLLER] Logout Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 to prevent user enumeration, but don't send email
      return res.status(200).json({ success: true, message: 'If the email exists, a reset code has been sent.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email.toLowerCase(), { otp, expires });

    const msg = `Dear User,\n\nWe received a request to reset your password for the KP Youth University Hostel Management System.\n\nYour 6-digit verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request a password reset, please ignore this email.\n\nThank you,\nKP Youth University Hostel`;

    await sendEmail(email, 'Password Reset Code - KP Youth Hostel', msg);

    return res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to registered email'
    });
  } catch (error) {
    console.error('[AUTH-CONTROLLER] ForgotPassword Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    const record = otpStore.get(email.toLowerCase());
    if (!record) {
      return res.status(400).json({ success: false, message: 'No verification request found for this email' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    if (Date.now() > record.expires) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ success: false, message: 'Verification code has expired' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.refreshToken = undefined; // Invalidate current sessions
    await user.save();

    // Clear OTP
    otpStore.delete(email.toLowerCase());

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. Please login with your new password.'
    });
  } catch (error) {
    console.error('[AUTH-CONTROLLER] ResetPassword Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
