import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { LayoutDashboard, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Student')) {
      navigate('/auth/login');
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== 'Student') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-t-emerald-500 border-slate-800 rounded-full animate-spin" />
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Loading Resident Session...</span>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-center space-x-3 px-2 mb-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-emerald-500/30 text-sm">
          KP
        </div>
        <div>
          <span className="font-bold text-sm text-slate-900 dark:text-white block leading-none">Student Portal</span>
          <span className="text-[10px] text-slate-400">KP Youth Hostel</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 mt-4">
        <Link to="/student/dashboard" onClick={() => setSidebarOpen(false)}>
          <motion.div
            whileHover={{ x: 4 }}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
              location.pathname === '/student/dashboard' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'nav-inactive'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </motion.div>
        </Link>
      </nav>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs uppercase border border-emerald-200 dark:border-emerald-900">
            {user.name.substring(0, 2)}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate">Room {user.roomNumber || 'Unassigned'}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-all duration-200 font-medium text-sm group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[rgb(2,6,23)] text-slate-900 dark:text-white transition-colors duration-300">

      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-6 flex-shrink-0">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <span className="hidden sm:block text-xs font-semibold uppercase tracking-widest text-slate-400">Resident Board</span>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 text-slate-500 dark:text-slate-400">
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <div className="hidden md:flex items-center space-x-2 border-l border-slate-200 dark:border-slate-700 pl-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold uppercase">
                {user.name.substring(0,2)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-400">Resident Student</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 p-6 flex flex-col shadow-2xl lg:hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-sm">Student Portal</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
