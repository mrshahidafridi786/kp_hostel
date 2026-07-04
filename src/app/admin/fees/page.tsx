"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/services/api';
import {
  CreditCard, Search, Filter, Plus, Calendar, FileText, CheckCircle,
  AlertCircle, DollarSign, Download, RefreshCw, X, Check, Award
} from 'lucide-react';

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

export default function AdminFeesPage() {
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('2026');

  // Modals state
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);

  // Form states
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'EasyPaisa',
    transactionId: '',
    paymentDate: new Date().toISOString().substring(0, 10)
  });

  const [billingForm, setBillingForm] = useState({
    month: new Date().toLocaleString('en-US', { month: 'long' }),
    year: 2026
  });

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        month: monthFilter,
        year: yearFilter
      });
      const data = await apiRequest(`/fees/all?${params}`);
      if (data.success && data.invoices) {
        setInvoices(data.invoices);
      }
    } catch (err) {
      console.warn('[FEES] Fetch failed, using mock');
      const mockInvoices: FeeInvoice[] = [
        {
          _id: 'i1',
          studentId: { _id: 's1', name: 'Shahid Afridi', email: 'student@kpyouth.com', studentId: 'KPH-2026-1001' },
          roomNumber: '101',
          amount: 9500,
          month: 'July',
          year: 2026,
          dueDate: '2026-07-05',
          status: 'Unpaid'
        },
        {
          _id: 'i2',
          studentId: { _id: 's2', name: 'Zeeshan Ali', email: 'zeeshan@kpyouth.com', studentId: 'KPH-2026-1002' },
          roomNumber: '102',
          amount: 9500,
          month: 'July',
          year: 2026,
          dueDate: '2026-07-05',
          status: 'Paid',
          paymentDate: '2026-07-01',
          paymentMethod: 'EasyPaisa',
          transactionId: 'EP-9876543210'
        },
        {
          _id: 'i3',
          studentId: { _id: 's3', name: 'Asad Ali', email: 'asad@kpyouth.com', studentId: 'KPH-2026-1003' },
          roomNumber: '202',
          amount: 14000,
          month: 'June',
          year: 2026,
          dueDate: '2026-06-05',
          status: 'Paid',
          paymentDate: '2026-06-04',
          paymentMethod: 'JazzCash',
          transactionId: 'JC-1234567890'
        },
        {
          _id: 'i4',
          studentId: { _id: 's4', name: 'Zeeshan Ahmad', email: 'zeeshan.kmu@gmail.com', studentId: 'KPH-2026-1004' },
          roomNumber: '301',
          amount: 18000,
          month: 'June',
          year: 2026,
          dueDate: '2026-06-05',
          status: 'Overdue'
        }
      ];
      setInvoices(mockInvoices.filter(i => {
        if (statusFilter && i.status !== statusFilter) return false;
        if (monthFilter && i.month !== monthFilter) return false;
        if (search) {
          const s = search.toLowerCase();
          return i.studentId.name.toLowerCase().includes(s) || i.roomNumber.includes(s);
        }
        return true;
      }));
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveStudents = async () => {
    try {
      const data = await apiRequest('/students?limit=100');
      if (data.success && data.students) {
        setStudents(data.students.filter((s: any) => s.status === 'Active'));
      }
    } catch (err) {
      console.warn('[FEES] Students fetch error');
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchActiveStudents();
  }, [statusFilter, monthFilter, yearFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices();
  };

  const handleGenerateInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      const data = await apiRequest('/fees/generate-monthly', {
        method: 'POST',
        body: JSON.stringify(billingForm)
      });
      if (data.success) {
        setSuccessMsg(`Billing run processed successfully. Generated ${data.count} invoices.`);
        setTimeout(() => {
          setGenerateModalOpen(false);
          setSuccessMsg(null);
          fetchInvoices();
        }, 2000);
      }
    } catch (err) {
      alert((err as Error).message || 'Simulated successful billing run.');
      setGenerateModalOpen(false);
      fetchInvoices();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setSubmitting(true);
    try {
      const data = await apiRequest(`/fees/${selectedInvoice._id}/pay`, {
        method: 'POST',
        body: JSON.stringify(paymentForm)
      });
      if (data.success) {
        setPaymentModalOpen(false);
        fetchInvoices();
      }
    } catch (err) {
      console.error(err);
      // Mock payment update
      setInvoices(prev => prev.map(inv => inv._id === selectedInvoice._id ? {
        ...inv,
        status: 'Paid',
        paymentDate: paymentForm.paymentDate,
        paymentMethod: paymentForm.paymentMethod,
        transactionId: paymentForm.transactionId
      } : inv));
      setPaymentModalOpen(false);
    } finally {
      setSubmitting(false);
      setSelectedInvoice(null);
    }
  };

  const openPaymentModal = (invoice: FeeInvoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
    setPaymentForm({
      paymentMethod: 'EasyPaisa',
      transactionId: '',
      paymentDate: new Date().toISOString().substring(0, 10)
    });
  };

  const openGenerateModal = () => {
    setGenerateModalOpen(true);
    setBillingForm({
      month: new Date().toLocaleString('en-US', { month: 'long' }),
      year: 2026
    });
  };

  const downloadReceipt = (invoiceId: string) => {
    // Opens the backend receipt link in a new window, which serves the PDF output buffer
    window.open(`http://localhost:5000/api/fees/${invoiceId}/receipt`, '_blank');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Billing Ledger
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Review resident invoices, record manual transactions, and dispatch automated WhatsApp reminders.
          </p>
        </div>
        <button
          onClick={openGenerateModal}
          className="h-10 px-5 rounded-xl btn-gradient text-xs font-semibold flex items-center space-x-2 self-start"
        >
          <RefreshCw className="w-4 h-4 animate-spin-slow" />
          <span>Trigger Billing Run</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name or room number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600 focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-705 dark:text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overdue">Overdue</option>
          </select>

          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-705 dark:text-slate-300"
          >
            <option value="">All Months</option>
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-705 dark:text-slate-300"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-105 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 pl-6">Resident Details</th>
                <th className="p-4">Billing Month</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Paid Date / Method</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    {loading ? 'Refreshing ledger logs...' : 'No invoices matching filters found.'}
                  </td>
                </tr>
              ) : (
                invoices.map(invoice => (
                  <tr key={invoice._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 pl-6">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white block text-sm">{invoice.studentId.name}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          ID: {invoice.studentId.studentId || 'N/A'} | Room {invoice.roomNumber}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-705 dark:text-slate-300">
                      {invoice.month} {invoice.year}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(invoice.dueDate).toLocaleDateString([], { dateStyle: 'medium' })}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      PKR {invoice.amount}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        invoice.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' :
                        invoice.status === 'Unpaid' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-red-500/10 text-red-600'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {invoice.status === 'Paid' ? (
                        <div>
                          <span className="block font-medium">{invoice.paymentMethod}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{invoice.transactionId}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not Settled</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      {invoice.status !== 'Paid' ? (
                        <button
                          onClick={() => openPaymentModal(invoice)}
                          className="h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center space-x-1 inline-flex"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Record Paid</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => downloadReceipt(invoice._id)}
                          className="h-8 px-3 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-[11px] font-bold flex items-center space-x-1 inline-flex"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Receipt PDF</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- TRIGGER MONTHLY BILLING RUN MODAL --- */}
      {generateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Billing Run Panel</h3>
              <button onClick={() => setGenerateModalOpen(false)} className="text-slate-400 hover:text-slate-655">
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs">
                <Check className="w-5 h-5 mb-2 text-emerald-500" />
                <h4 className="font-bold mb-1">Billing Success</h4>
                <p>{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleGenerateInvoices} className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-start space-x-3 mb-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    This triggers a batch operation generating rent invoices for all currently active students. Rent is calculated based on their assigned room&apos;s monthly fee.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Select Month</label>
                    <select
                      value={billingForm.month}
                      onChange={(e) => setBillingForm({ ...billingForm, month: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Year</label>
                    <select
                      value={billingForm.year}
                      onChange={(e) => setBillingForm({ ...billingForm, year: parseInt(e.target.value, 10) })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                    >
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button" onClick={() => setGenerateModalOpen(false)}
                    className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 h-10 rounded-xl btn-gradient font-semibold"
                  >
                    {submitting ? 'Generating Invoices...' : 'Dispatch Invoices'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- RECORD MANUAL PAYMENT MODAL --- */}
      {paymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Record payment</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-655">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs mb-5 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Student Name:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedInvoice.studentId.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Billing Cycle:</span>
                <span className="font-semibold text-slate-850 dark:text-slate-300">{selectedInvoice.month} {selectedInvoice.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Rent Due:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">PKR {selectedInvoice.amount}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                >
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Cash">Cash (Manual Handover)</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Transaction ID / Reference</label>
                <input
                  type="text" required value={paymentForm.transactionId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:border-blue-600 focus:outline-none"
                  placeholder="e.g. EP-9876543210"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Payment Date</label>
                <input
                  type="date" required value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button" onClick={() => setPaymentModalOpen(false)}
                  className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 h-10 rounded-xl btn-gradient font-semibold"
                >
                  {submitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
