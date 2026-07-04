import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/services/api';
import { Megaphone, Plus, Trash2, X, Check, User, Mail, Phone, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Announcement { _id: string; title: string; content: string; targetAudience: 'All'|'Student'|'Admin'; createdAt: string; }
interface Message { _id: string; name: string; email: string; phone: string; message: string; isRead: boolean; createdAt: string; }
interface Facility { _id: string; name: string; description: string; icon: string; }

type Tab = 'bulletins' | 'facilities' | 'messages';

const MOCK_ANN: Announcement[] = [
  { _id: 'a1', title: 'Monthly Rent Due Reminder', content: 'Please pay your rent invoices by the 5th of July to avoid fine accumulation.', targetAudience: 'Student', createdAt: new Date().toISOString() },
  { _id: 'a2', title: 'Curfew Timing Notice', content: 'The gate locks at 10:00 PM. Anyone arriving later must present a parent permission slip.', targetAudience: 'All', createdAt: new Date(Date.now() - 172800000).toISOString() },
];
const MOCK_MSG: Message[] = [
  { _id: 'm1', name: 'Zia Khan', email: 'zia@gmail.com', phone: '0300-1234567', message: 'I want to inquire about single room seats for this fall semester.', isRead: false, createdAt: new Date().toISOString() },
  { _id: 'm2', name: 'Adnan Ahmed', email: 'adnan@yahoo.com', phone: '0345-9988776', message: 'Is mess food included in the monthly rent fee or billed separately?', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];
const MOCK_FAC: Facility[] = [
  { _id: 'f1', name: 'High Speed WiFi', description: '24/7 fiber internet connection across all rooms and common areas.', icon: 'Wifi' },
  { _id: 'f2', name: 'CCTV Security', description: 'Professional guards and round-the-clock camera surveillance.', icon: 'Shield' },
  { _id: 'f3', name: 'Dining Hall', description: 'Fresh halal food served three times daily in a hygienic kitchen.', icon: 'Utensils' },
  { _id: 'f4', name: 'Study Lounge', description: 'Quiet study rooms available 24/7 for focused academic work.', icon: 'Book' },
];

export default function AdminAnnouncements() {
  const [tab, setTab] = useState<Tab>('bulletins');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [viewMsg, setViewMsg] = useState<Message | null>(null);
  const [annForm, setAnnForm] = useState({ title: '', content: '', targetAudience: 'All' as any });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'bulletins') { const d = await apiRequest('/announcements'); if (d.success) setAnnouncements(d.announcements); }
      else if (tab === 'messages') { const d = await apiRequest('/messages'); if (d.success) setMessages(d.messages); }
      else { const d = await apiRequest('/facilities'); if (d.success) setFacilities(d.facilities); }
    } catch {
      if (tab === 'bulletins') setAnnouncements(MOCK_ANN);
      else if (tab === 'messages') setMessages(MOCK_MSG);
      else setFacilities(MOCK_FAC);
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [tab]);

  const postAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await apiRequest('/announcements', { method: 'POST', body: JSON.stringify(annForm) }); }
    catch { setAnnouncements(prev => [{ _id: Date.now().toString(), ...annForm, createdAt: new Date().toISOString() }, ...prev]); }
    setAddOpen(false); setAnnForm({ title: '', content: '', targetAudience: 'All' }); fetchData();
  };

  const deleteAnn = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try { await apiRequest(`/announcements/${id}`, { method: 'DELETE' }); }
    catch { setAnnouncements(prev => prev.filter(a => a._id !== id)); return; }
    fetchData();
  };

  const openMsg = async (msg: Message) => {
    setViewMsg(msg);
    if (!msg.isRead) {
      try { await apiRequest(`/messages/${msg._id}/read`, { method: 'PUT' }); }
      catch {}
      setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
    }
  };

  const tabs: { key: Tab; label: string }[] = [{ key: 'bulletins', label: 'Bulletins Board' }, { key: 'facilities', label: 'Landing Facilities' }, { key: 'messages', label: 'Public Inquiries' }];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">Bulletins & Inquiries</h1>
          <p className="text-slate-400 text-xs">Announcements, facilities, and public contact messages</p>
        </div>
        {tab === 'bulletins' && (
          <button onClick={() => setAddOpen(true)} className="h-10 px-5 rounded-xl btn-gradient text-xs flex items-center space-x-2 self-start">
            <Plus className="w-4 h-4" /><span>Post Bulletin</span>
          </button>
        )}
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800 pb-px">
        {tabs.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-3 border-b-2 font-medium text-xs tracking-wider uppercase transition-all duration-200 ${tab === key ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_,i) => <div key={i} className="h-24 shimmer rounded-2xl" />)}</div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="space-y-4">
            {/* Bulletins */}
            {tab === 'bulletins' && (
              announcements.length === 0 ? (
                <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 text-slate-400">No announcements posted yet.</div>
              ) : announcements.map((ann, i) => (
                <motion.div key={ann._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-start justify-between group hover:shadow-md transition-shadow">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{ann.title}</span>
                      <span className={`${ann.targetAudience==='Student'?'badge-green':'badge-blue'}`}>Audience: {ann.targetAudience}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{ann.content}</p>
                    <span className="text-[10px] text-slate-400">{new Date(ann.createdAt).toLocaleDateString([],{dateStyle:'medium'})}</span>
                  </div>
                  <button onClick={() => deleteAnn(ann._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 ml-4 flex-shrink-0 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}

            {/* Facilities */}
            {tab === 'facilities' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {facilities.map((fac, i) => (
                  <motion.div key={fac._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex space-x-4 items-start hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0">
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1">{fac.name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{fac.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Messages */}
            {tab === 'messages' && (
              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="p-4 pl-6">Contact</th><th className="p-4">Details</th><th className="p-4">Message</th><th className="p-4">Status</th><th className="p-4 pr-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {messages.length === 0 ? (
                        <tr><td colSpan={5} className="p-12 text-center text-slate-400">No messages received yet.</td></tr>
                      ) : messages.map((msg, i) => (
                        <motion.tr key={msg._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                          className="hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors">
                          <td className="p-4 pl-6 font-bold text-slate-800 dark:text-white">{msg.name}</td>
                          <td className="p-4">
                            <p className="text-slate-600 dark:text-slate-400">{msg.email}</p>
                            <p className="text-[10px] text-slate-400">{msg.phone}</p>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{msg.message}</td>
                          <td className="p-4">
                            <span className={msg.isRead ? 'badge-slate' : 'badge-blue'}>{msg.isRead ? 'Reviewed' : 'Unread'}</span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button onClick={() => openMsg(msg)}
                              className="h-8 px-3 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white text-[11px] font-bold transition-all">
                              View
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {/* Post Announcement Modal */}
        {addOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Post Announcement</h3>
                <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={postAnnouncement} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Title</label>
                  <input required value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} className="input-base text-xs" placeholder="Electricity Outage Notice" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Audience</label>
                  <select value={annForm.targetAudience} onChange={e => setAnnForm({...annForm, targetAudience: e.target.value})} className="input-base text-xs">
                    <option value="All">All (Admin + Students)</option>
                    <option value="Student">Students Only</option>
                    <option value="Admin">Admins Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Message</label>
                  <textarea required rows={4} value={annForm.content} onChange={e => setAnnForm({...annForm, content: e.target.value})} className="input-base text-xs pt-3 resize-none h-auto" placeholder="Enter announcement details..." />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setAddOpen(false)} className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">Cancel</button>
                  <button type="submit" className="px-6 h-10 rounded-xl btn-gradient text-xs">Publish</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* View Message Modal */}
        {viewMsg && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Admission Inquiry</h3>
                <button onClick={() => setViewMsg(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2.5">
                  {[[<User className="w-4 h-4 text-slate-400" />, viewMsg.name],[<Mail className="w-4 h-4 text-slate-400" />, viewMsg.email],[<Phone className="w-4 h-4 text-slate-400" />, viewMsg.phone],[<Calendar className="w-4 h-4 text-slate-400" />, new Date(viewMsg.createdAt).toLocaleString()]].map(([icon, val], i) => (
                    <div key={i} className="flex items-center space-x-2">
                      {icon}
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{val as string}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">Message</span>
                  <p className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950">{viewMsg.message}</p>
                </div>
                <div className="flex justify-end pt-2">
                  <button onClick={() => setViewMsg(null)} className="px-6 h-10 rounded-xl btn-gradient text-xs">Close</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
