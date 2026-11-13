import React, { useState, useEffect } from 'react';
import { apiRequest, INITIAL_ANNOUNCEMENTS, INITIAL_MESSAGES, INITIAL_FACILITIES } from '@/services/api';
import {
  Megaphone, Plus, Trash2, X, Check, User, Mail, Phone, Calendar,
  MessageSquare, Shield, Sparkles, Building, Eye, Clock, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  targetAudience: 'All' | 'Student' | 'Admin';
  createdAt: string;
  createdBy?: { name: string };
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

type Tab = 'bulletins' | 'facilities' | 'messages';

export default function AdminAnnouncements() {
  const [tab, setTab] = useState<Tab>('bulletins');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addFacOpen, setAddFacOpen] = useState(false);
  const [viewMsg, setViewMsg] = useState<Message | null>(null);
  const [annForm, setAnnForm] = useState({ title: '', content: '', targetAudience: 'All' as any });
  const [facForm, setFacForm] = useState({ name: '', description: '', icon: 'Wifi' });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'bulletins') {
        const d = await apiRequest('/announcements');
        if (d?.success && d.announcements) setAnnouncements(d.announcements);
      } else if (tab === 'messages') {
        const d = await apiRequest('/messages');
        if (d?.success && d.messages) setMessages(d.messages);
      } else {
        const d = await apiRequest('/facilities');
        if (d?.success && d.facilities) setFacilities(d.facilities);
      }
    } catch {
      if (tab === 'bulletins') setAnnouncements(INITIAL_ANNOUNCEMENTS as unknown as Announcement[]);
      else if (tab === 'messages') setMessages(INITIAL_MESSAGES);
      else setFacilities(INITIAL_FACILITIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  const postAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/announcements', { method: 'POST', body: JSON.stringify(annForm) });
    } catch (err) {
      console.error(err);
    }
    setAddOpen(false);
    setAnnForm({ title: '', content: '', targetAudience: 'All' });
    fetchData();
  };

  const deleteAnn = async (id: string) => {
    if (!confirm('Are you sure you want to remove this bulletin announcement?')) return;
    try {
      await apiRequest(`/announcements/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
    fetchData();
  };

  const addFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/facilities', { method: 'POST', body: JSON.stringify(facForm) });
    } catch (err) {
      console.error(err);
    }
    setAddFacOpen(false);
    setFacForm({ name: '', description: '', icon: 'Wifi' });
    fetchData();
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Delete this inquiry message?')) return;
    try {
      await apiRequest(`/messages/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
    setViewMsg(null);
    fetchData();
  };

  const openMsg = (msg: Message) => {
    setViewMsg(msg);
    msg.isRead = true;
  };

  const unreadMessagesCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
            <Megaphone className="w-4 h-4" />
            <span>Communications Desk</span>
          </div>
          <h1 className="font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Announcements & Inquiries
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Broadcast notices to residents, update hostel amenities, and review parent inquiries.
          </p>
        </div>

        {tab === 'bulletins' ? (
          <button
            onClick={() => setAddOpen(true)}
            className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-blue-600/25 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Post Bulletin</span>
          </button>
        ) : tab === 'facilities' ? (
          <button
            onClick={() => setAddFacOpen(true)}
            className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-blue-600/25 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Facility</span>
          </button>
        ) : null}
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 w-fit">
        {[
          { key: 'bulletins', label: 'Hostel Bulletins', icon: <Megaphone className="w-4 h-4" /> },
          { key: 'messages', label: `Public Inquiries ${unreadMessagesCount > 0 ? `(${unreadMessagesCount})` : ''}`, icon: <MessageSquare className="w-4 h-4" /> },
          { key: 'facilities', label: 'Hostel Amenities', icon: <Building className="w-4 h-4" /> },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === t.key
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Bulletins View */}
      {tab === 'bulletins' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-400">
              No bulletins published yet. Click "Post Bulletin" to issue an announcement.
            </div>
          ) : (
            announcements.map((ann, i) => (
              <motion.div
                key={ann._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ann.targetAudience === 'Student'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : ann.targetAudience === 'Admin'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      Target: {ann.targetAudience}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {ann.content}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold pt-1">
                    Issued by: {ann.createdBy?.name || 'Prof. Dr. Tariq Mansoor (Warden)'}
                  </p>
                </div>

                <button
                  onClick={() => deleteAnn(ann._id)}
                  title="Remove Bulletin"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-400 transition-colors self-end sm:self-start flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Messages / Inquiries View */}
      {tab === 'messages' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-400">
              No parent or student inquiry messages received.
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {messages.map(m => (
                <div
                  key={m._id}
                  onClick={() => openMsg(m)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    !m.isRead
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50/80 dark:hover:bg-blue-950/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0 pr-4">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 ${
                        !m.isRead
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {m.name.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {m.name}
                        </span>
                        {!m.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {m.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0 text-right">
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      {new Date(m.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <Eye className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Facilities View */}
      {tab === 'facilities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map((fac, i) => (
            <motion.div
              key={fac._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start space-x-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                <Building className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  {fac.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  {fac.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {addOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                  Publish New Bulletin Notice
                </h3>
                <button onClick={() => setAddOpen(false)} className="p-1 rounded-lg text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={postAnnouncement} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Notice Headline *
                  </label>
                  <input
                    required
                    value={annForm.title}
                    onChange={e => setAnnForm({ ...annForm, title: e.target.value })}
                    placeholder="e.g. Winter Sports Gala 2026 Announcement"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Target Audience
                  </label>
                  <select
                    value={annForm.targetAudience}
                    onChange={e => setAnnForm({ ...annForm, targetAudience: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="All">All Hostel Residents & Staff</option>
                    <option value="Student">Students Only</option>
                    <option value="Admin">Management Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Notice Details *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={annForm.content}
                    onChange={e => setAnnForm({ ...annForm, content: e.target.value })}
                    placeholder="Provide full schedule, timing, protocol instructions..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAddOpen(false)}
                    className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/25"
                  >
                    Broadcast Bulletin
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* View Message Modal */}
        {viewMsg && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 shadow-2xl text-xs"
            >
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Admission Inquiry
                </h3>
                <button onClick={() => setViewMsg(null)} className="p-1 rounded-lg text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Sender</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{viewMsg.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Email</span>
                    <span className="text-slate-700 dark:text-slate-300">{viewMsg.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Phone</span>
                    <span className="text-slate-700 dark:text-slate-300">{viewMsg.phone || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Message Content</span>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {viewMsg.message}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => deleteMessage(viewMsg._id)}
                  className="px-4 h-10 rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 font-bold hover:bg-red-500/10 transition-colors"
                >
                  Delete Inquiry
                </button>
                <button
                  onClick={() => setViewMsg(null)}
                  className="px-6 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
