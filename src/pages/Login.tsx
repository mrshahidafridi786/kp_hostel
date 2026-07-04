import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, ShieldAlert, Sparkles, Check, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AuthState = 'login' | 'forgot' | 'reset';

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [state, setState] = useState<AuthState>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const loggedUser = await login(email, password, rememberMe);
      navigate(loggedUser.role === 'Admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      setErrorMsg((err as Error).message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccessMsg('Verification code sent to your email.');
      setLoading(false);
      setTimeout(() => { setState('reset'); setSuccessMsg(null); }, 2000);
    }, 1200);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccessMsg('Password updated! You can now sign in.');
      setLoading(false);
      setTimeout(() => { setState('login'); setSuccessMsg(null); }, 2500);
    }, 1200);
  };

  const stateConfig = {
    login:  { title: 'Welcome Back', sub: 'Sign in to your Hostel portal' },
    forgot: { title: 'Reset Password', sub: 'Enter your email to receive a reset code' },
    reset:  { title: 'Set New Password', sub: 'Enter your OTP and new password' },
  };

  return (
    <div className="min-h-screen bg-[rgb(2,6,23)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.07, 0.12, 0.07] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-1/4 -left-1/4 w-[80vw] h-[80vw] rounded-full bg-blue-600 blur-[120px]" />
        <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.05, 0.10, 0.05] }} transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-1/4 -right-1/4 w-[70vw] h-[70vw] rounded-full bg-indigo-600 blur-[120px]" />
        <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 w-[40vw] h-[40vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/5 blur-[100px]" />
      </div>

      {/* Mesh grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNMCAwaDFoMzl2MUgwem0wIDM5aDQwdjFIMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiLz48cGF0aCBkPSJNMCAwdjQwaDFWMHptMzkgMHY0MGgxVjB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpIi8+PC9nPjwvc3ZnPg==')] opacity-30 pointer-events-none" />

      <div className="w-full max-w-[440px] z-10">
        <Link to="/" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-xs font-semibold mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl p-8 shadow-2xl shadow-black/50"
        >
          {/* Logo + Title */}
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.4 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-xl shadow-blue-500/30 mx-auto mb-4 cursor-default"
            >
              KP
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.div key={state} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}>
                <h1 className="font-bold text-2xl text-white">{stateConfig[state].title}</h1>
                <p className="text-slate-400 text-xs mt-1">{stateConfig[state].sub}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2 text-red-400 text-xs">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start space-x-2 text-emerald-400 text-xs">
                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <AnimatePresence mode="wait">
            {state === 'login' && (
              <motion.form key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-800 bg-slate-900/60 text-white text-sm focus:border-blue-500 transition-colors"
                      placeholder="name@kpyouth.com" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                    <button type="button" onClick={() => setState('forgot')} className="text-blue-400 hover:text-blue-300 text-xs transition-colors">Forgot?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                    <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full h-11 pl-11 pr-11 rounded-xl border border-slate-800 bg-slate-900/60 text-white text-sm focus:border-blue-500 transition-colors"
                      placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0" />
                  <span className="text-xs text-slate-400 select-none">Remember my session</span>
                </label>
                <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
                  className="w-full h-12 rounded-xl btn-gradient text-sm font-bold mt-2 disabled:opacity-70">
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </span>
                  ) : 'Sign In to Portal'}
                </motion.button>
              </motion.form>
            )}

            {state === 'forgot' && (
              <motion.form key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Registered Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-800 bg-slate-900/60 text-white text-sm focus:border-blue-500"
                      placeholder="name@kpyouth.com" />
                  </div>
                </div>
                <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
                  className="w-full h-12 rounded-xl btn-gradient text-sm font-bold disabled:opacity-70">
                  {loading ? 'Sending code...' : 'Request Reset Code'}
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
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">6-Digit OTP Code</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                    <input type="text" required maxLength={6} value={otp} onChange={e => setOtp(e.target.value)}
                      className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-800 bg-slate-900/60 text-white text-sm text-center tracking-widest font-bold focus:border-blue-500"
                      placeholder="000000" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                    <input type={showPassword ? 'text' : 'password'} required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      className="w-full h-11 pl-11 pr-11 rounded-xl border border-slate-800 bg-slate-900/60 text-white text-sm focus:border-blue-500" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
                  className="w-full h-12 rounded-xl btn-gradient text-sm font-bold disabled:opacity-70">
                  {loading ? 'Updating...' : 'Update Password'}
                </motion.button>
                <button type="button" onClick={() => setState('login')} className="w-full text-xs text-slate-400 hover:text-white transition-colors">
                  ← Cancel and Sign In
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Demo credentials */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-6 p-5 rounded-2xl border border-slate-800/60 bg-slate-950/50 backdrop-blur-sm">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Demo Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-[11px]">
            <div className="space-y-1 border-r border-slate-800 pr-4">
              <span className="text-blue-400 font-bold block">Warden (Admin)</span>
              <span className="text-slate-300 block">admin@kpyouth.com</span>
              <span className="text-slate-500 font-mono">admin123</span>
            </div>
            <div className="space-y-1 pl-0">
              <span className="text-emerald-400 font-bold block">Student</span>
              <span className="text-slate-300 block">student@kpyouth.com</span>
              <span className="text-slate-500 font-mono">student123</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
