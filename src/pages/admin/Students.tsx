import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/services/api';
import {
  Search, Filter, Plus, Edit, Trash2, Eye, UserPlus,
  Ban, Download, X, Check, UserCheck, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Student {
  _id: string; name: string; email: string;
  status: 'Active' | 'Suspended'; feeStatus: 'Paid' | 'Pending' | 'Overdue';
  fatherName?: string; cnic?: string; phone?: string; emergencyContact?: string;
  university?: string; department?: string; semester?: string;
  roomNumber?: string; admissionDate?: string; notes?: string;
}

const MOCK: Student[] = [
  { _id: '1', name: 'Shahid Afridi', email: 'student@kpyouth.com', status: 'Active', feeStatus: 'Pending', fatherName: 'Sahibzada Afridi', cnic: '17301-1234567-9', phone: '0301-1234567', emergencyContact: '0302-7654321', university: 'University of Peshawar', department: 'Computer Science', semester: '6th', roomNumber: '101', admissionDate: '2025-09-01' },
  { _id: '2', name: 'Shahid Khan',   email: 'shahid.cs@gmail.com', status: 'Active', feeStatus: 'Paid',    fatherName: 'Sartaj Khan',      cnic: '17301-7654321-3', phone: '0300-1122334', university: 'UET Peshawar',             department: 'Civil Engineering',        semester: '4th', roomNumber: '101', admissionDate: '2026-02-15' },
  { _id: '3', name: 'Asad Ali',      email: 'asad.civil@uet.edu',  status: 'Active', feeStatus: 'Paid',    fatherName: 'Muhammad Ali',     cnic: '17301-2233445-5', phone: '0345-5556667', university: 'UET Peshawar',             department: 'Mechanical Engineering',   semester: '2nd', roomNumber: '202', admissionDate: '2026-03-01' },
  { _id: '4', name: 'Zeeshan Ahmad', email: 'zeeshan.kmu@gmail.com',status:'Suspended',feeStatus:'Overdue', fatherName: 'Ahmad Jan',        cnic: '14201-9988776-1', phone: '0312-9988776', university: 'Khyber Medical University', department: 'MBBS',                     semester: '8th', roomNumber: '301', admissionDate: '2024-10-10' },
];

const emptyForm = { name: '', email: '', fatherName: '', cnic: '', phone: '', emergencyContact: '', university: '', department: '', semester: '', roomNumber: '', admissionDate: new Date().toISOString().substring(0, 10), notes: '' };

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [feeFilter, setFeeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [newCreds, setNewCreds] = useState<{ id: string; pass: string; sid: string } | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '8', search, status: statusFilter, feeStatus: feeFilter });
      const data = await apiRequest(`/students?${params}`);
      if (data?.success) { setStudents(data.students); setTotalPages(data.pagination.pages); setTotalRecords(data.pagination.total); }
    } catch {
      const filtered = MOCK.filter(s => {
        if (statusFilter && s.status !== statusFilter) return false;
        if (feeFilter && s.feeStatus !== feeFilter) return false;
        if (search) { const q = search.toLowerCase(); return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.roomNumber?.includes(q); }
        return true;
      });
      setStudents(filtered); setTotalPages(1); setTotalRecords(filtered.length);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page, statusFilter, feeFilter]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiRequest('/students', { method: 'POST', body: JSON.stringify(formData) });
      if (data.success) { setNewCreds({ id: data.student.email, pass: data.student.defaultPassword, sid: data.student.studentId }); }
    } catch {
      setNewCreds({ id: formData.email, pass: 'student123', sid: `KPH-2026-${1000 + students.length + 1}` });
    }
    setAddOpen(false); setFormData(emptyForm); fetch();
  };

  const update = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    try { await apiRequest(`/students/${editStudent._id}`, { method: 'PUT', body: JSON.stringify(formData) }); }
    catch { setStudents(prev => prev.map(s => s._id === editStudent._id ? { ...s, ...formData } : s)); }
    setEditStudent(null); fetch();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this student?')) return;
    try { await apiRequest(`/students/${id}`, { method: 'DELETE' }); }
    catch { setStudents(prev => prev.filter(s => s._id !== id)); }
    fetch();
  };

  const toggleStatus = async (s: Student) => {
    const next = s.status === 'Active' ? 'Suspended' : 'Active';
    try { await apiRequest(`/students/${s._id}/status`, { method: 'PUT', body: JSON.stringify({ status: next }) }); }
    catch { setStudents(prev => prev.map(x => x._id === s._id ? { ...x, status: next as any } : x)); return; }
    fetch();
  };

  const openEdit = (s: Student) => { setEditStudent(s); setFormData({ name: s.name, email: s.email, fatherName: s.fatherName||'', cnic: s.cnic||'', phone: s.phone||'', emergencyContact: s.emergencyContact||'', university: s.university||'', department: s.department||'', semester: s.semester||'', roomNumber: s.roomNumber||'', admissionDate: s.admissionDate?.substring(0,10) || new Date().toISOString().substring(0,10), notes: s.notes||'' }); };

  const exportCSV = () => {
    const h = ['Name','Email','Status','Fee Status','University','Room','Phone'];
    const rows = students.map(s => [s.name,s.email,s.status,s.feeStatus,s.university||'N/A',s.roomNumber||'N/A',s.phone||'N/A']);
    const csv = [h.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `Students_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  const StudentForm = ({ onSubmit, onClose, title }: { onSubmit: (e: React.FormEvent) => void; onClose: () => void; title: string }) => (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[['Full Name','text','name','Shahid Afridi'],['Email Address','email','email','student@example.com'],['Father Name','text','fatherName','Sahibzada Khan'],['CNIC','text','cnic','17301-1234567-9'],['Phone','tel','phone','0300-1234567'],['Emergency Contact','tel','emergencyContact','0302-7654321'],['University','text','university','University of Peshawar']].map(([lbl, type, key, ph]) => (
              <div key={key}>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{lbl}</label>
                <input type={type} value={(formData as any)[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} placeholder={ph}
                  className="input-base text-xs" required={key === 'name' || key === 'email'} />
              </div>
            ))}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Department / Semester</label>
              <div className="grid grid-cols-2 gap-2">
                <input value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="CS" className="input-base text-xs" />
                <input value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} placeholder="6th" className="input-base text-xs" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Room Number</label>
              <input value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} placeholder="101" className="input-base text-xs" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Admission Date</label>
              <input type="date" value={formData.admissionDate} onChange={e => setFormData({...formData, admissionDate: e.target.value})} className="input-base text-xs" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="input-base text-xs pt-3 resize-none" />
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" className="px-6 h-10 rounded-xl btn-gradient text-xs">Submit</button>
          </div>
        </form>
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">Student Directory</h1>
          <p className="text-slate-400 text-xs">Manage registrations, profiles, and statuses</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={exportCSV} className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center space-x-2 transition-colors">
            <Download className="w-4 h-4" /><span className="hidden sm:inline">Export CSV</span>
          </button>
          <button onClick={() => { setAddOpen(true); setFormData(emptyForm); }} className="h-10 px-5 rounded-xl btn-gradient text-xs flex items-center space-x-2">
            <Plus className="w-4 h-4" /><span>Add Student</span>
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <form onSubmit={e => { e.preventDefault(); setPage(1); fetch(); }} className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search name, email, or room..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs focus:border-blue-500 outline-none" />
        </form>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {[['statusFilter', statusFilter, setStatusFilter, [['','All Statuses'],['Active','Active'],['Suspended','Suspended']]],
            ['feeFilter', feeFilter, setFeeFilter, [['','All Fees'],['Paid','Paid'],['Pending','Pending'],['Overdue','Overdue']]]
          ].map(([, val, setter, opts]: any) => (
            <select key={val + opts[0][0]} value={val} onChange={e => { setter(e.target.value); setPage(1); }}
              className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 outline-none">
              {opts.map(([v, l]: any) => <option key={v} value={v}>{l}</option>)}
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
                <th className="p-4 pl-6">Student</th><th className="p-4">Contact</th><th className="p-4">Room</th><th className="p-4">Fee</th><th className="p-4">Status</th><th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400">{loading ? 'Loading...' : 'No students found.'}</td></tr>
              ) : students.map((s, i) => (
                <motion.tr key={s._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs uppercase">
                        {s.name.substring(0,2)}
                      </div>
                      <div><p className="font-bold text-slate-800 dark:text-white">{s.name}</p><p className="text-[10px] text-slate-400">{s.email}</p></div>
                    </div>
                  </td>
                  <td className="p-4"><p className="text-slate-700 dark:text-slate-300">{s.phone||'N/A'}</p><p className="text-[10px] text-slate-400">{s.university||'N/A'}</p></td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{s.roomNumber ? `Room ${s.roomNumber}` : <span className="text-slate-400 font-normal">Unassigned</span>}</td>
                  <td className="p-4">
                    <span className={`${s.feeStatus==='Paid'?'badge-green':s.feeStatus==='Pending'?'badge-amber':'badge-red'}`}>{s.feeStatus}</span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggleStatus(s)}
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all duration-200 ${s.status==='Active'?'bg-blue-500/10 text-blue-600 hover:bg-red-500/10 hover:text-red-500':'bg-red-500/10 text-red-500 hover:bg-blue-500/10 hover:text-blue-600'}`}>
                      {s.status==='Active'?<UserCheck className="w-3 h-3"/>:<Ban className="w-3 h-3"/>}
                      <span>{s.status}</span>
                    </button>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-1.5">
                    {[{icon:<Eye className="w-4 h-4"/>,click:()=>setViewStudent(s),title:'View'},{icon:<Edit className="w-4 h-4"/>,click:()=>openEdit(s),title:'Edit'},{icon:<Trash2 className="w-4 h-4"/>,click:()=>del(s._id),title:'Delete'}].map(({icon,click,title}) => (
                      <button key={title} onClick={click} title={title} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors inline-flex">{icon}</button>
                    ))}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total: {totalRecords}</span>
            <div className="flex items-center space-x-2">
              <button onClick={() => setPage(p => Math.max(p-1,1))} disabled={page===1} className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 px-2">Page {page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(p+1,totalPages))} disabled={page===totalPages} className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {addOpen && <StudentForm title="Register Student" onSubmit={create} onClose={() => setAddOpen(false)} />}
        {editStudent && <StudentForm title={`Edit: ${editStudent.name}`} onSubmit={update} onClose={() => setEditStudent(null)} />}

        {newCreds && (
          <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-xl text-white mb-1">Student Registered!</h3>
              <p className="text-slate-400 text-xs mb-6">Share these login credentials with the student.</p>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-3 mb-6 text-xs font-mono">
                {[['Student ID', newCreds.sid, 'text-blue-400'],['Email', newCreds.id, 'text-slate-200'],['Password', newCreds.pass, 'text-emerald-400']].map(([lbl, val, cls]) => (
                  <div key={lbl}>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider font-sans mb-0.5">{lbl}</span>
                    <span className={`font-bold ${cls}`}>{val}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setNewCreds(null)} className="w-full h-11 rounded-xl btn-gradient text-xs font-bold">Done</button>
            </motion.div>
          </div>
        )}

        {viewStudent && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Resident Profile</h3>
                <button onClick={() => setViewStudent(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-6">
                <div className="flex items-center space-x-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-extrabold text-xl uppercase">
                    {viewStudent.name.substring(0,2)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">{viewStudent.name}</h4>
                    <p className="text-xs text-slate-400">{viewStudent.email}</p>
                    <div className="flex space-x-2 mt-2">
                      <span className={viewStudent.status==='Active'?'badge-blue':'badge-red'}>{viewStudent.status}</span>
                      <span className={viewStudent.feeStatus==='Paid'?'badge-green':viewStudent.feeStatus==='Pending'?'badge-amber':'badge-red'}>Fee: {viewStudent.feeStatus}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                  {[['Father\'s Name',viewStudent.fatherName],['CNIC',viewStudent.cnic],['Phone',viewStudent.phone],['Emergency',viewStudent.emergencyContact],['University',viewStudent.university],['Department',`${viewStudent.department||'N/A'} (${viewStudent.semester||'N/A'})`],['Room',viewStudent.roomNumber?`Room ${viewStudent.roomNumber}`:'Unassigned'],['Admission',viewStudent.admissionDate?new Date(viewStudent.admissionDate).toLocaleDateString():' N/A']].map(([lbl,val]) => (
                    <div key={lbl}>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">{lbl}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{val||'N/A'}</span>
                    </div>
                  ))}
                </div>
                {viewStudent.notes && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">Notes</span>
                    <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">{viewStudent.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
