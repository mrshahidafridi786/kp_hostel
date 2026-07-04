import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/services/api';
import { Search, Plus, DollarSign, Download, RefreshCw, X, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeeInvoice {
  _id: string;
  studentId: { _id: string; name: string; email: string; studentId: string };
  roomNumber: string; amount: number; month: string; year: number;
  dueDate: string; status: 'Paid' | 'Unpaid' | 'Overdue';
  paymentDate?: string; paymentMethod?: string; transactionId?: string;
}

const MOCK: FeeInvoice[] = [
  { _id: 'i1', studentId: { _id: 's1', name: 'Shahid Afridi', email: 'student@kpyouth.com', studentId: 'KPH-2026-1001' }, roomNumber: '101', amount: 9500, month: 'July', year: 2026, dueDate: '2026-07-05', status: 'Unpaid' },
  { _id: 'i2', studentId: { _id: 's2', name: 'Zeeshan Ali', email: 'zeeshan@kpyouth.com', studentId: 'KPH-2026-1002' }, roomNumber: '102', amount: 9500, month: 'July', year: 2026, dueDate: '2026-07-05', status: 'Paid', paymentDate: '2026-07-01', paymentMethod: 'EasyPaisa', transactionId: 'EP-9876543210' },
  { _id: 'i3', studentId: { _id: 's3', name: 'Asad Ali', email: 'asad@kpyouth.com', studentId: 'KPH-2026-1003' }, roomNumber: '202', amount: 14000, month: 'June', year: 2026, dueDate: '2026-06-05', status: 'Paid', paymentDate: '2026-06-04', paymentMethod: 'JazzCash', transactionId: 'JC-1234567890' },
  { _id: 'i4', studentId: { _id: 's4', name: 'Zeeshan Ahmad', email: 'zeeshan.kmu@gmail.com', studentId: 'KPH-2026-1004' }, roomNumber: '301', amount: 18000, month: 'June', year: 2026, dueDate: '2026-06-05', status: 'Overdue' },
];

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
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [billingForm, setBillingForm] = useState({ month: new Date().toLocaleString('en-US', { month: 'long' }), year: 2026 });
  const [paymentForm, setPaymentForm] = useState({ paymentMethod: 'EasyPaisa', transactionId: '', paymentDate: new Date().toISOString().substring(0, 10) });
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const fetch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, status: statusFilter, month: monthFilter, year: yearFilter });
      const d = await apiRequest(`/fees/all?${params}`);
      if (d.success && d.invoices) setInvoices(d.invoices);
    } catch {
      setInvoices(MOCK.filter(i => {
        if (statusFilter && i.status !== statusFilter) return false;
        if (monthFilter && i.month !== monthFilter) return false;
        if (search) { const q = search.toLowerCase(); return i.studentId.name.toLowerCase().includes(q) || i.roomNumber.includes(q); }
        return true;
      }));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [statusFilter, monthFilter, yearFilter]);

  const generateInvoices = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const d = await apiRequest('/fees/generate-monthly', { method: 'POST', body: JSON.stringify(billingForm) });
      if (d.success) { setSuccessMsg(`Generated ${d.count} invoices for ${billingForm.month} ${billingForm.year}.`); setTimeout(() => { setGenerateOpen(false); setSuccessMsg(null); fetch(); }, 2000); }
    } catch {
      setSuccessMsg(`Billing run simulated for ${billingForm.month} ${billingForm.year}.`);
      setTimeout(() => { setGenerateOpen(false); setSuccessMsg(null); fetch(); }, 2000);
    } finally { setSubmitting(false); }
  };

  const recordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setSubmitting(true);
    try { await apiRequest(`/fees/${selectedInvoice._id}/pay`, { method: 'POST', body: JSON.stringify(paymentForm) }); }
    catch { setInvoices(prev => prev.map(inv => inv._id === selectedInvoice._id ? { ...inv, status: 'Paid', ...paymentForm } : inv)); }
    setPaymentOpen(false); setSelectedInvoice(null); setSubmitting(false); fetch();
  };

  const openPayment = (inv: FeeInvoice) => { setSelectedInvoice(inv); setPaymentOpen(true); setPaymentForm({ paymentMethod: 'EasyPaisa', transactionId: '', paymentDate: new Date().toISOString().substring(0,10) }); };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">Billing Ledger</h1>
          <p className="text-slate-400 text-xs">Review invoices, record payments, trigger billing runs</p>
        </div>
        <button onClick={() => setGenerateOpen(true)} className="h-10 px-5 rounded-xl btn-gradient text-xs flex items-center space-x-2 self-start">
          <RefreshCw className="w-4 h-4" /><span>Trigger Billing Run</span>
        </button>
      </motion.div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <form onSubmit={e => { e.preventDefault(); fetch(); }} className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search student or room..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs outline-none" />
        </form>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {[
            [statusFilter, setStatusFilter, [['','All Statuses'],['Paid','Paid'],['Unpaid','Unpaid'],['Overdue','Overdue']]],
            [monthFilter, setMonthFilter, [['','All Months'],...MONTHS.map(m => [m,m])]],
            [yearFilter, setYearFilter, [['2026','2026'],['2025','2025']]],
          ].map(([val, setter, opts]: any, i) => (
            <select key={i} value={val} onChange={e => setter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 outline-none">
              {opts.map(([v,l]: any) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 pl-6">Resident</th><th className="p-4">Billing Month</th><th className="p-4">Due Date</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Payment Info</th><th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-slate-400">{loading ? 'Loading ledger...' : 'No invoices matching filters.'}</td></tr>
              ) : invoices.map((inv, i) => (
                <motion.tr key={inv._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-slate-800 dark:text-white">{inv.studentId.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {inv.studentId.studentId||'N/A'} · Room {inv.roomNumber}</p>
                  </td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{inv.month} {inv.year}</td>
                  <td className="p-4 text-slate-500">{new Date(inv.dueDate).toLocaleDateString([],{dateStyle:'medium'})}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">PKR {inv.amount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`${inv.status==='Paid'?'badge-green':inv.status==='Unpaid'?'badge-amber':'badge-red'}`}>{inv.status}</span>
                  </td>
                  <td className="p-4 text-slate-500">
                    {inv.status==='Paid' ? (
                      <div><p className="font-medium">{inv.paymentMethod}</p><p className="text-[10px] text-slate-400 font-mono">{inv.transactionId}</p></div>
                    ) : <span className="text-slate-400 italic">Not settled</span>}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {inv.status !== 'Paid' ? (
                      <button onClick={() => openPayment(inv)} className="h-8 px-3 rounded-lg btn-secondary-gradient text-[11px] font-bold flex items-center space-x-1 inline-flex ml-auto">
                        <DollarSign className="w-3.5 h-3.5" /><span>Mark Paid</span>
                      </button>
                    ) : (
                      <button className="h-8 px-3 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white text-[11px] font-bold flex items-center space-x-1 inline-flex ml-auto transition-all">
                        <Download className="w-3.5 h-3.5" /><span>Receipt</span>
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {/* Generate Modal */}
        {generateOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Billing Run Panel</h3>
                <button onClick={() => setGenerateOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              {successMsg ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs text-center">
                  <Check className="w-6 h-6 mx-auto mb-2 text-emerald-500" /><p className="font-bold">{successMsg}</p>
                </div>
              ) : (
                <form onSubmit={generateInvoices} className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/20 text-blue-600 dark:text-blue-400 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>Generates rent invoices for all active students based on assigned room fees.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Month</label>
                      <select value={billingForm.month} onChange={e => setBillingForm({...billingForm, month: e.target.value})} className="input-base text-xs">
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Year</label>
                      <select value={billingForm.year} onChange={e => setBillingForm({...billingForm, year: +e.target.value})} className="input-base text-xs">
                        <option value={2026}>2026</option><option value={2027}>2027</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={() => setGenerateOpen(false)} className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">Cancel</button>
                    <button type="submit" disabled={submitting} className="px-6 h-10 rounded-xl btn-gradient text-xs disabled:opacity-70">
                      {submitting ? 'Generating...' : 'Dispatch Invoices'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}

        {/* Payment Modal */}
        {paymentOpen && selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Record Payment</h3>
                <button onClick={() => setPaymentOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2 mb-5">
                {[['Student', selectedInvoice.studentId.name],['Billing', `${selectedInvoice.month} ${selectedInvoice.year}`],['Amount Due', `PKR ${selectedInvoice.amount.toLocaleString()}`]].map(([l,v]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-slate-400">{l}:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{v}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={recordPayment} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Payment Method</label>
                  <select value={paymentForm.paymentMethod} onChange={e => setPaymentForm({...paymentForm, paymentMethod: e.target.value})} className="input-base text-xs">
                    {['EasyPaisa','JazzCash','Bank Transfer','Cash'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Transaction ID</label>
                  <input required value={paymentForm.transactionId} onChange={e => setPaymentForm({...paymentForm, transactionId: e.target.value})} className="input-base text-xs" placeholder="TXN-123456" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Payment Date</label>
                  <input type="date" required value={paymentForm.paymentDate} onChange={e => setPaymentForm({...paymentForm, paymentDate: e.target.value})} className="input-base text-xs" />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setPaymentOpen(false)} className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-6 h-10 rounded-xl btn-secondary-gradient text-xs disabled:opacity-70">
                    {submitting ? 'Saving...' : 'Confirm Payment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
