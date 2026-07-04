import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  LayoutDashboard, Users, DoorOpen, CreditCard,
  Megaphone, Settings, LogOut, Menu, X, Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { to: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/admin/students',  icon: <Users className="w-5 h-5" />,          label: 'Students' },
  { to: '/admin/rooms',     icon: <DoorOpen className="w-5 h-5" />,        label: 'Rooms' },
  { to: '/admin/fees',      icon: <CreditCard className="w-5 h-5" />,      label: 'Fee Log' },
  { to: '/admin/announcements', icon: <Megaphone className="w-5 h-5" />,  label: 'Announcements' },
  { to: '/admin/settings',  icon: <Settings className="w-5 h-5" />,        label: 'Settings' },
];

function SidebarLink({ to, icon, label, active, onClick }: { to: string; icon: React.ReactNode; label: string; active: boolean; onClick?: () => void }) {
  return (
    <Link to={to} onClick={onClick}>
      <motion.div
        whileHover={{ x: 4 }}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer font-medium text-sm ${
          active ? 'nav-active' : 'nav-inactive'
        }`}
      >
        {icon}
        <span>{label}</span>
        {active && <motion.div layoutId="admin-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
      </motion.div>
    </Link>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Admin')) {
      navigate('/auth/login');
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin" />
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Verifying Session...</span>
        </div>
      </div>
    );
  }

  const activePath = location.pathname;

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="flex items-center space-x-3 px-2 mb-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-blue-500/30 text-sm">
          KP
        </div>
        <div>
          <span className="font-bold text-sm text-slate-900 dark:text-white block leading-none">Warden Portal</span>
          <span className="text-[10px] text-slate-400">KP Youth Hostel</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 mt-4">
        {navLinks.map(link => (
          <SidebarLink
            key={link.to}
            to={link.to}
            icon={link.icon}
            label={link.label}
            active={activePath === link.to || activePath.startsWith(link.to + '/')}
            onClick={() => setSidebarOpen(false)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs uppercase border border-blue-200 dark:border-blue-900">
            {user.name.substring(0, 2)}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate">Hostel Manager</p>
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

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-6 flex-shrink-0 backdrop-blur-sm">
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {activePath.split('/').pop()?.replace(/-/g, ' ')}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 text-slate-500 dark:text-slate-400">
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <div className="hidden md:flex items-center space-x-2 border-l border-slate-200 dark:border-slate-700 pl-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold uppercase">
                {user.name.substring(0,2)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-400">Warden</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <motion.div
            key={activePath}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile Drawer */}
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
                <span className="font-bold text-sm text-slate-900 dark:text-white">Warden Portal</span>
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
