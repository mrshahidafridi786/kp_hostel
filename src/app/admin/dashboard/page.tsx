"use client";

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api';
import {
  Users, DoorOpen, CreditCard, MessageSquare, TrendingUp,
  Activity, ArrowUpRight, DollarSign, Calendar
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiRequest('/reports/stats');
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('[STATS-FETCH] Failed, using offline mock');
        setError('Using offline demo data');
        // Let's create an offline mock stats so it renders even if backend connection fails
        setStats({
          students: { total: 45, active: 42, suspended: 3 },
          rooms: { total: 15, occupied: 12, available: 3, totalSeats: 48, occupiedSeats: 32, vacantSeats: 16 },
          fees: { collected: 320000, pending: 85000 },
          unreadMessages: 4,
          recentActivities: [
            { type: 'admission', title: 'New Student Admitted', description: 'Shahid Afridi assigned to Room 101', time: new Date().toISOString() },
            { type: 'payment', title: 'Fee Payment Received', description: 'PKR 9,500 collected from Shahid Afridi for July 2026', time: new Date().toISOString() },
            { type: 'admission', title: 'Student Registered', description: 'Asad Ali added to Room 202', time: new Date(Date.now() - 24 * 3600 * 1000).toISOString() }
          ],
          charts: {
            monthlyRevenue: [
              { month: 'Jan', revenue: 240000 },
              { month: 'Feb', revenue: 270000 },
              { month: 'Mar', revenue: 290000 },
              { month: 'Apr', revenue: 310000 },
              { month: 'May', revenue: 280000 },
              { month: 'Jun', revenue: 320000 }
            ],
            roomOccupancyStats: [
              { name: 'Occupied Rooms', value: 12 },
              { name: 'Vacant Rooms', value: 3 }
            ],
            studentGrowth: [
              { month: 'Jan', students: 5 },
              { month: 'Feb', students: 8 },
              { month: 'Mar', students: 12 },
              { month: 'Apr', students: 6 },
              { month: 'May', students: 4 },
              { month: 'Jun', students: 10 }
            ]
          }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 lg:col-span-2 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const cardData = [
    { title: 'Total Residents', value: stats.students.total, sub: `${stats.students.active} Active / ${stats.students.suspended} Suspended`, icon: <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />, bg: 'bg-blue-500/10' },
    { title: 'Room Occupancy', value: `${stats.rooms.occupiedSeats}/${stats.rooms.totalSeats}`, sub: `${stats.rooms.vacantSeats} Empty Seats / ${stats.rooms.available} Vacant Rooms`, icon: <DoorOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, bg: 'bg-emerald-500/10' },
    { title: 'Collected Fees', value: `PKR ${stats.fees.collected.toLocaleString()}`, sub: `Outstanding: PKR ${stats.fees.pending.toLocaleString()}`, icon: <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />, bg: 'bg-amber-500/10' },
    { title: 'Pending Inquiries', value: stats.unreadMessages, sub: 'Messages from Public Form', icon: <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />, bg: 'bg-indigo-500/10' }
  ];

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Real-time analytics for KP Youth University Hostel.
          </p>
        </div>
        {error && (
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
            {error}
          </span>
        )}
      </div>

      {/* Grid: Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card) => (
          <div key={card.title} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-start justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">{card.title}</span>
              <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mb-2">{card.value}</h3>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">{card.sub}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-slate-850 dark:text-white text-base">Monthly Income Collection</h3>
              <p className="text-slate-400 text-[10px]">Total received rent from students (Last 6 Months)</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.charts.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Occupancy Pie Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-display font-bold text-slate-850 dark:text-white text-base">Room Occupancy Distribution</h3>
            <p className="text-slate-400 text-[10px]">Ratio of occupied vs completely vacant rooms</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.charts.roomOccupancyStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.charts.roomOccupancyStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Growth & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Growth Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="font-display font-bold text-slate-850 dark:text-white text-base">Resident Registrations</h3>
            <p className="text-slate-400 text-[10px]">New student admissions per month (Last 6 Months)</p>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.studentGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Bar dataKey="students" fill="#10B981" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities list */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col justify-between">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-slate-850 dark:text-white text-base">Recent Activities</h3>
              <p className="text-slate-400 text-[10px]">Latest log events from database</p>
            </div>
            <Activity className="w-4.5 h-4.5 text-slate-400" />
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {stats.recentActivities.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-8">No recent logs recorded.</p>
            ) : (
              stats.recentActivities.map((act, idx) => (
                <div key={idx} className="flex space-x-3 items-start text-xs pb-3 border-b border-slate-100 dark:border-slate-800/80 last:border-0 last:pb-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    act.type === 'admission' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {act.type === 'admission' ? <Users className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 truncate">{act.title}</h5>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed mb-0.5">{act.description}</p>
                    <span className="text-[9px] text-slate-400 block">{new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
