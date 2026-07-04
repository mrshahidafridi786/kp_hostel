"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/services/api';
import {
  CreditCard, User, Megaphone, Bell, Check, Download,
  AlertCircle, ShieldAlert, Sparkles, CheckCircle2, ChevronRight, Lock, Key, X
} from 'lucide-react';

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
}

export default function StudentDashboardPage() {
  const { user, updateUserProfileState } = useAuth();
  
  // Dashboard Sub-panels
  const [activePanel, setActivePanel] = useState<'billing' | 'profile' | 'notices'>('billing');
  
  // Data lists
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [profileForm, setProfileForm] = useState({
    fatherName: '',
    cnic: '',
    phone: '',
    emergencyContact: '',
    university: '',
    department: '',
    semester: '',
    notes: ''
  });
  
  const [paymentSubmitInvoice, setPaymentSubmitInvoice] = useState<Invoice | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'EasyPaisa',
    transactionId: '',
    paymentDate: new Date().toISOString().substring(0, 10)
  });

  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchStudentData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch Student Profile details to fill forms
      const profileData = await apiRequest(`/students/${user.id}`);
      if (profileData?.success && profileData?.student) {
        const student = profileData.student;
        setProfileForm({
          fatherName: student.fatherName || '',
          cnic: student.cnic || '',
          phone: student.phone || '',
          emergencyContact: student.emergencyContact || '',
          university: student.university || '',
          department: student.department || '',
          semester: student.semester || '',
          notes: student.notes || ''
        });
      }

      // 2. Fetch Invoices
      const invoicesData = await apiRequest(`/fees/student/${user.id}`);
      if (invoicesData?.success) {
        setInvoices(invoicesData.invoices);
      }

      // 3. Fetch Personal Notifications
      const notifsData = await apiRequest(`/notifications`);
      if (notifsData?.success) {
        setNotifications(notifsData.notifications);
      }

      // 4. Fetch Bulletins
      const bulletinsData = await apiRequest('/announcements');
      if (bulletinsData?.success) {
        setAnnouncements(bulletinsData.announcements.filter((a: any) => a.targetAudience !== 'Admin'));
      }
    } catch (err) {
      console.warn('[STUDENT-PORTAL] API offline. Using mock fallbacks.');
      // Set mock invoices
      setInvoices([
        { _id: 'i1', amount: 9500, month: 'July', year: 2026, dueDate: '2026-07-05', status: 'Unpaid' },
        { _id: 'i2', amount: 9500, month: 'June', year: 2026, dueDate: '2026-06-05', status: 'Paid', paymentDate: '2026-06-03', paymentMethod: 'EasyPaisa', transactionId: 'EP-122334455' }
      ]);
      setNotifications([
        { _id: 'n1', title: 'Invoice Issued', message: 'Your rent invoice for July 2026 has been generated.', isRead: false, createdAt: new Date().toISOString() },
        { _id: 'n2', title: 'Payment Receipt Confirmed', message: 'Warden office verified your June rent payment.', isRead: true, createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString() }
      ]);
      setAnnouncements([
        { _id: 'a1', title: 'Monthly rent dues reminders', content: 'Dear students, please pay your rent invoices by the 5th of July to avoid fine accumulation.', createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormError(null);
    setFormSuccess(false);

    try {
      const data = await apiRequest(`/students/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(profileForm)
      });
      if (data.success) {
        setFormSuccess(true);
        updateUserProfileState({ name: user.name });
        setTimeout(() => setFormSuccess(false), 4000);
      }
    } catch (err) {
      setFormError((err as Error).message || 'Failed to save profile changes');
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 4000);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentSubmitInvoice) return;
    try {
      const data = await apiRequest(`/fees/${paymentSubmitInvoice._id}/pay`, {
        method: 'POST',
        body: JSON.stringify(paymentForm)
      });
      if (data.success) {
        setPaymentSubmitInvoice(null);
        fetchStudentData();
      }
    } catch (err) {
      console.error(err);
      // Mock payment for offline demo
      setInvoices(prev => prev.map(inv => inv._id === paymentSubmitInvoice._id ? {
        ...inv,
        status: 'Paid',
        paymentDate: paymentForm.paymentDate,
        paymentMethod: paymentForm.paymentMethod,
        transactionId: paymentForm.transactionId
      } : inv));
      setPaymentSubmitInvoice(null);
    }
  };

  const downloadReceipt = (invoiceId: string) => {
    window.open(`http://localhost:5000/api/fees/${invoiceId}/receipt`, '_blank');
  };

  if (loading || !user) {
    return <div className="p-12 text-center text-slate-450">Syncing student logs...</div>;
  }

  return (
    <div className="space-y-8 font-sans">
      
      {/* Welcome Banner Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -left-[30%] w-[80%] h-[80%] rounded-full bg-blue-600/20 blur-[100px]" />
          <div className="absolute -bottom-[50%] -right-[30%] w-[80%] h-[80%] rounded-full bg-emerald-500/10 blur-[100px]" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Resident Student Portal</span>
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl">
              Assalam-o-Alaikum, {user.name}!
            </h1>
            <p className="text-slate-400 text-xs font-mono">
              Room Allocation: <span className="text-blue-400 font-bold">{user.roomNumber ? `Room ${user.roomNumber}` : 'Pending assignment'}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850 text-xs grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider mb-0.5">Student UID</span>
              <span className="font-bold text-slate-200">KPH-2026-{1000 + parseInt(user.id.slice(-3), 16) % 900}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider mb-0.5">Registration Status</span>
              <span className="font-bold text-emerald-400">Active Resident</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segment navigation tabs */}
      <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => setActivePanel('billing')}
          className={`px-5 py-3 border-b-2 font-medium text-xs tracking-wider uppercase transition-all duration-200 ${
            activePanel === 'billing'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Billing & Payments
        </button>
        <button
          onClick={() => setActivePanel('profile')}
          className={`px-5 py-3 border-b-2 font-medium text-xs tracking-wider uppercase transition-all duration-200 ${
            activePanel === 'profile'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Profile Settings
        </button>
        <button
          onClick={() => setActivePanel('notices')}
          className={`px-5 py-3 border-b-2 font-medium text-xs tracking-wider uppercase transition-all duration-200 ${
            activePanel === 'notices'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Notice Board & Alerts
        </button>
      </div>

      {/* --- PANEL VIEW ROUTING --- */}
      
      {/* TAB: BILLING & LEDGER */}
      {activePanel === 'billing' && (
        <div className="space-y-6">
          {invoices.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 text-slate-400">
              No rent invoices have been issued to your account yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {invoices.map(inv => (
                <div
                  key={inv._id}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 text-xs">
                      <h4 className="font-display font-extrabold text-base text-slate-850 dark:text-white">
                        {inv.month} {inv.year} Rent Invoice
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                        PKR {inv.amount.toLocaleString()} | Due: {new Date(inv.dueDate).toLocaleDateString([], { dateStyle: 'medium' })}
                      </p>
                      {inv.status === 'Paid' && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                          Transferred via {inv.paymentMethod} (Ref ID: {inv.transactionId})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                      inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' :
                      inv.status === 'Unpaid' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-red-500/10 text-red-600'
                    }`}>
                      {inv.status}
                    </span>

                    {inv.status !== 'Paid' ? (
                      <button
                        onClick={() => setPaymentSubmitInvoice(inv)}
                        className="h-9 px-4 rounded-xl btn-gradient text-xs font-semibold"
                      >
                        Submit Transaction ID
                      </button>
                    ) : (
                      <button
                        onClick={() => downloadReceipt(inv._id)}
                        className="h-9 px-4 rounded-xl border border-blue-650 text-blue-650 hover:bg-blue-600 hover:text-white text-xs font-semibold flex items-center space-x-1.5"
                      >
                        <Download className="w-4 h-4" />
                        <span>Print Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EasyPaisa/JazzCash Instructions */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 text-xs">
            <h4 className="font-display font-bold text-slate-850 dark:text-white text-sm mb-3 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-blue-600" />
              <span>How to pay your monthly rent</span>
            </h4>
            <ol className="list-decimal pl-4 space-y-2 text-slate-550 dark:text-slate-400 leading-relaxed font-sans">
              <li>Open your EasyPaisa, JazzCash, or mobile banking application.</li>
              <li>Transfer the exact due amount to the designated hostel account:
                <div className="mt-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 font-semibold space-y-1 max-w-sm">
                  <p className="text-slate-800 dark:text-slate-200">Account: KP Youth Hostel Management</p>
                  <p className="text-blue-600 dark:text-blue-400">EasyPaisa Till ID: 987654</p>
                  <p className="text-slate-500">Bank: Bank of Khyber (BOK) - 0012-3456-7890</p>
                </div>
              </li>
              <li>Copy the <b>Transaction ID</b> received via SMS or app receipt (e.g. 122334455).</li>
              <li>Click <b>&quot;Submit Transaction ID&quot;</b> next to your unpaid month above, enter the reference, and submit for verification.</li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB: PROFILE SETTINGS */}
      {activePanel === 'profile' && (
        <form onSubmit={handleProfileUpdate} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 sm:p-8 space-y-6 text-xs">
          
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-855 pb-4">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Resident Contact Details</h3>
            {formSuccess && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[9px] tracking-wider">
                Saved Successfully
              </span>
            )}
            {formError && (
              <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 font-bold uppercase text-[9px] tracking-wider">
                {formError}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-sans">Father&apos;s Name</label>
              <input
                type="text" value={profileForm.fatherName}
                onChange={(e) => setProfileForm({ ...profileForm, fatherName: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">CNIC Number</label>
              <input
                type="text" value={profileForm.cnic}
                onChange={(e) => setProfileForm({ ...profileForm, cnic: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-855 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Phone Number</label>
              <input
                type="tel" value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-855 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Emergency Parent Phone</label>
              <input
                type="tel" value={profileForm.emergencyContact}
                onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-855 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">University Name</label>
              <input
                type="text" disabled value={profileForm.university}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Department & Semester</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text" disabled value={profileForm.department}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 cursor-not-allowed"
                />
                <input
                  type="text" disabled value={profileForm.semester}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 h-11 rounded-xl btn-gradient font-semibold"
            >
              Update Profile details
            </button>
          </div>

        </form>
      )}

      {/* TAB: NOTICES & ALERTS */}
      {activePanel === 'notices' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs font-sans">
          
          {/* Official announcements bulletins */}
          <div className="space-y-4">
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm mb-4 pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2">
              <Megaphone className="w-4.5 h-4.5 text-blue-600" />
              <span>Warden Bulletins Board</span>
            </h3>
            
            {announcements.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No official notices posted.</p>
            ) : (
              announcements.map(ann => (
                <div
                  key={ann._id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-2"
                >
                  <h4 className="font-display font-bold text-slate-850 dark:text-white text-sm">{ann.title}</h4>
                  <p className="text-slate-600 dark:text-slate-350 leading-relaxed font-sans">{ann.content}</p>
                  <span className="text-[10px] text-slate-400 block">{new Date(ann.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}</span>
                </div>
              ))
            )}
          </div>

          {/* Personal notifications log */}
          <div className="space-y-4">
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm mb-4 pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2">
              <Bell className="w-4.5 h-4.5 text-emerald-600" />
              <span>Personal Alerts Inbox</span>
            </h3>

            {notifications.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Your inbox is empty.</p>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif._id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900/50 flex space-x-3 items-start"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    notif.isRead ? 'bg-slate-100 text-slate-400 dark:bg-slate-800/50' : 'bg-emerald-500/10 text-emerald-600'
                  }`}>
                    <Bell className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-850 dark:text-slate-200">{notif.title}</h5>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 leading-relaxed">{notif.message}</p>
                    <span className="text-[9px] text-slate-400 block mt-1">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* --- SUBMIT TRANSACTION ID MODAL --- */}
      {paymentSubmitInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Submit Payment Details</h3>
              <button onClick={() => setPaymentSubmitInvoice(null)} className="text-slate-400 hover:text-slate-655">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs mb-5 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Rent Month:</span>
                <span className="font-bold text-slate-800 dark:text-slate-250">{paymentSubmitInvoice.month} {paymentSubmitInvoice.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Due:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">PKR {paymentSubmitInvoice.amount.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Payment Application</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-slate-855 dark:text-white focus:outline-none"
                >
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Transaction ID / Reference Number</label>
                <input
                  type="text" required value={paymentForm.transactionId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-slate-855 dark:text-white focus:border-blue-600 focus:outline-none"
                  placeholder="Enter the 11-digit Transaction ID"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button" onClick={() => setPaymentSubmitInvoice(null)}
                  className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 h-10 rounded-xl btn-gradient font-semibold">
                  Confirm Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
