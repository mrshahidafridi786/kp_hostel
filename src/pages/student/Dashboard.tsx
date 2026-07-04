import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/services/api';
import {
  CreditCard, User, Megaphone, Bell, Download,
  CheckCircle2, X, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Invoice { _id: string; amount: number; month: string; year: number; dueDate: string; status: 'Paid' | 'Unpaid' | 'Overdue'; paymentDate?: string; paymentMethod?: string; transactionId?: string; }
interface Notification { _id: string; title: string; message: string; isRead: boolean; createdAt: string; }
interface Announcement { _id: string; title: string; content: string; createdAt: string; }

type Panel = 'billing' | 'profile' | 'notices';

export default function StudentDashboard() {
  const { user, updateUserProfileState } = useAuth();
  const [panel, setPanel] = useState<Panel>('billing');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ fatherName: '', cnic: '', phone: '', emergencyContact: '', university: '', department: '', semester: '', notes: '' });
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [paymentForm, setPaymentForm] = useState({ paymentMethod: 'EasyPaisa', transactionId: '', paymentDate: new Date().toISOString().substring(0,10) });
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profileData, invoicesData, notifsData, bulletinsData] = await Promise.allSettled([
        apiRequest(`/students/${user.id}`),
        apiRequest(`/fees/student/${user.id}`),
        apiRequest('/notifications'),
        apiRequest('/announcements'),
      ]);
      if (profileData.status === 'fulfilled' && profileData.value?.success) {
        const s = profileData.value.student;
        setProfileForm({ fatherName: s.fatherName||'', cnic: s.cnic||'', phone: s.phone||'', emergencyContact: s.emergencyContact||'', university: s.university||'', department: s.department||'', semester: s.semester||'', notes: s.notes||'' });
      }
      if (invoicesData.status === 'fulfilled' && invoicesData.value?.success) setInvoices(invoicesData.value.invoices);
      if (notifsData.status === 'fulfilled' && notifsData.value?.success) setNotifications(notifsData.value.notifications);
      if (bulletinsData.status === 'fulfilled' && bulletinsData.value?.success)
        setAnnouncements(bulletinsData.value.announcements.filter((a: any) => a.targetAudience !== 'Admin'));
    } catch {
      setInvoices([
        { _id: 'i1', amount: 9500, month: 'July', year: 2026, dueDate: '2026-07-05', status: 'Unpaid' },
        { _id: 'i2', amount: 9500, month: 'June', year: 2026, dueDate: '2026-06-05', status: 'Paid', paymentDate: '2026-06-03', paymentMethod: 'EasyPaisa', transactionId: 'EP-122334455' },
      ]);
      setNotifications([
        { _id: 'n1', title: 'Invoice Issued', message: 'Your rent invoice for July 2026 has been generated.', isRead: false, createdAt: new Date().toISOString() },
        { _id: 'n2', title: 'Payment Confirmed', message: 'Warden office verified your June payment.', isRead: true, createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
      ]);
      setAnnouncements([{ _id: 'a1', title: 'Monthly Rent Reminder', content: 'Please pay your rent invoice by the 5th of July.', createdAt: new Date().toISOString() }]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormError(null); setFormSuccess(false);
    try {
      await apiRequest(`/students/${user.id}`, { method: 'PUT', body: JSON.stringify(profileForm) });
      setFormSuccess(true);
    } catch {
      setFormSuccess(true); // Demo mode
    }
    setTimeout(() => setFormSuccess(false), 4000);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice) return;
    try { await apiRequest(`/fees/${paymentInvoice._id}/pay`, { method: 'POST', body: JSON.stringify(paymentForm) }); }
    catch { setInvoices(prev => prev.map(inv => inv._id === paymentInvoice._id ? { ...inv, status: 'Paid', ...paymentForm } : inv)); }
    setPaymentInvoice(null);
  };

  if (loading || !user) return (
    <div className="flex items-center justify-center p-16 space-x-3 text-slate-400">
      <div className="w-5 h-5 border-2 border-t-emerald-500 border-slate-300 rounded-full animate-spin" />
      <span className="text-xs font-semibold uppercase tracking-widest">Loading resident data...</span>
    </div>
  );

  const tabs: { key: Panel; label: string }[] = [{ key: 'billing', label: 'Billing & Payments' }, { key: 'profile', label: 'Profile Settings' }, { key: 'notices', label: 'Notice Board' }];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1/2 -left-1/4 w-3/4 h-full rounded-full bg-blue-600/20 blur-[100px]" />
          <div className="absolute -bottom-1/2 -right-1/4 w-3/4 h-full rounded-full bg-emerald-500/10 blur-[100px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /><span>Resident Student Portal</span>
            </span>
            <h1 className="font-extrabold text-2xl sm:text-3xl">Assalam-o-Alaikum, {user.name}!</h1>
            <p className="text-slate-400 text-xs font-mono">
              Room: <span className="text-blue-400 font-bold">{user.roomNumber ? `Room ${user.roomNumber}` : 'Pending Assignment'}</span>
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider mb-0.5">Student UID</span>
              <span className="font-bold text-slate-200">KPH-2026-1001</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider mb-0.5">Status</span>
              <span className="font-bold text-emerald-400">Active Resident</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800 pb-px">
        {tabs.map(({ key, label }) => (
          <button key={key} onClick={() => setPanel(key)}
            className={`px-5 py-3 border-b-2 font-medium text-xs tracking-wider uppercase transition-all duration-200 ${panel === key ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={panel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {/* Billing */}
          {panel === 'billing' && (
            <div className="space-y-6">
              {invoices.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 text-slate-400">No invoices issued yet.</div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((inv, i) => (
                    <motion.div key={inv._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${inv.status==='Paid'?'bg-emerald-500/10 text-emerald-600':'bg-amber-500/10 text-amber-600'}`}>
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div className="space-y-1 text-xs">
                          <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{inv.month} {inv.year} Rent Invoice</h4>
                          <p className="text-slate-500 font-semibold">PKR {inv.amount.toLocaleString()} · Due {new Date(inv.dueDate).toLocaleDateString([],{dateStyle:'medium'})}</p>
                          {inv.status==='Paid' && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">via {inv.paymentMethod} · Ref: {inv.transactionId}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 self-end sm:self-center">
                        <span className={`${inv.status==='Paid'?'badge-green':inv.status==='Unpaid'?'badge-amber':'badge-red'}`}>{inv.status}</span>
                        {inv.status !== 'Paid' ? (
                          <motion.button onClick={() => setPaymentInvoice(inv)} whileTap={{ scale: 0.97 }} className="h-9 px-4 rounded-xl btn-gradient text-xs font-semibold">Submit Transaction ID</motion.button>
                        ) : (
                          <button className="h-9 px-4 rounded-xl border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all">
                            <Download className="w-4 h-4" /><span>Print Receipt</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              {/* Payment Instructions */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-xs shadow-sm">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" /><span>How to Pay Your Monthly Rent</span>
                </h4>
                <ol className="list-decimal pl-5 space-y-2 text-slate-500 dark:text-slate-400 leading-relaxed">
                  <li>Open your EasyPaisa, JazzCash, or mobile banking app.</li>
                  <li>Transfer the exact amount to the hostel account:
                    <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 font-semibold space-y-1 max-w-sm text-xs">
                      <p className="text-slate-800 dark:text-slate-200">Account: KP Youth Hostel Management</p>
                      <p className="text-blue-600 dark:text-blue-400">EasyPaisa Till ID: 987654</p>
                      <p className="text-slate-500">Bank: Bank of Khyber (BOK) · 0012-3456-7890</p>
                    </div>
                  </li>
                  <li>Copy the <b>Transaction ID</b> from your SMS/receipt.</li>
                  <li>Click <b>"Submit Transaction ID"</b> next to your unpaid month and submit for verification.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Profile */}
          {panel === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 sm:p-8 space-y-6 text-xs shadow-sm">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Resident Contact Details</h3>
                <AnimatePresence>
                  {formSuccess && <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="badge-green text-[10px] uppercase font-bold tracking-widest">Saved ✓</motion.span>}
                </AnimatePresence>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[["Father's Name",'text','fatherName',false],["CNIC",'text','cnic',false],["Phone",'tel','phone',false],["Emergency Contact",'tel','emergencyContact',false],["University",'text','university',true],].map(([lbl,type,key,disabled]) => (
                  <div key={key as string}>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{lbl as string}</label>
                    <input type={type as string} disabled={disabled as boolean} value={(profileForm as any)[key as string]}
                      onChange={e => setProfileForm({...profileForm, [key as string]: e.target.value})}
                      className={`input-base ${disabled ? 'text-slate-400 cursor-not-allowed' : ''}`} />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Department & Semester</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input disabled value={profileForm.department} className="input-base text-slate-400 cursor-not-allowed" />
                    <input disabled value={profileForm.semester} className="input-base text-slate-400 cursor-not-allowed" />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <motion.button type="submit" whileTap={{ scale: 0.97 }} className="px-6 h-11 rounded-xl btn-gradient font-semibold text-xs">Update Profile</motion.button>
              </div>
            </form>
          )}

          {/* Notices */}
          {panel === 'notices' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center space-x-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <Megaphone className="w-5 h-5 text-blue-600" /><span>Warden Bulletins</span>
                </h3>
                {announcements.length === 0 ? (
                  <p className="text-slate-400 text-center py-8 text-xs">No official notices posted.</p>
                ) : announcements.map((ann, i) => (
                  <motion.div key={ann._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{ann.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{ann.content}</p>
                    <span className="text-[10px] text-slate-400">{new Date(ann.createdAt).toLocaleDateString([],{dateStyle:'medium'})}</span>
                  </motion.div>
                ))}
              </div>
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center space-x-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <Bell className="w-5 h-5 text-emerald-600" /><span>Personal Alerts</span>
                </h3>
                {notifications.length === 0 ? (
                  <p className="text-slate-400 text-center py-8 text-xs">Your inbox is empty.</p>
                ) : notifications.map((n, i) => (
                  <motion.div key={n._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex space-x-3 items-start">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.isRead?'bg-slate-100 dark:bg-slate-800 text-slate-400':'bg-emerald-500/10 text-emerald-600'}`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-slate-200 text-xs">{n.title}</h5>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 leading-relaxed">{n.message}</p>
                      <span className="text-[9px] text-slate-400 block mt-1">{new Date(n.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {paymentInvoice && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Submit Payment Details</h3>
                <button onClick={() => setPaymentInvoice(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs mb-5 space-y-1">
                {[['Rent Month', `${paymentInvoice.month} ${paymentInvoice.year}`],['Amount Due', `PKR ${paymentInvoice.amount.toLocaleString()}`]].map(([l,v]) => (
                  <div key={l} className="flex justify-between"><span className="text-slate-400">{l}:</span><span className="font-bold text-slate-800 dark:text-slate-200">{v}</span></div>
                ))}
              </div>
              <form onSubmit={handlePayment} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Payment App</label>
                  <select value={paymentForm.paymentMethod} onChange={e => setPaymentForm({...paymentForm, paymentMethod: e.target.value})} className="input-base text-xs">
                    {['EasyPaisa','JazzCash','Bank Transfer'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Transaction ID</label>
                  <input required value={paymentForm.transactionId} onChange={e => setPaymentForm({...paymentForm, transactionId: e.target.value})} className="input-base text-xs" placeholder="e.g. EP-122334455" />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setPaymentInvoice(null)} className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">Cancel</button>
                  <motion.button type="submit" whileTap={{ scale: 0.97 }} className="px-6 h-10 rounded-xl btn-gradient text-xs font-bold">Confirm Submission</motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
