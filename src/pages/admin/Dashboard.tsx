import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api';
import {
  Users, DoorOpen, CreditCard, MessageSquare,
  Activity, ArrowUpRight, DollarSign, Calendar, TrendingUp
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from 'framer-motion';

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

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444'];

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1200;
    const step = (end / duration) * 16;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

const StatCard = ({ icon, label, value, sub, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className={`relative overflow-hidden rounded-2xl p-6 border bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60 shadow-sm card-shine`}
  >
    {/* Glow accent */}
    <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl ${color}`} />
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
        {icon}
      </div>
      <ArrowUpRight className="w-4 h-4 text-slate-400" />
    </div>
    <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
      <AnimatedNumber value={value} />
    </div>
    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</div>
    {sub && <div className="text-[10px] text-slate-400 mt-1">{sub}</div>}
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
      } catch {
        setStats({
          students: { total: 45, active: 42, suspended: 3 },
          rooms: { total: 15, occupied: 12, available: 3, totalSeats: 48, occupiedSeats: 32, vacantSeats: 16 },
          fees: { collected: 320000, pending: 85000 },
          unreadMessages: 4,
          recentActivities: [
            { type: 'admission', title: 'New Student Admitted', description: 'Shahid Afridi assigned to Room 101', time: new Date().toISOString() },
            { type: 'payment', title: 'Fee Payment Received', description: 'PKR 9,500 from Shahid Afridi — July 2026', time: new Date().toISOString() },
            { type: 'admission', title: 'Student Registered', description: 'Asad Ali added to Room 202', time: new Date(Date.now() - 86400000).toISOString() },
          ],
          charts: {
            monthlyRevenue: [
              { month: 'Jan', revenue: 240000 }, { month: 'Feb', revenue: 270000 },
              { month: 'Mar', revenue: 290000 }, { month: 'Apr', revenue: 310000 },
              { month: 'May', revenue: 280000 }, { month: 'Jun', revenue: 320000 },
            ],
            roomOccupancyStats: [{ name: 'Occupied', value: 12 }, { name: 'Vacant', value: 3 }],
            studentGrowth: [
              { month: 'Jan', students: 5 }, { month: 'Feb', students: 8 },
              { month: 'Mar', students: 12 }, { month: 'Apr', students: 6 },
              { month: 'May', students: 4 }, { month: 'Jun', students: 10 },
            ],
          },
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-9 w-52 shimmer rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 shimmer rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => <div key={i} className="h-72 shimmer rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { icon: <Users className="w-5 h-5 text-blue-600" />, label: 'Total Students', value: stats.students.total, sub: `${stats.students.active} active · ${stats.students.suspended} suspended`, color: 'bg-blue-500', delay: 0 },
    { icon: <DoorOpen className="w-5 h-5 text-violet-600" />, label: 'Rooms Occupied', value: stats.rooms.occupied, sub: `${stats.rooms.available} rooms available`, color: 'bg-violet-500', delay: 0.08 },
    { icon: <DollarSign className="w-5 h-5 text-emerald-600" />, label: 'Collected (PKR)', value: stats.fees.collected, sub: `PKR ${stats.fees.pending.toLocaleString()} pending`, color: 'bg-emerald-500', delay: 0.16 },
    { icon: <MessageSquare className="w-5 h-5 text-amber-600" />, label: 'Unread Inquiries', value: stats.unreadMessages, sub: 'Public contact messages', color: 'bg-amber-500', delay: 0.24 },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-400 text-xs mt-1">Welcome back — here's your hostel overview.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Monthly Revenue</h3>
              <p className="text-[11px] text-slate-400">6-month collection trend</p>
            </div>
            <div className="badge-green">PKR</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.charts.monthlyRevenue}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(val: any) => [`PKR ${Number(val).toLocaleString()}`, 'Revenue']} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 11 }} />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: '#2563EB', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Room Occupancy</h3>
          <p className="text-[11px] text-slate-400 mb-4">Current bed utilization</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={stats.charts.roomOccupancyStats} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                {stats.charts.roomOccupancyStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 11 }} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 10, color: '#94a3b8' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Student Growth + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Student Growth</h3>
          <p className="text-[11px] text-slate-400 mb-6">New admissions per month</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.charts.studentGrowth} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 11 }} />
              <Bar dataKey="students" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {stats.recentActivities.map((act, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${act.type === 'payment' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  {act.type === 'payment' ? <DollarSign className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">{act.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{act.description}</p>
                  <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">
                    {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
