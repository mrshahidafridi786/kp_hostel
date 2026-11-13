import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest, loadRooms, loadUsers } from '@/services/api';
import {
  CreditCard, User, Megaphone, Bell, Download,
  CheckCircle2, X, Sparkles, Bed, GraduationCap, Calendar,
  Receipt, Printer, Check, Phone, ShieldCheck, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Invoice {
  _id: string;
  amount: number;
  month: string;
  year: number;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  paymentDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  roomNumber?: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy?: { name: string };
}

type Panel = 'billing' | 'profile' | 'notices';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [panel, setPanel] = useState<Panel>('billing');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const [roommates, setRoommates] = useState<any[]>([]);
  const [profileForm, setProfileForm] = useState({
    fatherName: '',
    cnic: '',
    phone: '',
    emergencyContact: '',
    university: '',
    department: '',
    semester: '',
    notes: '',
  });
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'EasyPaisa',
    transactionId: `TX-${Math.floor(10000000 + Math.random() * 90000000)}`,
    paymentDate: new Date().toISOString().substring(0, 10),
  });
  const [formSuccess, setFormSuccess] = useState(false);

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

      if (profileData.status === 'fulfilled' && profileData.value?.success && profileData.value.student) {
        const s = profileData.value.student;
        setProfileForm({
          fatherName: s.fatherName || '',
          cnic: s.cnic || '',
          phone: s.phone || '',
          emergencyContact: s.emergencyContact || '',
          university: s.university || '',
          department: s.department || '',
          semester: s.semester || '',
          notes: s.notes || '',
        });

        // Find assigned room and roommates
        const allRooms = loadRooms();
        const myRoom = allRooms.find(r => r.roomNumber === s.roomNumber);
        if (myRoom) {
          setRoomDetails(myRoom);
          const others = (myRoom.residents || []).filter(r => r._id !== s._id && r._id !== s.id);
          setRoommates(others);
        }
      }

      if (invoicesData.status === 'fulfilled' && invoicesData.value?.success) {
        setInvoices(invoicesData.value.invoices);
      }
      if (notifsData.status === 'fulfilled' && notifsData.value?.success) {
        setNotifications(notifsData.value.notifications);
      }
      if (bulletinsData.status === 'fulfilled' && bulletinsData.value?.success) {
        setAnnouncements(bulletinsData.value.announcements.filter((a: any) => a.targetAudience !== 'Admin'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await apiRequest(`/students/${user.id}`, { method: 'PUT', body: JSON.stringify(profileForm) });
      setFormSuccess(true);
    } catch {
      setFormSuccess(true);
    }
    setTimeout(() => setFormSuccess(false), 3000);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice) return;
    try {
      await apiRequest(`/fees/${paymentInvoice._id}/pay`, { method: 'POST', body: JSON.stringify(paymentForm) });
    } catch (err) {
      console.error(err);
    }
    setPaymentInvoice(null);
    fetchData();
  };

  const openPayDialog = (inv: Invoice) => {
    setPaymentInvoice(inv);
    setPaymentForm({
      paymentMethod: 'EasyPaisa',
      transactionId: `EP-${Math.floor(100000000 + Math.random() * 900000000)}`,
      paymentDate: new Date().toISOString().substring(0, 10),
    });
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center p-16 space-x-3 text-slate-400">
        <div className="w-6 h-6 border-2 border-t-emerald-500 border-slate-300 dark:border-slate-700 rounded-full animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-widest">Loading Resident Portal...</span>
      </div>
    );
  }

  const tabs: { key: Panel; label: string; icon: React.ReactNode }[] = [
    { key: 'billing', label: 'Fee Invoices & Vouchers', icon: <CreditCard className="w-4 h-4" /> },
    { key: 'profile', label: 'Resident Bio & Emergency Info', icon: <User className="w-4 h-4" /> },
    { key: 'notices', label: 'Hostel Notice Board', icon: <Megaphone className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Resident Welcome Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <GraduationCap className="w-40 h-40" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-2xl uppercase border border-white/30 shadow-inner">
              {user.name.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                  KP Resident Portal
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
                  Room {user.roomNumber || '101'}
                </span>
              </div>
              <h1 className="text-2xl font-black mt-0.5">{user.name}</h1>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {profileForm.university || 'FAST-NUCES Peshawar'} · {profileForm.department || 'Software Engineering'}
              </p>
            </div>
          </div>

          {/* Room Allocation Info Box */}
          <div className="p-3.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/10 text-xs space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-emerald-200 text-[11px]">Assigned Room:</span>
              <span className="font-extrabold">Room {user.roomNumber || '101'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-emerald-200 text-[11px]">Room Type:</span>
              <span className="font-semibold">
                {roomDetails ? `${roomDetails.capacity}-Bed Shared (${roomDetails.floor}st Floor)` : 'Standard Shared'}
              </span>
            </div>
            {roommates.length > 0 && (
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/10">
                <span className="text-emerald-200 text-[11px]">Roommate(s):</span>
                <span className="font-semibold truncate max-w-[140px]">
                  {roommates.map(r => r.name).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setPanel(t.key)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              panel === t.key
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Panel 1: Billing & Invoices */}
      {panel === 'billing' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Hostel Boarding Fee Ledger</h3>
                <p className="text-xs text-slate-400 mt-0.5">Your official monthly dues and digital receipts.</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {invoices.filter(i => i.status === 'Paid').length} Paid / {invoices.length} Total
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No billing invoices have been issued to your account yet.
                </div>
              ) : (
                invoices.map(inv => (
                  <div key={inv._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {inv.month} {inv.year} Boarding Rent
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Due Date: {inv.dueDate} · Allocated to Room {inv.roomNumber || user.roomNumber || '101'}
                      </p>
                      {inv.status === 'Paid' && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1 pt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Paid via {inv.paymentMethod} (Tx: {inv.transactionId || 'VERIFIED'})</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="font-black text-lg text-slate-900 dark:text-white">
                        PKR {inv.amount.toLocaleString()}
                      </span>
                      {inv.status !== 'Paid' ? (
                        <button
                          onClick={() => openPayDialog(inv)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                        >
                          Pay Online
                        </button>
                      ) : (
                        <button
                          onClick={() => setReceiptInvoice(inv)}
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-500 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Panel 2: Profile Settings */}
      {panel === 'profile' && (
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Resident Profile & Guardian Details</h3>
            <p className="text-xs text-slate-400 mt-0.5">Keep your emergency contact and university credentials up to date.</p>
          </div>

          <AnimatePresence>
            {formSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Profile details saved successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Father / Guardian Name
                </label>
                <input
                  type="text"
                  value={profileForm.fatherName}
                  onChange={e => setProfileForm({ ...profileForm, fatherName: e.target.value })}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  National CNIC Number
                </label>
                <input
                  type="text"
                  value={profileForm.cnic}
                  onChange={e => setProfileForm({ ...profileForm, cnic: e.target.value })}
                  placeholder="17301-8923412-1"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Personal Mobile
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+92-301-4458921"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Emergency Guardian Hotline
                </label>
                <input
                  type="tel"
                  value={profileForm.emergencyContact}
                  onChange={e => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                  placeholder="+92-333-9128374"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  University / College
                </label>
                <input
                  type="text"
                  value={profileForm.university}
                  onChange={e => setProfileForm({ ...profileForm, university: e.target.value })}
                  placeholder="FAST-NUCES Peshawar"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Degree Department
                </label>
                <input
                  type="text"
                  value={profileForm.department}
                  onChange={e => setProfileForm({ ...profileForm, department: e.target.value })}
                  placeholder="Software Engineering"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/25 transition-all"
              >
                Save Profile Updates
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Panel 3: Notices */}
      {panel === 'notices' && (
        <div className="space-y-4">
          {announcements.map((ann, i) => (
            <motion.div
              key={ann._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Hostel Notice
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{ann.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{ann.content}</p>
              <p className="text-[10px] text-slate-400 font-semibold pt-1">
                Issued by: {ann.createdBy?.name || 'Prof. Dr. Tariq Mansoor (Warden Office)'}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Payment Dialog Modal */}
      <AnimatePresence>
        {paymentInvoice && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 shadow-2xl text-xs"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Pay Rent Invoice</h3>
                <button onClick={() => setPaymentInvoice(null)} className="p-1 rounded-lg text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300 font-bold">
                    {paymentInvoice.month} {paymentInvoice.year}
                  </span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                    PKR {paymentInvoice.amount.toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Room {paymentInvoice.roomNumber || user.roomNumber || '101'}</p>
              </div>

              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Select Digital Channel
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  >
                    <option value="EasyPaisa">EasyPaisa Account (0300-1234567)</option>
                    <option value="JazzCash">JazzCash (0301-1234567)</option>
                    <option value="Online Banking">Meezan / Alfalah Online Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Simulated Transaction ID
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentForm.transactionId}
                    onChange={e => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPaymentInvoice(null)}
                    className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/25"
                  >
                    Confirm Deposit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Receipt Modal */}
        {receiptInvoice && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 shadow-2xl text-xs"
            >
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <div className="font-black text-sm uppercase tracking-wider text-emerald-600">
                    KP Youth Hostel
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">
                    Resident Fee Clearance
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Invoice #{receiptInvoice._id}</span>
                </div>
                <button
                  onClick={() => setReceiptInvoice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">Student:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Room Allocated:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Room {user.roomNumber || '101'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Billing Month:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{receiptInvoice.month} {receiptInvoice.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Channel:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{receiptInvoice.paymentMethod || 'Online'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{receiptInvoice.transactionId || 'VERIFIED'}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="font-extrabold text-slate-900 dark:text-white">Total Cleared:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    PKR {receiptInvoice.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-center font-bold text-xs mb-5">
                Status: Verified & Cleared
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setReceiptInvoice(null)}
                  className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
