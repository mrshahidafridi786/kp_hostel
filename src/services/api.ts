/**
 * Mock API Service — Frontend Demo Mode
 * All data is served from in-memory mock objects.
 * Replace this file's internals with real fetch calls once the backend is live.
 */

import { UserProfile } from '@/context/AuthContext';

// ─── Mock Users ─────────────────────────────────────────────────────────────
const MOCK_USERS = [
  {
    _id: 'admin-001',
    id: 'admin-001',
    name: 'Warden M Noor Wazir',
    email: 'admin@kpyouth.com',
    password: 'admin123',
    role: 'Admin' as const,
    status: 'Active' as const,
    phone: '+92-91-9216701',
    feeStatus: 'Paid',
    profilePhoto: '/images/warden.jpg',
  },
  {
    _id: 'student-001',
    id: 'student-001',
    name: 'Shahid Afridi',
    email: 'student@kpyouth.com',
    password: 'student123',
    role: 'Student' as const,
    status: 'Active' as const,
    phone: '+92-301-1234567',
    fatherName: 'Sahibzada Afridi',
    cnic: '17301-1234567-9',
    emergencyContact: '+92-302-7654321',
    university: 'University of Peshawar',
    department: 'Computer Science',
    semester: '6th',
    roomNumber: '101',
    admissionDate: '2025-09-01',
    feeStatus: 'Pending',
    notes: 'Outstanding cricket player',
    profilePhoto: '',
  },
  {
    _id: 'student-002',
    id: 'student-002',
    name: 'Asad Ullah Khan',
    email: 'asad@kpyouth.com',
    password: 'student123',
    role: 'Student' as const,
    status: 'Active' as const,
    phone: '+92-302-7654321',
    fatherName: 'Noor Ullah Khan',
    cnic: '17301-9876543-1',
    university: 'UET Peshawar',
    department: 'Electrical Engineering',
    semester: '4th',
    roomNumber: '201',
    admissionDate: '2025-09-15',
    feeStatus: 'Paid',
    notes: '',
    profilePhoto: '',
  },
  {
    _id: 'student-003',
    id: 'student-003',
    name: 'Zeeshan Ahmad',
    email: 'zeeshan@kpyouth.com',
    password: 'student123',
    role: 'Student' as const,
    status: 'Active' as const,
    phone: '+92-303-1122334',
    fatherName: 'Ahmad Gul',
    cnic: '17301-1122334-5',
    university: 'Khyber Medical University',
    department: 'MBBS',
    semester: '2nd',
    roomNumber: '101',
    admissionDate: '2025-10-01',
    feeStatus: 'Pending',
    notes: 'Medical student, needs quiet room',
    profilePhoto: '',
  },
];

// ─── Mock Rooms ──────────────────────────────────────────────────────────────
let MOCK_ROOMS = [
  { _id: 'room-101', roomNumber: '101', floor: 1, capacity: 4, monthlyFee: 9500, status: 'Occupied', residents: ['student-001', 'student-003'] },
  { _id: 'room-102', roomNumber: '102', floor: 1, capacity: 4, monthlyFee: 9500, status: 'Available', residents: [] },
  { _id: 'room-201', roomNumber: '201', floor: 2, capacity: 2, monthlyFee: 14000, status: 'Occupied', residents: ['student-002'] },
  { _id: 'room-202', roomNumber: '202', floor: 2, capacity: 2, monthlyFee: 14000, status: 'Available', residents: [] },
  { _id: 'room-301', roomNumber: '301', floor: 3, capacity: 1, monthlyFee: 18000, status: 'Available', residents: [] },
];

// ─── Mock Fees ───────────────────────────────────────────────────────────────
let MOCK_FEES = [
  { _id: 'fee-001', student: 'student-001', studentName: 'Shahid Afridi', month: 'July 2026', amount: 9500, status: 'Pending', dueDate: '2026-07-10', paymentHistory: [] },
  { _id: 'fee-002', student: 'student-002', studentName: 'Asad Ullah Khan', month: 'July 2026', amount: 14000, status: 'Paid', dueDate: '2026-07-10', paidDate: '2026-07-03', transactionId: 'EBK-88234991', paymentHistory: [] },
  { _id: 'fee-003', student: 'student-003', studentName: 'Zeeshan Ahmad', month: 'July 2026', amount: 9500, status: 'Pending', dueDate: '2026-07-10', paymentHistory: [] },
  { _id: 'fee-004', student: 'student-001', studentName: 'Shahid Afridi', month: 'June 2026', amount: 9500, status: 'Paid', dueDate: '2026-06-10', paidDate: '2026-06-05', transactionId: 'EBK-77123882', paymentHistory: [] },
];

// ─── Mock Announcements ───────────────────────────────────────────────────────
let MOCK_ANNOUNCEMENTS = [
  { _id: 'ann-001', title: 'Monthly Fee Submission Deadline', content: 'Please submit your hostel boarding fee for the upcoming month by the 10th. Late submissions attract a PKR 500 penalty. Contact the warden office for any issues.', type: 'Fee Notice', createdAt: '2026-07-01T08:00:00Z', createdBy: { name: 'Warden M Noor Wazir' } },
  { _id: 'ann-002', title: 'Generator Maintenance Notice', content: 'Electricity backup generator servicing will occur this Sunday, July 5th, between 12:00 PM and 3:00 PM. Temporary UPS load limits will apply. Keep laptops charged beforehand.', type: 'Maintenance', createdAt: '2026-07-02T10:00:00Z', createdBy: { name: 'Warden M Noor Wazir' } },
  { _id: 'ann-003', title: 'New Study Hall Hours', content: 'The AC library and study hall will remain open 24/7 starting from July 6th. Students can access it using their room key card after midnight. Please maintain silence and cleanliness.', type: 'General', createdAt: '2026-07-03T09:00:00Z', createdBy: { name: 'Warden M Noor Wazir' } },
];

// ─── Mock Facilities ──────────────────────────────────────────────────────────
const MOCK_FACILITIES = [
  { _id: 'fac-001', name: 'High Speed WiFi', description: '24/7 uninterrupted fiber internet connection across all rooms and common areas.', icon: 'Wifi', displayOrder: 1 },
  { _id: 'fac-002', name: 'Electricity Backup', description: 'Heavy generators and UPS modules installed to handle load-shedding events.', icon: 'Zap', displayOrder: 2 },
  { _id: 'fac-003', name: 'CCTV & Security', description: '24/7 active CCTV recording and professional security guards at gates.', icon: 'Shield', displayOrder: 3 },
  { _id: 'fac-004', name: 'Dining Hall & Mess', description: 'Hygiene-certified kitchen serving three healthy meals daily to residents.', icon: 'Utensils', displayOrder: 4 },
  { _id: 'fac-005', name: 'Laundry Services', description: 'In-house washing machines and ironing services available twice a week.', icon: 'RefreshCw', displayOrder: 5 },
  { _id: 'fac-006', name: 'Air Conditioned Library', description: 'Quiet study environment open 24/7 with academic journals and study desks.', icon: 'BookOpen', displayOrder: 6 },
];

// ─── Mock Hostel Info ─────────────────────────────────────────────────────────
const MOCK_HOSTEL_INFO = {
  warden: { name: 'M Noor Wazir', image: '/images/warden.jpg', qualification: 'Master of Public Administration (Peshawar University)', message: 'Welcome to KP Youth Hostel. Our aim is to provide you a home away from home. Here, we prioritize your safety, hygiene, and study environment above everything else.' },
  md: { name: 'Hameed Khan', image: '/images/md.jpg', message: 'This hostel represents our commitment to the youth of KP. By digitizing fee collections, room allocations, and notifications, we ensure complete transparency and convenience.' },
};

// ─── Simulate delay ───────────────────────────────────────────────────────────
const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// ─── In-memory student list (mutable for CRUD) ────────────────────────────────
let MOCK_STUDENTS = [...MOCK_USERS.filter(u => u.role === 'Student')];

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API — mirrors the Express backend contract
// ═══════════════════════════════════════════════════════════════════════════════

// AUTH
export const mockLogin = async (email: string, password: string): Promise<{ success: boolean; user?: UserProfile; message?: string }> => {
  await delay();
  const found = MOCK_USERS.find(u => u.email === email && u.password === password);
  if (!found) return { success: false, message: 'Invalid email or password.' };
  const { password: _pw, ...user } = found;
  return { success: true, user: user as unknown as UserProfile };
};

// STUDENTS
export const getStudents = async () => {
  await delay();
  return { success: true, students: MOCK_STUDENTS };
};

export const addStudent = async (data: any) => {
  await delay();
  const newStudent = { ...data, _id: `student-${Date.now()}`, id: `student-${Date.now()}`, role: 'Student', status: 'Active', feeStatus: 'Pending', profilePhoto: '' };
  MOCK_STUDENTS = [...MOCK_STUDENTS, newStudent];
  return { success: true, student: newStudent };
};

export const updateStudent = async (id: string, data: any) => {
  await delay();
  MOCK_STUDENTS = MOCK_STUDENTS.map(s => s._id === id ? { ...s, ...data } : s);
  return { success: true, student: MOCK_STUDENTS.find(s => s._id === id) };
};

export const deleteStudent = async (id: string) => {
  await delay();
  MOCK_STUDENTS = MOCK_STUDENTS.filter(s => s._id !== id);
  return { success: true };
};

// ROOMS
export const getRooms = async () => {
  await delay();
  return { success: true, rooms: MOCK_ROOMS };
};

export const addRoom = async (data: any) => {
  await delay();
  const newRoom = { ...data, _id: `room-${Date.now()}`, residents: [] };
  MOCK_ROOMS = [...MOCK_ROOMS, newRoom];
  return { success: true, room: newRoom };
};

export const updateRoom = async (id: string, data: any) => {
  await delay();
  MOCK_ROOMS = MOCK_ROOMS.map(r => r._id === id ? { ...r, ...data } : r);
  return { success: true, room: MOCK_ROOMS.find(r => r._id === id) };
};

export const deleteRoom = async (id: string) => {
  await delay();
  MOCK_ROOMS = MOCK_ROOMS.filter(r => r._id !== id);
  return { success: true };
};

// FEES
export const getFees = async () => {
  await delay();
  return { success: true, invoices: MOCK_FEES };
};

export const getStudentFees = async (studentId: string) => {
  await delay();
  return { success: true, invoices: MOCK_FEES.filter(f => f.student === studentId) };
};

export const recordPayment = async (feeId: string, txId: string) => {
  await delay();
  MOCK_FEES = MOCK_FEES.map(f => f._id === feeId ? { ...f, status: 'Paid', transactionId: txId, paidDate: new Date().toISOString().split('T')[0] } : f);
  return { success: true };
};

export const generateInvoices = async () => {
  await delay(500);
  return { success: true, message: 'Invoices generated for all active students.' };
};

// ANNOUNCEMENTS
export const getAnnouncements = async () => {
  await delay();
  return { success: true, announcements: MOCK_ANNOUNCEMENTS };
};

export const addAnnouncement = async (data: any) => {
  await delay();
  const ann = { ...data, _id: `ann-${Date.now()}`, createdAt: new Date().toISOString(), createdBy: { name: 'Warden M Noor Wazir' } };
  MOCK_ANNOUNCEMENTS = [ann, ...MOCK_ANNOUNCEMENTS];
  return { success: true, announcement: ann };
};

export const deleteAnnouncement = async (id: string) => {
  await delay();
  MOCK_ANNOUNCEMENTS = MOCK_ANNOUNCEMENTS.filter(a => a._id !== id);
  return { success: true };
};

// FACILITIES
export const getFacilities = async () => {
  await delay();
  return { success: true, facilities: MOCK_FACILITIES };
};

// HOSTEL INFO
export const getHostelInfo = async () => {
  await delay();
  return { success: true, hostelInfo: MOCK_HOSTEL_INFO };
};

export const getStudentProfile = async (studentId: string) => {
  await delay();
  const student = MOCK_STUDENTS.find(s => s._id === studentId);
  if (!student) return { success: false, message: 'Student not found' };
  return { success: true, student };
};

export const updateStudentProfile = async (studentId: string, data: any) => {
  await delay();
  MOCK_STUDENTS = MOCK_STUDENTS.map(s => s._id === studentId ? { ...s, ...data } : s);
  return { success: true, student: MOCK_STUDENTS.find(s => s._id === studentId) };
};

// Legacy shim — keeps old code that calls apiRequest() from crashing
export const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  console.warn(`[MOCK] apiRequest called for: ${endpoint} — using mock data`);
  return { success: true, data: null };
};

export default apiRequest;
