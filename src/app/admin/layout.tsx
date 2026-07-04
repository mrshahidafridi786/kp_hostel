"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  LayoutDashboard, Users, DoorOpen, CreditCard,
  Megaphone, ShieldCheck, Settings, LogOut, Menu, X, Sun, Moon, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, icon, label, active, onClick }) => {
  return (
    <Link href={href} onClick={onClick}>
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer font-medium text-sm ${
        active
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
      }`}>
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePath, setActivePath] = useState('/admin/dashboard');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActivePath(window.location.pathname);
    }
  }, []);

  // Guard: if loading session, show loading spinner. If not admin, redirect.
  useEffect(() => {
    if (!loading && (!user || user.role !== 'Admin')) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-t-blue-600 border-r-transparent border-l-transparent border-b-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wider text-slate-450 uppercase">Loading Admin Session...</span>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  const navLinks = [
    { href: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { href: '/admin/students', icon: <Users className="w-5 h-5" />, label: 'Students' },
    { href: '/admin/rooms', icon: <DoorOpen className="w-5 h-5" />, label: 'Rooms' },
    { href: '/admin/fees', icon: <CreditCard className="w-5 h-5" />, label: 'Fee Log' },
    { href: '/admin/announcements', icon: <Megaphone className="w-5 h-5" />, label: 'Announcements' },
    { href: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-8 flex-shrink-0">
        {/* Brand */}
        <div className="flex items-center space-x-2.5 px-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-500/20">
            KP
          </div>
          <span className="font-display font-extrabold text-lg tracking-tight">
            Warden <span className="text-blue-600 dark:text-blue-400">Portal</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1">
          {navLinks.map(link => (
            <SidebarLink
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
              active={activePath === link.href || activePath.startsWith(link.href + '/')}
              onClick={() => setActivePath(link.href)}
            />
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-9 h-9 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs uppercase">
              {user.name.substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <h5 className="font-bold text-xs text-slate-850 dark:text-white truncate">{user.name}</h5>
              <span className="text-[10px] text-slate-450 dark:text-slate-400 truncate block">Hostel Manager</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN PAGE CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header bar */}
        <header className="h-16 sm:h-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 sm:px-8 flex items-center justify-between z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h4 className="hidden sm:block text-xs font-semibold uppercase tracking-wider text-slate-450 dark:text-slate-400">
              {activePath.split('/').pop()?.replace('-', ' ')}
            </h4>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-all duration-200"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center space-x-2">
              <div className="hidden md:block text-right">
                <span className="text-xs font-bold text-slate-700 dark:text-white block">{user.name}</span>
                <span className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold block uppercase">Warden</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Inner Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          {children}
        </main>
      </div>

      {/* --- MOBILE DRAWER OVERLAY --- */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 p-6 flex flex-col space-y-8 lg:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-md">
                    KP
                  </div>
                  <span className="font-display font-extrabold text-base">
                    Warden <span className="text-blue-600">Portal</span>
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {navLinks.map(link => (
                  <SidebarLink
                    key={link.href}
                    href={link.href}
                    icon={link.icon}
                    label={link.label}
                    active={activePath === link.href || activePath.startsWith(link.href + '/')}
                    onClick={() => {
                      setSidebarOpen(false);
                      setActivePath(link.href);
                    }}
                  />
                ))}
              </nav>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-medium text-sm"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout Session</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
