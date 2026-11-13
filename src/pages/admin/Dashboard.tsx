import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api';
import {
  Users, DoorOpen, CreditCard, MessageSquare,
  ArrowUpRight, DollarSign, Calendar, TrendingUp, Sparkles,
  UserPlus, BedDouble, Receipt, BellRing, CheckCircle2, ShieldCheck
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface StatsType {
  students: { total: number; active: number; suspended: number };
  rooms: { total: number; occupied: number; available: number; totalSeats: number; occupiedSeats: number; vacantSeats: number };
  fees: { collected: number; pending: number };
  unreadMessages: number;
  recentActivities: Array<{ type: 'admission' | 'payment'; title: string; description: string; time: string }>;
  charts: {
    monthlyRevenue: Array<{ month: string; revenue: number }>;
    roomOccupancyStats: Array<{ name: string; value: number }>;
    studentGrowth: Array<{ month: string; students: number }>;
  };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1000;
    const step = Math.max(1, (end / duration) * 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

const StatCard = ({ icon, label, value, sub, color, badge, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    whileHover={{ y: -3, transition: { duration: 0.15 } }}
    className="relative overflow-hidden rounded-2xl p-5 border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm transition-all"
  >
    <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl ${color}`} />
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-15 shadow-sm`}>
        {icon}
      </div>
      {badge && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {badge}
        </span>
      )}
    </div>
    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">
      <AnimatedNumber value={value} />
    </div>
    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</div>
    {sub && <div className="text-[11px] text-slate-400 mt-1">{sub}</div>}
  </motion.div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest('/reports/stats');
        if (data.success && data.stats) setStats(data.stats);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-60 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          <div className="h-72 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const occupancyRate = stats.rooms.totalSeats > 0
    ? Math.round((stats.rooms.occupiedSeats / stats.rooms.totalSeats) * 100)
    : 0;

  const statCards = [
    {
      icon: <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      label: 'Enrolled Residents',
      value: stats.students.total,
      sub: `${stats.students.active} Active · ${stats.students.suspended} Suspended`,
      color: 'bg-blue-500',
      badge: '98% Retention',
      delay: 0,
    },
    {
      icon: <DoorOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      label: 'Room Occupancy',
      value: stats.rooms.occupiedSeats,
      sub: `${stats.rooms.vacantSeats} beds available of ${stats.rooms.totalSeats} total`,
      color: 'bg-indigo-500',
      badge: `${occupancyRate}% Full`,
      delay: 0.05,
    },
    {
      icon: <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      label: 'Collected Dues (PKR)',
      value: stats.fees.collected,
      sub: `PKR ${stats.fees.pending.toLocaleString()} pending this month`,
      color: 'bg-emerald-500',
      badge: 'Nov 2026',
      delay: 0.1,
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      label: 'Pending Inquiries',
      value: stats.unreadMessages,
      sub: 'Parent & student admission queries',
      color: 'bg-amber-500',
      badge: 'Need Review',
      delay: 0.15,
    },
  ];

  return (
    <div className="space-y-7">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-teal-900/10 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-teal-950/40 p-5 rounded-2xl border border-blue-500/15">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Warden Command Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Hostel Operations Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time occupancy monitoring, billing status, and resident affairs.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/students"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </Link>
          <Link
            to="/admin/rooms"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700"
          >
            <BedDouble className="w-3.5 h-3.5" />
            <span>Manage Rooms</span>
          </Link>
          <Link
            to="/admin/fees"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Fee Ledger</span>
          </Link>
          <Link
            to="/admin/announcements"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Notice Board</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Collection Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Monthly Fee Collections</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Automated billing history (Last 6 Months)</p>
            </div>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
              PKR Currency
            </span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={stats.charts.monthlyRevenue}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(val: any) => [`PKR ${Number(val).toLocaleString()}`, 'Collections']}
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12, color: '#fff' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: '#3B82F6', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Room Occupancy Donut */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Bed Space Utilization</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {stats.rooms.vacantSeats} Vacant
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">Live floor bed distribution</p>
          </div>

          <ResponsiveContainer width="100%" height={175}>
            <PieChart>
              <Pie
                data={stats.charts.roomOccupancyStats}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={4}
                dataKey="value"
              >
                {stats.charts.roomOccupancyStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 11, color: '#fff' }} />
              <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 11, color: '#94a3b8' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Total Beds</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{stats.rooms.totalSeats}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Occupancy</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{occupancyRate}%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Admissions Growth + Live Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Growth Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Admissions & Influx</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Active resident intake by month</p>
            </div>
            <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +18% Semester Intake
            </span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={stats.charts.studentGrowth} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 11, color: '#fff' }} />
              <Bar dataKey="students" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Live Activity Feed</h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-4">
            {stats.recentActivities.map((act, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-start space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800/80 last:border-0 last:pb-0"
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    act.type === 'payment'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  }`}
                >
                  {act.type === 'payment' ? <DollarSign className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{act.title}</p>
                    <span className="text-[10px] text-slate-400">{act.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{act.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
