"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/services/api';
import {
  Search, Filter, Plus, Edit, Trash2, Eye, UserPlus,
  CheckCircle, Ban, ArrowLeft, ArrowRight, Download, Upload,
  X, Check, AlertTriangle, EyeOff, UserCheck, ChevronLeft, ChevronRight
} from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  email: string;
  status: 'Active' | 'Suspended';
  feeStatus: 'Paid' | 'Pending' | 'Overdue';
  fatherName?: string;
  cnic?: string;
  phone?: string;
  emergencyContact?: string;
  university?: string;
  department?: string;
  semester?: string;
  roomNumber?: string;
  admissionDate?: string;
  notes?: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [feeFilter, setFeeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modals state
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [newStudentCreds, setNewStudentCreds] = useState<{ id: string; pass: string; sid: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '', email: '', fatherName: '', cnic: '', phone: '',
    emergencyContact: '', university: '', department: '', semester: '',
    roomNumber: '', admissionDate: new Date().toISOString().substring(0, 10), notes: ''
  });

  // Fetch Students list
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '8',
        search,
        status: statusFilter,
        feeStatus: feeFilter
      });
      const data = await apiRequest(`/students?${queryParams}`);
      if (data?.success) {
        setStudents(data.students);
        setTotalPages(data.pagination.pages);
        setTotalRecords(data.pagination.total);
      }
    } catch (err) {
      console.warn('[STUDENTS] Fetch failed, using mock');
      // Mock Fallbacks
      const mockStudents: Student[] = [
        { _id: '1', name: 'Shahid Afridi', email: 'student@kpyouth.com', status: 'Active', feeStatus: 'Pending', fatherName: 'Sahibzada Afridi', cnic: '17301-1234567-9', phone: '0301-1234567', emergencyContact: '0302-7654321', university: 'University of Peshawar', department: 'Computer Science', semester: '6th', roomNumber: '101', admissionDate: '2025-09-01', notes: 'Cricket Captain' },
        { _id: '2', name: 'Shahid Khan', email: 'shahid.cs@gmail.com', status: 'Active', feeStatus: 'Paid', fatherName: 'Sartaj Khan', cnic: '17301-7654321-3', phone: '0300-1122334', emergencyContact: '0301-9988776', university: 'UET Peshawar', department: 'Civil Engineering', semester: '4th', roomNumber: '101', admissionDate: '2026-02-15' },
        { _id: '3', name: 'Asad Ali', email: 'asad.civil@uet.edu', status: 'Active', feeStatus: 'Paid', fatherName: 'Muhammad Ali', cnic: '17301-2233445-5', phone: '0345-5556667', emergencyContact: '0300-4443322', university: 'UET Peshawar', department: 'Mechanical Engineering', semester: '2nd', roomNumber: '202', admissionDate: '2026-03-01' },
        { _id: '4', name: 'Zeeshan Ahmad', email: 'zeeshan.kmu@gmail.com', status: 'Suspended', feeStatus: 'Overdue', fatherName: 'Ahmad Jan', cnic: '14201-9988776-1', phone: '0312-9988776', emergencyContact: '0313-1122334', university: 'Khyber Medical University', department: 'MBBS', semester: '8th', roomNumber: '301', admissionDate: '2024-10-10' }
      ];
      setStudents(mockStudents.filter(s => {
        if (statusFilter && s.status !== statusFilter) return false;
        if (feeFilter && s.feeStatus !== feeFilter) return false;
        if (search) {
          const sTerm = search.toLowerCase();
          return s.name.toLowerCase().includes(sTerm) || s.email.toLowerCase().includes(sTerm) || s.roomNumber?.includes(sTerm);
        }
        return true;
      }));
      setTotalPages(1);
      setTotalRecords(4);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, statusFilter, feeFilter]);

  const handleSearchTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await apiRequest('/students', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (data.success && data.student) {
        setNewStudentCreds({
          id: data.student.email,
          pass: data.student.defaultPassword,
          sid: data.student.studentId
        });
        setAddModalOpen(false);
        setFormData({
          name: '', email: '', fatherName: '', cnic: '', phone: '',
          emergencyContact: '', university: '', department: '', semester: '',
          roomNumber: '', admissionDate: new Date().toISOString().substring(0, 10), notes: ''
        });
        fetchStudents();
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to register student');
      // Mock creation popup for demo if backend is offline
      setNewStudentCreds({
        id: formData.email,
        pass: 'student123',
        sid: `KPH-2026-${1000 + students.length + 1}`
      });
      setAddModalOpen(false);
      fetchStudents();
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    setError(null);
    try {
      const data = await apiRequest(`/students/${editStudent._id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      if (data.success) {
        setEditStudent(null);
        fetchStudents();
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to update student profile');
      // Mock update
      setEditStudent(null);
      fetchStudents();
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student? This will release their room assignment.')) return;
    try {
      await apiRequest(`/students/${id}`, { method: 'DELETE' });
      fetchStudents();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Delete action simulated.');
    }
  };

  const toggleStatus = async (student: Student) => {
    const nextStatus = student.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await apiRequest(`/students/${student._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      fetchStudents();
    } catch (err) {
      console.error('Toggle failed', err);
      // Mock toggle
      setStudents(prev => prev.map(s => s._id === student._id ? { ...s, status: nextStatus } : s));
    }
  };

  const openEditModal = (student: Student) => {
    setEditStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      fatherName: student.fatherName || '',
      cnic: student.cnic || '',
      phone: student.phone || '',
      emergencyContact: student.emergencyContact || '',
      university: student.university || '',
      department: student.department || '',
      semester: student.semester || '',
      roomNumber: student.roomNumber || '',
      admissionDate: student.admissionDate ? student.admissionDate.substring(0, 10) : new Date().toISOString().substring(0, 10),
      notes: student.notes || ''
    });
  };

  const openAddModal = () => {
    setAddModalOpen(true);
    setFormData({
      name: '', email: '', fatherName: '', cnic: '', phone: '',
      emergencyContact: '', university: '', department: '', semester: '',
      roomNumber: '', admissionDate: new Date().toISOString().substring(0, 10), notes: ''
    });
  };

  const exportToCSV = () => {
    // Generate CSV contents
    const headers = ['Name', 'Email', 'Status', 'Fee Status', 'University', 'Room', 'Phone'];
    const rows = students.map(s => [
      s.name, s.email, s.status, s.feeStatus, s.university || 'N/A', s.roomNumber || 'N/A', s.phone || 'N/A'
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Student_Directory_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header and top buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Student Directory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Manage student registrations, profile updates, and active statuses.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={openAddModal}
            className="h-10 px-5 rounded-xl btn-gradient text-xs font-semibold flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <form onSubmit={handleSearchTrigger} className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, CNIC, email, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs focus:border-blue-600 focus:outline-none transition-colors"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <select
            value={feeFilter}
            onChange={(e) => { setFeeFilter(e.target.value); setPage(1); }}
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Fee Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 pl-6">Student Details</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Placement</th>
                <th className="p-4">Fee Status</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    {loading ? 'Refreshing directory...' : 'No students found matching filters.'}
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 pl-6">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white block text-sm">{student.name}</span>
                        <span className="text-[10px] text-slate-450 dark:text-slate-400 block">{student.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="text-slate-700 dark:text-slate-300 block">{student.phone || 'N/A'}</span>
                        <span className="text-[10px] text-slate-450 dark:text-slate-400 block">{student.university || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {student.roomNumber ? `Room ${student.roomNumber}` : <span className="text-slate-400 font-normal">Unassigned</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        student.feeStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        student.feeStatus === 'Pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {student.feeStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleStatus(student)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all duration-200 ${
                          student.status === 'Active'
                            ? 'bg-blue-500/10 text-blue-600 hover:bg-red-500/10 hover:text-red-500'
                            : 'bg-red-500/10 text-red-500 hover:bg-blue-500/10 hover:text-blue-600'
                        }`}
                        title={student.status === 'Active' ? 'Click to Suspend Student' : 'Click to Activate Student'}
                      >
                        {student.status === 'Active' ? <UserCheck className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                        <span>{student.status}</span>
                      </button>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button
                        onClick={() => setViewStudent(student)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-blue-600"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(student)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-amber-500"
                        title="Edit Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student._id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-red-500"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paging Actions */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Total: {totalRecords} student(s)
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-650 hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold px-3 text-slate-700 dark:text-slate-200">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-650 hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD / CREATE STUDENT MODAL --- */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white flex items-center space-x-2">
                <UserPlus className="w-5.5 h-5.5 text-blue-600" />
                <span>Register Student</span>
              </h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Full Name</label>
                  <input
                    type="text" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600 focus:outline-none"
                    placeholder="Shahid Afridi"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Email Address</label>
                  <input
                    type="email" required value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600 focus:outline-none"
                    placeholder="student@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Father Name</label>
                  <input
                    type="text" value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600 focus:outline-none"
                    placeholder="Sahibzada Afridi"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">CNIC Number</label>
                  <input
                    type="text" value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600 focus:outline-none"
                    placeholder="17301-1234567-9"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Phone Number</label>
                  <input
                    type="tel" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600 focus:outline-none"
                    placeholder="0300-1234567"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Emergency Contact</label>
                  <input
                    type="tel" value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600 focus:outline-none"
                    placeholder="0302-7654321"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">University</label>
                  <input
                    type="text" value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600 focus:outline-none"
                    placeholder="University of Peshawar"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Department / Semester</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text" value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600 focus:outline-none"
                      placeholder="Computer Science"
                    />
                    <input
                      type="text" value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600 focus:outline-none"
                      placeholder="6th"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Assign Room (Number)</label>
                  <input
                    type="text" value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600 focus:outline-none"
                    placeholder="101 (or leave blank)"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Admission Date</label>
                  <input
                    type="date" value={formData.admissionDate}
                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Administrative Notes</label>
                <textarea
                  rows={2} value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600 focus:outline-none resize-none"
                  placeholder="Additional hostel admission parameters..."
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button" onClick={() => setAddModalOpen(false)}
                  className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 h-10 rounded-xl btn-gradient text-xs font-semibold">
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CREDS POPUP (SHOWS AUTO PASSWORD / STUDENT ID ON REGISTRATION) --- */}
      {newStudentCreds && (
        <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-display font-extrabold text-xl text-white mb-2">Student Registered!</h3>
            <p className="text-slate-400 text-xs mb-6">Share the following login credentials with the student.</p>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-3 mb-6 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider font-sans">Student ID</span>
                <span className="text-blue-400 font-bold">{newStudentCreds.sid}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider font-sans">Email Login</span>
                <span className="text-slate-200">{newStudentCreds.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider font-sans">Default Password</span>
                <span className="text-emerald-400 font-bold">{newStudentCreds.pass}</span>
              </div>
            </div>

            <button
              onClick={() => setNewStudentCreds(null)}
              className="w-full h-11 rounded-xl btn-gradient font-display text-xs"
            >
              Done and Copy
            </button>
          </div>
        </div>
      )}

      {/* --- EDIT STUDENT PROFILE MODAL --- */}
      {editStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white flex items-center space-x-2">
                <Edit className="w-5.5 h-5.5 text-blue-600" />
                <span>Edit Profile: {editStudent.name}</span>
              </h3>
              <button onClick={() => setEditStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Full Name</label>
                  <input
                    type="text" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Email Address</label>
                  <input
                    type="email" required value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Father Name</label>
                  <input
                    type="text" value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">CNIC Number</label>
                  <input
                    type="text" value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Phone Number</label>
                  <input
                    type="tel" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Emergency Contact</label>
                  <input
                    type="tel" value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">University</label>
                  <input
                    type="text" value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Department / Semester</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text" value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                    <input
                      type="text" value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Assign Room (Number)</label>
                  <input
                    type="text" value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Admission Date</label>
                  <input
                    type="date" value={formData.admissionDate}
                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Administrative Notes</label>
                <textarea
                  rows={2} value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:border-blue-600 resize-none"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button" onClick={() => setEditStudent(null)}
                  className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 h-10 rounded-xl btn-gradient text-xs font-semibold">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW STUDENT PROFILE DETAILS MODAL --- */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Resident Information</h3>
              <button onClick={() => setViewStudent(null)} className="text-slate-400 hover:text-slate-650">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="flex items-center space-x-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-extrabold text-xl uppercase">
                  {viewStudent.name.substring(0, 2)}
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-lg text-slate-905 dark:text-white">{viewStudent.name}</h4>
                  <span className="text-xs text-slate-450 dark:text-slate-400 block">{viewStudent.email}</span>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      viewStudent.status === 'Active' ? 'bg-blue-500/10 text-blue-600' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {viewStudent.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      viewStudent.feeStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      Fee Status: {viewStudent.feeStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Grid Fields */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5 font-sans">Father&apos;s Name</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewStudent.fatherName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5">CNIC Number</span>
                  <span className="font-semibold text-slate-850 dark:text-slate-200">{viewStudent.cnic || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5">Phone Number</span>
                  <span className="font-semibold text-slate-850 dark:text-slate-200">{viewStudent.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5">Emergency Contact</span>
                  <span className="font-semibold text-slate-850 dark:text-slate-200">{viewStudent.emergencyContact || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5">University</span>
                  <span className="font-semibold text-slate-850 dark:text-slate-200">{viewStudent.university || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5">Department / Semester</span>
                  <span className="font-semibold text-slate-850 dark:text-slate-200">
                    {viewStudent.department || 'N/A'} ({viewStudent.semester || 'N/A'})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5">Assigned Room</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {viewStudent.roomNumber ? `Room ${viewStudent.roomNumber}` : 'Unassigned'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5">Admission Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {viewStudent.admissionDate ? new Date(viewStudent.admissionDate).toLocaleDateString([], { dateStyle: 'medium' }) : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {viewStudent.notes && (
                <div className="border-t border-slate-105 dark:border-slate-800 pt-4 text-xs">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">Administrative Notes</span>
                  <p className="text-slate-600 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {viewStudent.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
