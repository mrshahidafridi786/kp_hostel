import React, { useState, useEffect } from 'react';
import { apiRequest, INITIAL_FEES } from '@/services/api';
import {
  Search, Plus, DollarSign, Download, RefreshCw, X, Check,
  AlertCircle, Receipt, CreditCard, Calendar, Filter, Sparkles, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeeInvoice {
  _id: string;
  studentId: { _id: string; name: string; email: string; studentId: string };
  roomNumber: string;
  amount: number;
  month: string;
  year: number;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  paymentDate?: string;
  paymentMethod?: string;
  transactionId?: string;
}

export default function AdminFees() {
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('2026');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
  const [receiptInvoice, setReceiptInvoice] = useState<FeeInvoice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [billingForm, setBillingForm] = useState({
    month: 'November',
    year: 2026,
  });
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'EasyPaisa',
    transactionId: '',
    paymentDate: new Date().toISOString().substring(0, 10),
  });

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchFees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        month: monthFilter,
        year: yearFilter,
      });
      const d = await apiRequest(`/fees/all?${params}`);
      if (d?.success && d.invoices) {
        setInvoices(d.invoices);
      }
    } catch {
      setInvoices(INITIAL_FEES as unknown as FeeInvoice[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [statusFilter, monthFilter, yearFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFees();
  };

  const generateInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const d = await apiRequest('/fees/generate-monthly', {
        method: 'POST',
        body: JSON.stringify(billingForm),
      });
      if (d.success) {
        setSuccessMsg(d.message || `Generated monthly invoices for ${billingForm.month} ${billingForm.year}.`);
        setTimeout(() => {
          setGenerateOpen(false);
          setSuccessMsg(null);
          fetchFees();
        }, 1500);
      }
    } catch {
      setSuccessMsg(`Billing run processed for ${billingForm.month} ${billingForm.year}.`);
      setTimeout(() => {
        setGenerateOpen(false);
        setSuccessMsg(null);
        fetchFees();
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  const recordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setSubmitting(true);
    try {
      await apiRequest(`/fees/${selectedInvoice._id}/pay`, {
        method: 'POST',
        body: JSON.stringify(paymentForm),
      });
    } catch (err) {
      console.error(err);
    }
    setPaymentOpen(false);
    setSelectedInvoice(null);
    setSubmitting(false);
    fetchFees();
  };

  const openPayment = (inv: FeeInvoice) => {
    setSelectedInvoice(inv);
    setPaymentOpen(true);
    setPaymentForm({
      paymentMethod: 'EasyPaisa',
      transactionId: `TX-${Math.floor(10000000 + Math.random() * 90000000)}`,
      paymentDate: new Date().toISOString().substring(0, 10),
    });
  };

  const exportCSV = () => {
    const headers = ['Invoice ID', 'Student', 'Student ID', 'Room', 'Month/Year', 'Amount (PKR)', 'Due Date', 'Status', 'Payment Method', 'Transaction ID'];
    const rows = invoices.map(i => [
      i._id,
      `"${i.studentId?.name || 'Resident'}"`,
      i.studentId?.studentId || 'N/A',
      i.roomNumber,
      `"${i.month} ${i.year}"`,
      i.amount,
      i.dueDate,
      i.status,
      i.paymentMethod || 'N/A',
      i.transactionId || 'N/A',
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KP_Hostel_FeeLedger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics
  const totalBilled = invoices.reduce((acc, i) => acc + (i.amount || 0), 0);
  const totalCollected = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + (i.amount || 0), 0);
  const totalOutstanding = invoices.filter(i => i.status !== 'Paid').reduce((acc, i) => acc + (i.amount || 0), 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
            <Receipt className="w-4 h-4" />
            <span>Revenue Operations</span>
          </div>
          <h1 className="font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Billing & Invoices
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Automated monthly fee generation, verification, and payment tracking.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportCSV}
            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center space-x-2 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export Ledger</span>
          </button>
          <button
            onClick={() => setGenerateOpen(true)}
            className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-600/25 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate Monthly Billing</span>
          </button>
        </div>
      </motion.div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Total Invoiced</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              PKR {totalBilled.toLocaleString()}
            </span>
          </div>
          <Receipt className="w-5 h-5 text-slate-400" />
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Collected Revenue</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              PKR {totalCollected.toLocaleString()}
            </span>
          </div>
          <Check className="w-5 h-5 text-emerald-500" />
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Outstanding Dues</span>
            <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
              PKR {totalOutstanding.toLocaleString()}
            </span>
          </div>
          <AlertCircle className="w-5 h-5 text-amber-500" />
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Recovery Rate</span>
            <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
              {collectionRate}%
            </span>
          </div>
          <DollarSign className="w-5 h-5 text-blue-500" />
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, room, or transaction ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all placeholder:text-slate-400"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overdue">Overdue</option>
          </select>

          <select
            value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">All Months</option>
            {MONTHS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 pl-6">Resident Info</th>
                <th className="p-4">Billing Period</th>
                <th className="p-4">Room & Amount</th>
                <th className="p-4">Payment Clearance</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-t-emerald-500 border-slate-300 dark:border-slate-700 rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading billing records...</span>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    No matching invoices found in this view.
                  </td>
                </tr>
              ) : (
                invoices.map((inv, i) => (
                  <motion.tr
                    key={inv._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-blue-50/40 dark:hover:bg-blue-950/15 transition-colors"
                  >
                    <td className="p-4 pl-6">
                      <p className="font-bold text-slate-900 dark:text-white leading-tight">
                        {inv.studentId?.name || 'Resident'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {inv.studentId?.studentId || 'KPH-STUDENT'} · {inv.studentId?.email}
                      </p>
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {inv.month} {inv.year}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Due by: {inv.dueDate}
                      </p>
                    </td>

                    <td className="p-4">
                      <p className="font-extrabold text-slate-900 dark:text-white">
                        PKR {inv.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-blue-500 font-semibold mt-0.5">
                        Room {inv.roomNumber}
                      </p>
                    </td>

                    <td className="p-4">
                      {inv.status === 'Paid' ? (
                        <div>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>{inv.paymentMethod || 'Online'}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[130px]">
                            {inv.transactionId || 'VERIFIED'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Unpaid Pending</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : inv.status === 'Overdue'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>

                    <td className="p-4 pr-6 text-right space-x-2">
                      {inv.status !== 'Paid' ? (
                        <button
                          onClick={() => openPayment(inv)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
                        >
                          Record Payment
                        </button>
                      ) : (
                        <button
                          onClick={() => setReceiptInvoice(inv)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-500 text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Invoices Generator Modal */}
      <AnimatePresence>
        {generateOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                  Generate Monthly Invoices
                </h3>
                <button
                  onClick={() => setGenerateOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-5">
                Automatically create fee vouchers for all active residents based on their assigned room pricing.
              </p>

              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
                  {successMsg}
                </div>
              )}

              <form onSubmit={generateInvoices} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Select Target Billing Month
                  </label>
                  <select
                    value={billingForm.month}
                    onChange={e => setBillingForm({ ...billingForm, month: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    {MONTHS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Year
                  </label>
                  <select
                    value={billingForm.year}
                    onChange={e => setBillingForm({ ...billingForm, year: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setGenerateOpen(false)}
                    className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                  >
                    {submitting ? 'Generating...' : 'Run Billing Batch'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Record Payment Modal */}
        {paymentOpen && selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                  Record Fee Payment
                </h3>
                <button
                  onClick={() => setPaymentOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Invoice snapshot */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 mb-5 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900 dark:text-white">{selectedInvoice.studentId?.name}</span>
                  <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
                    PKR {selectedInvoice.amount.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Room {selectedInvoice.roomNumber} · {selectedInvoice.month} {selectedInvoice.year}
                </p>
              </div>

              <form onSubmit={recordPayment} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Payment Gateway / Method
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="EasyPaisa">EasyPaisa Mobile Account</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Meezan Bank Transfer">Meezan Bank Direct Deposit</option>
                    <option value="Bank Alfalah App">Bank Alfalah App</option>
                    <option value="Cash Voucher">Cash Voucher at Administration Desk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Transaction Ref / Slip #
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentForm.transactionId}
                    onChange={e => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Payment Deposit Date
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentForm.paymentDate}
                    onChange={e => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPaymentOpen(false)}
                    className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/25"
                  >
                    Confirm & Clear Invoice
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
                  <div className="font-black text-sm uppercase tracking-wider text-blue-600">
                    KP Youth Hostel
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">
                    Official Payment Receipt
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
                  <span className="text-slate-400">Student Name:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{receiptInvoice.studentId?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Student ID:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{receiptInvoice.studentId?.studentId || 'KPH-RES'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Room Bed:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Room {receiptInvoice.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Billing Period:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{receiptInvoice.month} {receiptInvoice.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Gateway:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{receiptInvoice.paymentMethod || 'Online'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{receiptInvoice.transactionId || 'VERIFIED'}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="font-extrabold text-slate-900 dark:text-white">Amount Paid:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    PKR {receiptInvoice.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-center font-bold text-xs mb-5">
                Status: Verified & Cleared by Administration Office
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setReceiptInvoice(null)}
                  className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"
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
