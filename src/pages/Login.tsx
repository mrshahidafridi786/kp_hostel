import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, ShieldAlert, Sparkles, Check, Key, ShieldCheck, GraduationCap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AuthState = 'login' | 'forgot' | 'reset';

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [state, setState] = useState<AuthState>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'Admin' ? '/admin/dashboard' : '/student/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    try {
      const loggedUser = await login(loginEmail, loginPass, rememberMe);
      navigate(loggedUser.role === 'Admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      setErrorMsg((err as Error).message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'admin' | 'student') => {
    if (role === 'admin') {
      setEmail('admin@kpyouth.com');
      setPassword('admin123');
      handleLogin(undefined, 'admin@kpyouth.com', 'admin123');
    } else {
      setEmail('student@kpyouth.com');
      setPassword('student123');
      handleLogin(undefined, 'student@kpyouth.com', 'student123');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccessMsg('Verification code sent to your registered email.');
      setLoading(false);
      setTimeout(() => { setState('reset'); setSuccessMsg(null); }, 1500);
    }, 1000);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccessMsg('Password updated! You can now sign in.');
      setLoading(false);
      setTimeout(() => { setState('login'); setSuccessMsg(null); }, 2000);
    }, 1000);
  };

  const stateConfig = {
    login:  { title: 'Welcome to KP Youth', sub: 'Sign in to access your digital hostel dashboard' },
    forgot: { title: 'Reset Password', sub: 'Enter your email to receive an instant recovery code' },
    reset:  { title: 'Set New Password', sub: 'Enter your 6-digit OTP and choose a new password' },
  };

  return (
    <div className="min-h-screen bg-[rgb(2,6,23)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated ambient gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.08, 0.16, 0.08] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-1/4 -left-1/4 w-[85vw] h-[85vw] rounded-full bg-blue-600 blur-[130px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.06, 0.14, 0.06] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-1/4 -right-1/4 w-[75vw] h-[75vw] rounded-full bg-indigo-600 blur-[130px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.04)_0%,transparent_70%)]" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNMCAwaDFoMzl2MUgwem0wIDM5aDQwdjFIMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiLz48cGF0aCBkPSJNMCAwdjQwaDFWMHptMzkgMHY0MGgxVjB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpIi8+PC9nPjwvc3ZnPg==')] opacity-40 pointer-events-none" />

      <div className="w-full max-w-[460px] z-10 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-xs font-semibold group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Main Website</span>
          </Link>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Demo Mode
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-slate-800/80 bg-slate-950/85 backdrop-blur-2xl p-7 md:p-8 shadow-2xl shadow-black/70"
        >
          {/* Brand Header */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-500 p-[1px] mx-auto mb-4 shadow-xl shadow-blue-500/25">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                <span className="font-black text-xl bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
                  KP
                </span>
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={state} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2 }}>
                <h1 className="font-extrabold text-2xl text-white tracking-tight">{stateConfig[state].title}</h1>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{stateConfig[state].sub}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2 text-red-400 text-xs">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start space-x-2 text-emerald-400 text-xs">
                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <AnimatePresence mode="wait">
            {state === 'login' && (
              <motion.form key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-800 bg-slate-900/70 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                      placeholder="admin@kpyouth.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Password</label>
                    <button type="button" onClick={() => setState('forgot')} className="text-blue-400 hover:text-blue-300 text-xs transition-colors">
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full h-11 pl-11 pr-11 rounded-xl border border-slate-800 bg-slate-900/70 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                    />
                    <span className="text-xs text-slate-400 select-none">Remember this browser</span>
                  </label>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all duration-200 mt-2 disabled:opacity-70 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}

            {state === 'forgot' && (
              <motion.form key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">Registered Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-800 bg-slate-900/70 text-white text-sm focus:border-blue-500"
                      placeholder="admin@kpyouth.com" />
                  </div>
                </div>
                <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70">
                  {loading ? 'Sending verification...' : 'Request Instant Reset Code'}
                </motion.button>
                <button type="button" onClick={() => setState('login')} className="w-full text-xs text-slate-400 hover:text-white transition-colors">
                  ← Back to Sign In
                </button>
              </motion.form>
            )}

            {state === 'reset' && (
              <motion.form key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">6-Digit Code</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                    <input type="text" required maxLength={6} value={otp} onChange={e => setOtp(e.target.value)}
                      className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-800 bg-slate-900/70 text-white text-sm text-center tracking-widest font-bold focus:border-blue-500"
                      placeholder="123456" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                    <input type={showPassword ? 'text' : 'password'} required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      className="w-full h-11 pl-11 pr-11 rounded-xl border border-slate-800 bg-slate-900/70 text-white text-sm focus:border-blue-500" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
                  className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-70">
                  {loading ? 'Updating password...' : 'Update & Continue'}
                </motion.button>
                <button type="button" onClick={() => setState('login')} className="w-full text-xs text-slate-400 hover:text-white transition-colors">
                  ← Back to Sign In
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 1-Click Fast Login / Demo Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5 p-4 rounded-2xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-xl shadow-xl"
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">1-Click Demo Logins</span>
            </div>
            <span className="text-[10px] text-slate-500">Instant Access</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="flex flex-col items-start p-3 rounded-xl border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all text-left group"
            >
              <div className="flex items-center space-x-1.5 text-blue-400 font-bold text-xs mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Hostel Admin</span>
              </div>
              <span className="text-[10px] text-slate-400 group-hover:text-slate-300">Administration Office</span>
              <span className="text-[9px] font-mono text-slate-500 mt-1">admin@kpyouth.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('student')}
              className="flex flex-col items-start p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all text-left group"
            >
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs mb-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Resident Student</span>
              </div>
              <span className="text-[10px] text-slate-400 group-hover:text-slate-300">Bilal Tariq (Room 101)</span>
              <span className="text-[9px] font-mono text-slate-500 mt-1">student@kpyouth.com</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
