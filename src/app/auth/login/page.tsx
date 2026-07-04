"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ArrowLeft, Key, Mail, Lock, Eye, EyeOff, ShieldAlert, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/services/api';

type AuthState = 'login' | 'forgot' | 'reset';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  
  // Auth state controller
  const [state, setState] = useState<AuthState>('login');
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'Admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    }
  }, [user, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const loggedUser = await login(email, password, rememberMe);
      if (loggedUser.role === 'Admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const data = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      if (data.success) {
        setSuccessMsg('Verification code sent to your registered email.');
        // Transition to reset page after 2 seconds
        setTimeout(() => {
          setState('reset');
          setSuccessMsg(null);
        }, 2000);
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const data = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword })
      });
      if (data.success) {
        setSuccessMsg('Password updated successfully. You can now login.');
        setTimeout(() => {
          setState('login');
          setSuccessMsg(null);
          setPassword('');
          setNewPassword('');
          setOtp('');
        }, 2500);
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Failed to reset password. Check OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background radial overlays */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-600/10 blur-[130px] animate-pulse" style={{ animationDuration: '9s' }} />
        <div className="absolute -bottom-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-emerald-500/10 blur-[130px] animate-pulse" style={{ animationDuration: '11s' }} />
      </div>

      <div className="w-full max-w-[450px] z-10">
        
        {/* Back Link to Landing */}
        <Link href="/" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-xs font-semibold uppercase mb-6 tracking-wide">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </Link>

        {/* Auth Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl p-8 sm:p-10 shadow-2xl">
          
          {/* Card Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-500/10 mx-auto mb-4">
              KP
            </div>
            {state === 'login' && (
              <>
                <h2 className="font-display font-extrabold text-2xl text-white">Login Portal</h2>
                <p className="text-slate-400 text-xs mt-1">Hostel Manager or Student Resident Access</p>
              </>
            )}
            {state === 'forgot' && (
              <>
                <h2 className="font-display font-extrabold text-2xl text-white">Recover Password</h2>
                <p className="text-slate-400 text-xs mt-1">Enter email to request a 6-digit OTP code</p>
              </>
            )}
            {state === 'reset' && (
              <>
                <h2 className="font-display font-extrabold text-2xl text-white">Reset Password</h2>
                <p className="text-slate-400 text-xs mt-1">Enter OTP code and configure new password</p>
              </>
            )}
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="p-3 mb-6 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start space-x-3 text-red-400 text-xs">
              <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start space-x-3 text-emerald-400 text-xs">
              <Check className="w-4.5 h-4.5 flex-shrink-0 mt-0.5 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Forms */}
          {state === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-800 bg-slate-900/50 text-white text-sm focus:border-blue-600 focus:outline-none transition-colors"
                    placeholder="name@kpyouth.com"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Password</label>
                  <button
                    type="button"
                    onClick={() => setState('forgot')}
                    className="text-blue-500 hover:text-blue-400 text-xs font-medium"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-11 pr-11 rounded-xl border border-slate-800 bg-slate-900/50 text-white text-sm focus:border-blue-600 focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="remember" className="ml-2 text-xs text-slate-400 select-none cursor-pointer">
                  Remember my session
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl btn-gradient font-display text-sm tracking-wide mt-2"
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>
          )}

          {state === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-800 bg-slate-900/50 text-white text-sm focus:border-blue-600 focus:outline-none transition-colors"
                    placeholder="name@kpyouth.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl btn-gradient font-display text-sm tracking-wide mt-2"
              >
                {loading ? 'Sending code...' : 'Request Reset Code'}
              </button>
              <button
                type="button"
                onClick={() => setState('login')}
                className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {state === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full h-11 px-4 rounded-xl border border-slate-800 bg-slate-900/30 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">6-Digit OTP Code</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-800 bg-slate-900/50 text-white text-sm focus:border-blue-600 focus:outline-none transition-colors tracking-widest text-center font-bold"
                    placeholder="000000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Configure New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 pl-11 pr-11 rounded-xl border border-slate-800 bg-slate-900/50 text-white text-sm focus:border-blue-600 focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl btn-gradient font-display text-sm tracking-wide mt-2"
              >
                {loading ? 'Updating password...' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => setState('login')}
                className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancel and Sign In
              </button>
            </form>
          )}

        </div>

        {/* Demo Credentials Footer */}
        <div className="mt-8 text-center bg-slate-950/40 rounded-2xl border border-slate-850 p-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center justify-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Demo Access Credentials</span>
          </h4>
          <div className="grid grid-cols-2 gap-4 text-[10px]">
            <div className="border-r border-slate-800 pr-2">
              <span className="text-blue-500 block font-bold">Warden (Admin)</span>
              <span className="text-slate-300">admin@kpyouth.com</span>
              <span className="text-slate-500 block">Pass: admin123</span>
            </div>
            <div className="pl-2">
              <span className="text-emerald-500 block font-bold">Student (Resident)</span>
              <span className="text-slate-300">student@kpyouth.com</span>
              <span className="text-slate-500 block">Pass: student123</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
