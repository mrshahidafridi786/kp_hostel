"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/services/api';
import {
  Megaphone, Plus, Trash2, ShieldAlert, Check, X,
  MessageSquare, User, Mail, Phone, Calendar, Info, Award, LayoutGrid, AlertCircle
} from 'lucide-react';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  targetAudience: 'All' | 'Student' | 'Admin';
  createdAt: string;
}

interface Message {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Facility {
  _id: string;
  name: string;
  description: string;
  icon: string;
}

export default function AdminAnnouncementsPage() {
  const [activeTab, setActiveTab] = useState<'bulletins' | 'facilities' | 'messages'>('bulletins');
  
  // Data lists
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  
  // Skeletons
  const [loading, setLoading] = useState(true);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewMessage, setViewMessage] = useState<Message | null>(null);

  // Form states
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    targetAudience: 'All' as any
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bulletins') {
        const data = await apiRequest('/announcements');
        if (data.success) setAnnouncements(data.announcements);
      } else if (activeTab === 'messages') {
        const data = await apiRequest('/messages');
        if (data.success) setMessages(data.messages);
      } else if (activeTab === 'facilities') {
        const data = await apiRequest('/facilities');
        if (data.success) setFacilities(data.facilities);
      }
    } catch (err) {
      console.warn('[ANNOUNCEMENTS] Fetch failed, using mocks');
      // Mock setups
      if (activeTab === 'bulletins') {
        setAnnouncements([
          { _id: 'a1', title: 'Monthly rent dues reminders', content: 'Dear students, please pay your rent invoices by the 5th of July to avoid fine accumulation.', targetAudience: 'Student', createdAt: new Date().toISOString() },
          { _id: 'a2', title: 'Curfew Timing Strictness', content: 'The gate locks at 10:00 PM. Anyone arriving later must present a parent permission slip to Warden office.', targetAudience: 'All', createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() }
        ]);
      } else if (activeTab === 'messages') {
        setMessages([
          { _id: 'm1', name: 'Zia Khan', email: 'zia@gmail.com', phone: '0300-1234567', message: 'Hello, I want to inquire about single room seats. I am starting my studies at Peshawar University this fall.', isRead: false, createdAt: new Date().toISOString() },
          { _id: 'm2', name: 'Adnan Ahmed', email: 'adnan.ahmed@yahoo.com', phone: '0345-9988776', message: 'Is mess food included in the monthly rent fee or is it billed separately?', isRead: true, createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString() }
        ]);
      } else if (activeTab === 'facilities') {
        setFacilities([
          { _id: 'f1', name: 'High Speed WiFi', description: '24/7 fiber internet connection across all rooms.', icon: 'Wifi' },
          { _id: 'f2', name: 'CCTV Security', description: 'Professional guards and round-the-clock cameras.', icon: 'Shield' }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiRequest('/announcements', {
        method: 'POST',
        body: JSON.stringify(announcementForm)
      });
      if (data.success) {
        setAddModalOpen(false);
        setAnnouncementForm({ title: '', content: '', targetAudience: 'All' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
      // Mock add
      setAnnouncements(prev => [
        { _id: Date.now().toString(), ...announcementForm, createdAt: new Date().toISOString() },
        ...prev
      ]);
      setAddModalOpen(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bulletin announcement?')) return;
    try {
      await apiRequest(`/announcements/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
      setAnnouncements(prev => prev.filter(a => a._id !== id));
    }
  };

  const markMessageAsRead = async (msg: Message) => {
    setViewMessage(msg);
    if (msg.isRead) return;
    try {
      await apiRequest(`/messages/${msg._id}/read`, { method: 'PUT' });
      setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header and top tab selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Bulletins & Inquiries
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Manage public announcements, update featured page facilities, and view public inquiries.
          </p>
        </div>
        {activeTab === 'bulletins' && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="h-10 px-5 rounded-xl btn-gradient text-xs font-semibold flex items-center space-x-2 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Post Bulletin</span>
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('bulletins')}
          className={`px-5 py-3 border-b-2 font-medium text-xs tracking-wider uppercase transition-all duration-200 ${
            activeTab === 'bulletins'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Bulletins Board
        </button>
        <button
          onClick={() => setActiveTab('facilities')}
          className={`px-5 py-3 border-b-2 font-medium text-xs tracking-wider uppercase transition-all duration-200 ${
            activeTab === 'facilities'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Landing Facilities
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-5 py-3 border-b-2 font-medium text-xs tracking-wider uppercase transition-all duration-200 ${
            activeTab === 'messages'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Public Inquiries
        </button>
      </div>

      {/* --- PANEL CONTENT --- */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading details panel...</div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB: BULLETINS */}
          {activeTab === 'bulletins' && (
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 text-slate-400">
                  No announcements posted on the bulletins board.
                </div>
              ) : (
                announcements.map(ann => (
                  <div
                    key={ann._id}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-start justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-display font-bold text-slate-850 dark:text-white text-base">
                          {ann.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          ann.targetAudience === 'Student' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'
                        }`}>
                          Audience: {ann.targetAudience}
                        </span>
                      </div>
                      <p className="text-slate-650 dark:text-slate-350 text-xs leading-relaxed max-w-2xl font-sans">
                        {ann.content}
                      </p>
                      <span className="text-[10px] text-slate-400 block">
                        Published on: {new Date(ann.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteAnnouncement(ann._id)}
                      className="p-1.5 rounded-lg border border-slate-105 dark:border-slate-855 text-slate-500 hover:text-red-500 hover:bg-slate-50 flex items-center justify-center flex-shrink-0 ml-4"
                      title="Remove announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: FACILITIES */}
          {activeTab === 'facilities' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {facilities.map(fac => (
                <div
                  key={fac._id}
                  className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm flex space-x-4 items-start"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-850 dark:text-white mb-1.5">{fac.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{fac.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-105 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4 pl-6">Contact Name</th>
                      <th className="p-4">Contact Detail</th>
                      <th className="p-4">Message Snippet</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {messages.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-400">
                          No public inquiry messages received yet.
                        </td>
                      </tr>
                    ) : (
                      messages.map(msg => (
                        <tr key={msg._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="p-4 pl-6 font-bold text-slate-800 dark:text-white">
                            {msg.name}
                          </td>
                          <td className="p-4 text-slate-500">
                            <div>
                              <span>{msg.email}</span>
                              <span className="block text-[10px] text-slate-400">{msg.phone}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-650 max-w-xs truncate">
                            {msg.message}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              msg.isRead ? 'bg-slate-200 text-slate-500' : 'bg-blue-600/10 text-blue-600'
                            }`}>
                              {msg.isRead ? 'Reviewed' : 'Unread'}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => markMessageAsRead(msg)}
                              className="h-8 px-3 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-[11px] font-bold inline-flex items-center space-x-1"
                            >
                              <span>View Inquiry</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* --- ANNOUNCEMENT CREATE MODAL --- */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Post Announcement</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-650">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Announcement Title</label>
                <input
                  type="text" required value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:border-blue-600 focus:outline-none"
                  placeholder="e.g. Electricity Outage Notice"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Target Audience</label>
                <select
                  value={announcementForm.targetAudience}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, targetAudience: e.target.value as any })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:border-blue-600 focus:outline-none"
                >
                  <option value="All">All Audiences (Admin + Students)</option>
                  <option value="Student">Students Only</option>
                  <option value="Admin">Admins Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Announcement Message</label>
                <textarea
                  required rows={4} value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:border-blue-600 focus:outline-none resize-none"
                  placeholder="Enter details of the announcement notice..."
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button" onClick={() => setAddModalOpen(false)}
                  className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 h-10 rounded-xl btn-gradient font-semibold">
                  Publish Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- INQUIRY VIEWER MODAL --- */}
      {viewMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl font-sans">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">Public Admission Inquiry</h3>
              <button onClick={() => setViewMessage(null)} className="text-slate-400 hover:text-slate-655">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">{viewMessage.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">{viewMessage.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">{viewMessage.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">{new Date(viewMessage.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-2">Message Body</span>
                <p className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {viewMessage.message}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewMessage(null)}
                  className="px-6 h-10 rounded-xl btn-gradient font-semibold"
                >
                  Close Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
