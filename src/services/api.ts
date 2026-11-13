/**
 * Mock API Service & Local Persistence Layer
 * Full featured in-browser data store with realistic randomized data.
 * Changes are saved to localStorage so edits and tests persist across reloads.
 */

import { UserProfile } from '@/context/AuthContext';

const STORAGE_KEY_PREFIX = 'kp_hostel_v2_';

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

// ─── Realistic Seed Data ──────────────────────────────────────────────────────

export const INITIAL_USERS = [
  {
    _id: 'admin-001',
    id: 'admin-001',
    name: 'Prof. Dr. Tariq Mansoor',
    email: 'admin@kpyouth.com',
    password: 'admin123',
    role: 'Admin' as const,
    status: 'Active' as const,
    phone: '+92-91-9216701',
    feeStatus: 'Paid' as const,
    profilePhoto: '/images/warden.jpg',
  },
  {
    _id: 'student-001',
    id: 'student-001',
    studentId: 'KPH-2026-1001',
    name: 'Bilal Tariq',
    email: 'student@kpyouth.com',
    password: 'student123',
    role: 'Student' as const,
    status: 'Active' as const,
    phone: '+92-301-4458921',
    fatherName: 'Tariq Mehmood',
    cnic: '17301-8923412-1',
    emergencyContact: '+92-333-9128374',
    university: 'FAST-NUCES Peshawar',
    department: 'Software Engineering',
    semester: '6th Semester',
    roomNumber: '101',
    admissionDate: '2025-08-20',
    feeStatus: 'Pending' as const,
    notes: 'Merit scholarship recipient. IEEE Student Chapter Lead.',
    profilePhoto: '',
  },
  {
    _id: 'student-002',
    id: 'student-002',
    studentId: 'KPH-2026-1002',
    name: 'Danyal Rehman',
    email: 'danyal.rehman@outlook.com',
    password: 'student123',
    role: 'Student' as const,
    status: 'Active' as const,
    phone: '+92-302-8812390',
    fatherName: 'Abdul Rehman Khan',
    cnic: '17301-5561234-7',
    emergencyContact: '+92-311-2244668',
    university: 'UET Peshawar',
    department: 'Electrical Engineering',
    semester: '4th Semester',
    roomNumber: '101',
    admissionDate: '2025-09-05',
    feeStatus: 'Paid' as const,
    notes: 'Robotics team member. Quiet study preferences.',
    profilePhoto: '',
  },
  {
    _id: 'student-003',
    id: 'student-003',
    studentId: 'KPH-2026-1003',
    name: 'Hamza Farooq',
    email: 'hamza.farooq@kmu.edu.pk',
    password: 'student123',
    role: 'Student' as const,
    status: 'Active' as const,
    phone: '+92-334-1192834',
    fatherName: 'Farooq Ahmad Sheikh',
    cnic: '17201-9012384-3',
    emergencyContact: '+92-300-8877665',
    university: 'Khyber Medical University (KMU)',
    department: 'Doctor of Pharmacy (Pharm-D)',
    semester: '3rd Semester',
    roomNumber: '102',
    admissionDate: '2025-10-01',
    feeStatus: 'Paid' as const,
    notes: 'Volunteers for hostel first-aid clinic.',
    profilePhoto: '',
  },
  {
    _id: 'student-004',
    id: 'student-004',
    studentId: 'KPH-2026-1004',
    name: 'Saad Munir',
    email: 'saad.civil@uet.edu.pk',
    password: 'student123',
    role: 'Student' as const,
    status: 'Active' as const,
    phone: '+92-345-6677889',
    fatherName: 'Munir Akram',
    cnic: '17301-4433221-5',
    emergencyContact: '+92-321-9988776',
    university: 'UET Peshawar',
    department: 'Civil Engineering',
    semester: '6th Semester',
    roomNumber: '102',
    admissionDate: '2025-08-15',
    feeStatus: 'Pending' as const,
    notes: '',
    profilePhoto: '',
  },
  {
    _id: 'student-005',
    id: 'student-005',
    studentId: 'KPH-2026-1005',
    name: 'Zubair Khattak',
    email: 'zubair.khattak@gmail.com',
    password: 'student123',
    role: 'Student' as const,
    status: 'Active' as const,
    phone: '+92-313-9988112',
    fatherName: 'Jahangir Khattak',
    cnic: '14201-3344556-9',
    emergencyContact: '+92-300-1122334',
    university: 'CECOS University',
    department: 'Computer Science',
    semester: '5th Semester',
    roomNumber: '201',
    admissionDate: '2025-07-28',
    feeStatus: 'Paid' as const,
    notes: 'Full-stack web developer & peer mentor.',
    profilePhoto: '',
  },
  {
    _id: 'student-006',
    id: 'student-006',
    studentId: 'KPH-2026-1006',
    name: 'Usman Ghani',
    email: 'usman.ghani@icp.edu.pk',
    password: 'student123',
    role: 'Student' as const,
    status: 'Active' as const,
    phone: '+92-308-7744119',
    fatherName: 'Ghulam Rasool',
    cnic: '17301-1199882-3',
    emergencyContact: '+92-342-9988110',
    university: 'Islamia College Peshawar',
    department: 'BS Economics',
    semester: '2nd Semester',
    roomNumber: '201',
    admissionDate: '2026-02-10',
    feeStatus: 'Paid' as const,
    notes: 'Debating society active speaker.',
    profilePhoto: '',
  },
  {
    _id: 'student-007',
    id: 'student-007',
    studentId: 'KPH-2026-1007',
    name: 'Waqas Bacha',
    email: 'waqas.bacha@uet.edu.pk',
    password: 'student123',
    role: 'Student' as const,
    status: 'Active' as const,
    phone: '+92-315-6677223',
    fatherName: 'Bakhtiar Bacha',
    cnic: '17101-7788990-1',
    emergencyContact: '+92-301-5544332',
    university: 'UET Peshawar',
    department: 'Mechanical Engineering',
    semester: '4th Semester',
    roomNumber: '202',
    admissionDate: '2025-09-12',
    feeStatus: 'Paid' as const,
    notes: 'Table tennis tournament champion 2025.',
    profilePhoto: '',
  },
  {
    _id: 'student-008',
    id: 'student-008',
    studentId: 'KPH-2026-1008',
    name: 'Farhan Mehmood',
    email: 'farhan.ai@imsciences.edu.pk',
    password: 'student123',
    role: 'Student' as const,
    status: 'Active' as const,
    phone: '+92-332-9988771',
    fatherName: 'Mehmood Ul Hassan',
    cnic: '17301-8877665-9',
    emergencyContact: '+92-300-4433221',
    university: 'Institute of Management Sciences (IMSciences)',
    department: 'BS Artificial Intelligence',
    semester: '6th Semester',
    roomNumber: '202',
    admissionDate: '2025-08-18',
    feeStatus: 'Paid' as const,
    notes: 'AI Researcher & Kaggle enthusiast.',
    profilePhoto: '',
  },
  {
    _id: 'student-009',
    id: 'student-009',
    studentId: 'KPH-2026-1009',
    name: 'Shahzaib Shinwari',
    email: 'shahzaib.kmc@gmail.com',
    password: 'student123',
    role: 'Student' as const,
    status: 'Active' as const,
    phone: '+92-312-3344556',
    fatherName: 'Jamshed Shinwari',
    cnic: '14101-2233445-7',
    emergencyContact: '+92-321-4455667',
    university: 'Khyber Medical College (KMC)',
    department: 'MBBS (Clinical Rotations)',
    semester: '8th Semester',
    roomNumber: '301',
    admissionDate: '2024-09-01',
    feeStatus: 'Paid' as const,
    notes: 'Requires night study lamp & silence for hospital ward prep.',
    profilePhoto: '',
  },
  {
    _id: 'student-010',
    id: 'student-010',
    studentId: 'KPH-2026-1010',
    name: 'Taimoor Arshad',
    email: 'taimoor.arshad@uop.edu.pk',
    password: 'student123',
    role: 'Student' as const,
    status: 'Active' as const,
    phone: '+92-305-6677884',
    fatherName: 'Arshad Javed',
    cnic: '17301-9988774-2',
    emergencyContact: '+92-333-8877661',
    university: 'University of Peshawar',
    department: 'Cyber Security & Forensic Computing',
    semester: '4th Semester',
    roomNumber: '302',
    admissionDate: '2025-09-20',
    feeStatus: 'Overdue' as const,
    notes: 'Requested installment payment plan for hostel dues.',
    profilePhoto: '',
  },
  {
    _id: 'student-011',
    id: 'student-011',
    studentId: 'KPH-2026-1011',
    name: 'Omer Khalid',
    email: 'omer.khalid@uet.edu.pk',
    password: 'student123',
    role: 'Student' as const,
    status: 'Active' as const,
    phone: '+92-346-7788991',
    fatherName: 'Khalid Masood',
    cnic: '17301-4455667-1',
    emergencyContact: '+92-315-9988112',
    university: 'UET Peshawar',
    department: 'Architecture & Design',
    semester: '7th Semester',
    roomNumber: '401',
    admissionDate: '2024-10-15',
    feeStatus: 'Paid' as const,
    notes: 'Studio design work desk installed.',
    profilePhoto: '',
  },
  {
    _id: 'student-012',
    id: 'student-012',
    studentId: 'KPH-2026-1012',
    name: 'Irfan Yousafzai',
    email: 'irfan.ds@uop.edu.pk',
    password: 'student123',
    role: 'Student' as const,
    status: 'Active' as const,
    phone: '+92-331-5544332',
    fatherName: 'Sher Afzal Yousafzai',
    cnic: '15402-9988776-5',
    emergencyContact: '+92-300-7766554',
    university: 'University of Peshawar',
    department: 'BS Data Science',
    semester: '5th Semester',
    roomNumber: '402',
    admissionDate: '2025-08-30',
    feeStatus: 'Paid' as const,
    notes: '',
    profilePhoto: '',
  },
  {
    _id: 'student-013',
    id: 'student-013',
    studentId: 'KPH-2026-1013',
    name: 'Haris Qureshi',
    email: 'haris.qureshi@imsciences.edu.pk',
    password: 'student123',
    role: 'Student' as const,
    status: 'Active' as const,
    phone: '+92-304-8899112',
    fatherName: 'Qureshi Naseer',
    cnic: '17301-3322119-7',
    emergencyContact: '+92-345-2233441',
    university: 'IMSciences Peshawar',
    department: 'BS Accounting & Finance',
    semester: '1st Semester',
    roomNumber: '',
    admissionDate: '2026-11-01',
    feeStatus: 'Pending' as const,
    notes: 'New admission applicant awaiting room assignment.',
    profilePhoto: '',
  },
  {
    _id: 'student-014',
    id: 'student-014',
    studentId: 'KPH-2026-1014',
    name: 'Moiz Alam',
    email: 'moiz.alam@uop.edu.pk',
    password: 'student123',
    role: 'Student' as const,
    status: 'Suspended' as const,
    phone: '+92-311-6655443',
    fatherName: 'Sardar Alam',
    cnic: '14301-7788112-9',
    emergencyContact: '+92-332-1199882',
    university: 'University of Peshawar',
    department: 'BS Software Engineering',
    semester: '3rd Semester',
    roomNumber: '',
    admissionDate: '2025-09-18',
    feeStatus: 'Overdue' as const,
    notes: 'Suspended due to prolonged unexcused absence.',
    profilePhoto: '',
  },
];

export const INITIAL_ROOMS = [
  {
    _id: 'room-101',
    roomNumber: '101',
    floor: 1,
    capacity: 4,
    monthlyFee: 9500,
    status: 'Available' as const,
    residents: [
      { _id: 'student-001', name: 'Bilal Tariq', email: 'student@kpyouth.com' },
      { _id: 'student-002', name: 'Danyal Rehman', email: 'danyal.rehman@outlook.com' },
    ],
  },
  {
    _id: 'room-102',
    roomNumber: '102',
    floor: 1,
    capacity: 4,
    monthlyFee: 9500,
    status: 'Available' as const,
    residents: [
      { _id: 'student-003', name: 'Hamza Farooq', email: 'hamza.farooq@kmu.edu.pk' },
      { _id: 'student-004', name: 'Saad Munir', email: 'saad.civil@uet.edu.pk' },
    ],
  },
  {
    _id: 'room-103',
    roomNumber: '103',
    floor: 1,
    capacity: 3,
    monthlyFee: 10500,
    status: 'Available' as const,
    residents: [],
  },
  {
    _id: 'room-104',
    roomNumber: '104',
    floor: 1,
    capacity: 4,
    monthlyFee: 9500,
    status: 'Maintenance' as const,
    residents: [],
  },
  {
    _id: 'room-201',
    roomNumber: '201',
    floor: 2,
    capacity: 2,
    monthlyFee: 14000,
    status: 'Full' as const,
    residents: [
      { _id: 'student-005', name: 'Zubair Khattak', email: 'zubair.khattak@gmail.com' },
      { _id: 'student-006', name: 'Usman Ghani', email: 'usman.ghani@icp.edu.pk' },
    ],
  },
  {
    _id: 'room-202',
    roomNumber: '202',
    floor: 2,
    capacity: 2,
    monthlyFee: 14000,
    status: 'Full' as const,
    residents: [
      { _id: 'student-007', name: 'Waqas Bacha', email: 'waqas.bacha@uet.edu.pk' },
      { _id: 'student-008', name: 'Farhan Mehmood', email: 'farhan.ai@imsciences.edu.pk' },
    ],
  },
  {
    _id: 'room-203',
    roomNumber: '203',
    floor: 2,
    capacity: 2,
    monthlyFee: 14000,
    status: 'Available' as const,
    residents: [],
  },
  {
    _id: 'room-204',
    roomNumber: '204',
    floor: 2,
    capacity: 3,
    monthlyFee: 12000,
    status: 'Available' as const,
    residents: [],
  },
  {
    _id: 'room-301',
    roomNumber: '301',
    floor: 3,
    capacity: 1,
    monthlyFee: 19500,
    status: 'Full' as const,
    residents: [
      { _id: 'student-009', name: 'Shahzaib Shinwari', email: 'shahzaib.kmc@gmail.com' },
    ],
  },
  {
    _id: 'room-302',
    roomNumber: '302',
    floor: 3,
    capacity: 1,
    monthlyFee: 19500,
    status: 'Full' as const,
    residents: [
      { _id: 'student-010', name: 'Taimoor Arshad', email: 'taimoor.arshad@uop.edu.pk' },
    ],
  },
  {
    _id: 'room-303',
    roomNumber: '303',
    floor: 3,
    capacity: 1,
    monthlyFee: 19500,
    status: 'Available' as const,
    residents: [],
  },
  {
    _id: 'room-401',
    roomNumber: '401',
    floor: 4,
    capacity: 1,
    monthlyFee: 24000,
    status: 'Full' as const,
    residents: [
      { _id: 'student-011', name: 'Omer Khalid', email: 'omer.khalid@uet.edu.pk' },
    ],
  },
  {
    _id: 'room-402',
    roomNumber: '402',
    floor: 4,
    capacity: 2,
    monthlyFee: 16500,
    status: 'Available' as const,
    residents: [
      { _id: 'student-012', name: 'Irfan Yousafzai', email: 'irfan.ds@uop.edu.pk' },
    ],
  },
];

export const INITIAL_FEES = [
  {
    _id: 'fee-101',
    student: 'student-001',
    studentId: { _id: 'student-001', name: 'Bilal Tariq', email: 'student@kpyouth.com', studentId: 'KPH-2026-1001' },
    roomNumber: '101',
    amount: 9500,
    month: 'November',
    year: 2026,
    dueDate: '2026-11-10',
    status: 'Unpaid' as const,
  },
  {
    _id: 'fee-102',
    student: 'student-002',
    studentId: { _id: 'student-002', name: 'Danyal Rehman', email: 'danyal.rehman@outlook.com', studentId: 'KPH-2026-1002' },
    roomNumber: '101',
    amount: 9500,
    month: 'November',
    year: 2026,
    dueDate: '2026-11-10',
    status: 'Paid' as const,
    paymentDate: '2026-11-03',
    paymentMethod: 'EasyPaisa',
    transactionId: 'EP-998234125',
  },
  {
    _id: 'fee-103',
    student: 'student-003',
    studentId: { _id: 'student-003', name: 'Hamza Farooq', email: 'hamza.farooq@kmu.edu.pk', studentId: 'KPH-2026-1003' },
    roomNumber: '102',
    amount: 9500,
    month: 'November',
    year: 2026,
    dueDate: '2026-11-10',
    status: 'Paid' as const,
    paymentDate: '2026-11-04',
    paymentMethod: 'JazzCash',
    transactionId: 'JC-881239011',
  },
  {
    _id: 'fee-104',
    student: 'student-004',
    studentId: { _id: 'student-004', name: 'Saad Munir', email: 'saad.civil@uet.edu.pk', studentId: 'KPH-2026-1004' },
    roomNumber: '102',
    amount: 9500,
    month: 'November',
    year: 2026,
    dueDate: '2026-11-10',
    status: 'Unpaid' as const,
  },
  {
    _id: 'fee-105',
    student: 'student-005',
    studentId: { _id: 'student-005', name: 'Zubair Khattak', email: 'zubair.khattak@gmail.com', studentId: 'KPH-2026-1005' },
    roomNumber: '201',
    amount: 14000,
    month: 'November',
    year: 2026,
    dueDate: '2026-11-10',
    status: 'Paid' as const,
    paymentDate: '2026-11-02',
    paymentMethod: 'Meezan Bank Transfer',
    transactionId: 'MEEZAN-77123984',
  },
  {
    _id: 'fee-106',
    student: 'student-006',
    studentId: { _id: 'student-006', name: 'Usman Ghani', email: 'usman.ghani@icp.edu.pk', studentId: 'KPH-2026-1006' },
    roomNumber: '201',
    amount: 14000,
    month: 'November',
    year: 2026,
    dueDate: '2026-11-10',
    status: 'Paid' as const,
    paymentDate: '2026-11-05',
    paymentMethod: 'Bank Alfalah App',
    transactionId: 'BA-99128374',
  },
  {
    _id: 'fee-107',
    student: 'student-009',
    studentId: { _id: 'student-009', name: 'Shahzaib Shinwari', email: 'shahzaib.kmc@gmail.com', studentId: 'KPH-2026-1009' },
    roomNumber: '301',
    amount: 19500,
    month: 'November',
    year: 2026,
    dueDate: '2026-11-10',
    status: 'Paid' as const,
    paymentDate: '2026-11-01',
    paymentMethod: 'Online Portal (Debit Card)',
    transactionId: 'PAY-441209341',
  },
  {
    _id: 'fee-108',
    student: 'student-010',
    studentId: { _id: 'student-010', name: 'Taimoor Arshad', email: 'taimoor.arshad@uop.edu.pk', studentId: 'KPH-2026-1010' },
    roomNumber: '302',
    amount: 19500,
    month: 'October',
    year: 2026,
    dueDate: '2026-10-10',
    status: 'Overdue' as const,
  },
  {
    _id: 'fee-109',
    student: 'student-001',
    studentId: { _id: 'student-001', name: 'Bilal Tariq', email: 'student@kpyouth.com', studentId: 'KPH-2026-1001' },
    roomNumber: '101',
    amount: 9500,
    month: 'October',
    year: 2026,
    dueDate: '2026-10-10',
    status: 'Paid' as const,
    paymentDate: '2026-10-06',
    paymentMethod: 'EasyPaisa',
    transactionId: 'EP-774411990',
  },
  {
    _id: 'fee-110',
    student: 'student-011',
    studentId: { _id: 'student-011', name: 'Omer Khalid', email: 'omer.khalid@uet.edu.pk', studentId: 'KPH-2026-1011' },
    roomNumber: '401',
    amount: 24000,
    month: 'November',
    year: 2026,
    dueDate: '2026-11-10',
    status: 'Paid' as const,
    paymentDate: '2026-11-02',
    paymentMethod: 'Bank Transfer',
    transactionId: 'HBL-12903841',
  },
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    _id: 'ann-101',
    title: 'Winter Sports Gala & Table Tennis Championship',
    content: 'Registration is now open for the Annual Inter-Floor Table Tennis and Badminton Tournament starting November 25th. Interested residents can sign up at the Warden Office before Friday.',
    targetAudience: 'All' as const,
    createdAt: '2026-11-12T09:30:00Z',
    createdBy: { name: 'Prof. Dr. Tariq Mansoor' },
  },
  {
    _id: 'ann-102',
    title: 'Biometric Turnstile Access & New Smart Resident Cards',
    content: 'Starting next Monday, the main gate turnstile system will be connected to your biometric RFID student card. Please verify your fingerprint at the IT counter by Friday afternoon.',
    targetAudience: 'Student' as const,
    createdAt: '2026-11-10T14:15:00Z',
    createdBy: { name: 'Prof. Dr. Tariq Mansoor' },
  },
  {
    _id: 'ann-103',
    title: 'Hostel AC Library 24/7 Extended Hours for Midterms',
    content: 'The 3rd floor digital reading hall and AC library will operate 24 hours a day with silent study protocols. Complimentary hot tea will be served at 11:30 PM in the mess corridor.',
    targetAudience: 'Student' as const,
    createdAt: '2026-11-08T10:00:00Z',
    createdBy: { name: 'Prof. Dr. Tariq Mansoor' },
  },
  {
    _id: 'ann-104',
    title: 'Mess Menu Revision & Weekly Nutrition Committee Meeting',
    content: 'Based on student feedback, grilled chicken and fresh fruits have been added to the dinner rotation. Suggestions for weekend breakfast items can be submitted through the portal.',
    targetAudience: 'All' as const,
    createdAt: '2026-11-05T16:45:00Z',
    createdBy: { name: 'Prof. Dr. Tariq Mansoor' },
  },
  {
    _id: 'ann-105',
    title: 'Quarterly Fire Safety Drill & Emergency Evacuation Briefing',
    content: 'Mandatory fire evacuation rehearsal scheduled for Saturday at 11:00 AM. Building alarms will test for 3 minutes. Please assemble at the south lawn near the sports pavilion.',
    targetAudience: 'All' as const,
    createdAt: '2026-11-01T08:00:00Z',
    createdBy: { name: 'Prof. Dr. Tariq Mansoor' },
  },
];

export const INITIAL_MESSAGES = [
  {
    _id: 'msg-101',
    name: 'Junaid Akhtar (Parent)',
    email: 'junaid.akhtar@yahoo.com',
    phone: '+92-300-8812390',
    message: 'My son is admitted to UET Peshawar for the upcoming Spring semester. I want to inquire about single room availability and security measures.',
    isRead: false,
    createdAt: '2026-11-12T11:20:00Z',
  },
  {
    _id: 'msg-102',
    name: 'Dr. Shahab Kundi',
    email: 'dr.shahab@kmu.edu.pk',
    phone: '+92-333-9123841',
    message: 'Could you confirm if the hostel has dedicated transport shuttle timings connecting Rahatabad to Hayatabad Medical Complex?',
    isRead: false,
    createdAt: '2026-11-11T15:40:00Z',
  },
  {
    _id: 'msg-103',
    name: 'Kamran Haider',
    email: 'kamran.haider@gmail.com',
    phone: '+92-345-9988221',
    message: 'Visiting Peshawar for a 3-month research residency at CECOS. Do you offer short-term student guest boarding?',
    isRead: true,
    createdAt: '2026-11-09T09:10:00Z',
  },
];

export const INITIAL_FACILITIES = [
  {
    _id: 'fac-101',
    name: 'Gigabit Fiber Mesh WiFi',
    description: 'High-speed 500 Mbps redundant fiber internet with dedicated access points across all corridors and study desks.',
    icon: 'Wifi',
    displayOrder: 1,
  },
  {
    _id: 'fac-102',
    name: '24/7 Green Solar & Generator Backup',
    description: 'Hybrid 100kVA solar inverter network backed by silent generators ensures zero downtime during city power outages.',
    icon: 'Zap',
    displayOrder: 2,
  },
  {
    _id: 'fac-103',
    name: 'Biometric Access & Smart Security',
    description: 'RFID turnstiles, 64 HD CCTV surveillance cameras, and trained professional security personnel on duty round the clock.',
    icon: 'Shield',
    displayOrder: 3,
  },
  {
    _id: 'fac-104',
    name: 'Hygienic Dining Hall & Mess',
    description: 'Food-grade certified commercial kitchen serving 3 nutritious, balanced meals prepared under strict hygiene standards.',
    icon: 'Utensils',
    displayOrder: 4,
  },
  {
    _id: 'fac-105',
    name: 'Automated Laundry & Ironing Hub',
    description: 'Heavy-duty industrial washing machines and steam press stations accessible to residents 6 days a week.',
    icon: 'RefreshCw',
    displayOrder: 5,
  },
  {
    _id: 'fac-106',
    name: 'Quiet AC Study Lounge & Library',
    description: 'Air-conditioned digital study hall equipped with power sockets, reference books, and fast research connections.',
    icon: 'BookOpen',
    displayOrder: 6,
  },
  {
    _id: 'fac-107',
    name: 'Multi-Stage RO Pure Drinking Water',
    description: 'Reverse Osmosis filtration plants installed on every floor with automated chiller units for clean hydration.',
    icon: 'Droplet',
    displayOrder: 7,
  },
  {
    _id: 'fac-108',
    name: 'Indoor Sports & Fitness Lounge',
    description: 'Table tennis arena, foosball, carrom boards, and calisthenics fitness stations for healthy student recreation.',
    icon: 'Heart',
    displayOrder: 8,
  },
];

export const INITIAL_HOSTEL_INFO = {
  description: "KP Youth University Hostel Peshawar is Khyber Pakhtunkhwa's premier student boarding facility, offering secure, hygienic, and modern living quarters designed to support academic and personal growth.",
  mission: 'To digitalize residential operations and offer a premium, hygienic, and secure boarding environment that supports students in achieving academic excellence.',
  vision: 'To build a state-of-the-art model for youth accommodation that resolves student lodging constraints through advanced features, green energy, and technology.',
  history: 'Founded in 2020 by the Directorate of Youth Affairs KP to support students coming from remote regions (Chitral, Swat, Waziristan, etc.) to study in Peshawar.',
  contact: { email: 'info@kpyouthhostel.com', phone: '+92-91-9216701', whatsApp: '+92-300-1234567' },
  location: {
    address: 'University Road, Zoo Street, Rahatabad, Peshawar, Khyber Pakhtunkhwa',
    googleMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.7247738202517!2d71.48003661148107!3d34.0124395723507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d9172bc9776f9d%3A0xc07a514d3f3f1e94!2sPeshawar%20Zoo!5e0!3m2!1sen!2spk!4v1719999999999!5m2!1sen!2spk',
    nearbyUniversities: [
      'University of Peshawar (UoP) — 1.2 km',
      'UET Peshawar — 1.5 km',
      'Khyber Medical University (KMU) — 2.0 km',
      'FAST-NUCES Peshawar — 3.2 km',
      'Islamia College Peshawar — 1.8 km',
      'Institute of Management Sciences (IMSciences) — 4.5 km',
    ],
  },
  warden: {
    name: 'Prof. Dr. Tariq Mansoor',
    qualification: 'Ph.D. in Higher Education Administration (Peshawar University)',
    experience: '14+ Years in Student Boarding & Academic Mentorship',
    message: 'Welcome to KP Youth Hostel. Our primary mission is to provide every student an environment that feels like home while instilling academic focus, modern security, and deep mutual respect.',
    bio: 'Prof. Dr. Tariq Mansoor has dedicated over a decade to youth welfare and higher education administration. He spearheads the digital transformation of hostel life in KP.',
    image: '/images/warden.jpg',
  },
  md: {
    name: 'Engr. Salman Durrani',
    vision: 'To build modern, digitized youth hostels across KP, promoting academic success and equal opportunity for every aspiring student.',
    message: 'By replacing archaic paper registers with an automated digital boarding portal, we ensure transparent fee tracking, streamlined room allocation, and rapid student assistance.',
    bio: 'Executive Director overseeing Youth Welfare Infrastructure in Khyber Pakhtunkhwa. He focuses on sustainable green architecture and modern digital platforms for students.',
    image: '/images/md.jpg',
  },
  system: {
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'notifications@kpyouthhostel.com',
    smtpPass: '••••••••••••',
    twilioSid: 'AC98234120984129',
    twilioToken: '••••••••••••',
    twilioPhone: 'whatsapp:+923001234567',
  },
};

// ─── Data Access & Persistence Helpers ───────────────────────────────────────

export const loadUsers = () => getStored('users', INITIAL_USERS);
export const saveUsers = (users: any[]) => setStored('users', users);

export const loadRooms = () => getStored('rooms', INITIAL_ROOMS);
export const saveRooms = (rooms: any[]) => setStored('rooms', rooms);

export const loadFees = () => getStored('fees', INITIAL_FEES);
export const saveFees = (fees: any[]) => setStored('fees', fees);

export const loadAnnouncements = () => getStored('announcements', INITIAL_ANNOUNCEMENTS);
export const saveAnnouncements = (ann: any[]) => setStored('announcements', ann);

export const loadMessages = () => getStored('messages', INITIAL_MESSAGES);
export const saveMessages = (msg: any[]) => setStored('messages', msg);

export const loadFacilities = () => getStored('facilities', INITIAL_FACILITIES);
export const saveFacilities = (fac: any[]) => setStored('facilities', fac);

export const loadHostelInfo = () => getStored('hostel_info', INITIAL_HOSTEL_INFO);
export const saveHostelInfo = (info: any) => setStored('hostel_info', info);

// Reset utility to restore fresh demo data anytime
export const resetDemoData = () => {
  saveUsers(INITIAL_USERS);
  saveRooms(INITIAL_ROOMS);
  saveFees(INITIAL_FEES);
  saveAnnouncements(INITIAL_ANNOUNCEMENTS);
  saveMessages(INITIAL_MESSAGES);
  saveFacilities(INITIAL_FACILITIES);
  saveHostelInfo(INITIAL_HOSTEL_INFO);
};

const delay = (ms = 120) => new Promise(r => setTimeout(r, ms));

// ─── Auth ────────────────────────────────────────────────────────────────────

export const mockLogin = async (email: string, password: string): Promise<{ success: boolean; user?: UserProfile; message?: string }> => {
  await delay(180);
  const users = loadUsers();
  const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
  if (!found) {
    return { success: false, message: 'Invalid email or password. Use demo credentials shown below.' };
  }
  const { password: _p, ...safeUser } = found;
  return { success: true, user: safeUser as unknown as UserProfile };
};

// ─── Public API Router ───────────────────────────────────────────────────────

export const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  await delay(120);
  const method = (options.method || 'GET').toUpperCase();
  const [path, queryString] = endpoint.split('?');
  const query = new URLSearchParams(queryString || '');
  let body: any = null;
  if (options.body && typeof options.body === 'string') {
    try { body = JSON.parse(options.body); } catch { body = {}; }
  }

  // 1. Dashboard Stats
  if (path === '/reports/stats' && method === 'GET') {
    const students = loadUsers().filter(u => u.role === 'Student');
    const rooms = loadRooms();
    const fees = loadFees();
    const messages = loadMessages();

    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'Active').length;
    const suspendedStudents = students.filter(s => s.status === 'Suspended').length;

    let totalSeats = 0;
    let occupiedSeats = 0;
    rooms.forEach(r => {
      totalSeats += r.capacity || 0;
      occupiedSeats += (r.residents || []).length;
    });
    const vacantSeats = Math.max(0, totalSeats - occupiedSeats);

    const collectedFees = fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + (f.amount || 0), 0);
    const pendingFees = fees.filter(f => f.status !== 'Paid').reduce((sum, f) => sum + (f.amount || 0), 0);
    const unreadMessages = messages.filter(m => !m.isRead).length;

    return {
      success: true,
      stats: {
        students: { total: totalStudents, active: activeStudents, suspended: suspendedStudents },
        rooms: {
          total: rooms.length,
          occupied: rooms.filter(r => (r.residents || []).length > 0).length,
          available: rooms.filter(r => (r.residents || []).length < r.capacity && r.status !== 'Maintenance').length,
          totalSeats,
          occupiedSeats,
          vacantSeats,
        },
        fees: { collected: collectedFees, pending: pendingFees },
        unreadMessages,
        recentActivities: [
          { type: 'payment', title: 'Fee Payment Verified', description: 'PKR 14,000 received from Zubair Khattak (Room 201)', time: '2 hours ago' },
          { type: 'admission', title: 'New Student Checked-In', description: 'Bilal Tariq allocated to Room 101 Bed 1', time: '5 hours ago' },
          { type: 'payment', title: 'Online Fee Deposit', description: 'PKR 9,500 received from Danyal Rehman via EasyPaisa', time: '1 day ago' },
          { type: 'admission', title: 'Room Allocation Updated', description: 'Hamza Farooq moved to Room 102', time: '2 days ago' },
        ],
        charts: {
          monthlyRevenue: [
            { month: 'Jun', revenue: 210000 },
            { month: 'Jul', revenue: 245000 },
            { month: 'Aug', revenue: 290000 },
            { month: 'Sep', revenue: 335000 },
            { month: 'Oct', revenue: 360000 },
            { month: 'Nov', revenue: 395000 },
          ],
          roomOccupancyStats: [
            { name: 'Occupied Beds', value: occupiedSeats },
            { name: 'Vacant Beds', value: vacantSeats },
          ],
          studentGrowth: [
            { month: 'Jun', students: 8 },
            { month: 'Jul', students: 10 },
            { month: 'Aug', students: 11 },
            { month: 'Sep', students: 12 },
            { month: 'Oct', students: 13 },
            { month: 'Nov', students: totalStudents },
          ],
        },
      },
    };
  }

  // 2. Students API
  if (path === '/students') {
    let list = loadUsers().filter(u => u.role === 'Student');

    if (method === 'GET') {
      const search = query.get('search')?.toLowerCase() || '';
      const status = query.get('status') || '';
      const feeStatus = query.get('feeStatus') || '';

      if (search) {
        list = list.filter(s =>
          s.name.toLowerCase().includes(search) ||
          s.email.toLowerCase().includes(search) ||
          (s.roomNumber && s.roomNumber.includes(search)) ||
          (s.studentId && s.studentId.toLowerCase().includes(search)) ||
          (s.university && s.university.toLowerCase().includes(search))
        );
      }
      if (status) list = list.filter(s => s.status === status);
      if (feeStatus) list = list.filter(s => s.feeStatus === feeStatus);

      const page = parseInt(query.get('page') || '1', 10);
      const limit = parseInt(query.get('limit') || '8', 10);
      const start = (page - 1) * limit;
      const paginated = list.slice(start, start + limit);

      return {
        success: true,
        students: paginated,
        pagination: { total: list.length, pages: Math.ceil(list.length / limit) || 1, page },
      };
    }

    if (method === 'POST') {
      const allUsers = loadUsers();
      const count = allUsers.filter(u => u.role === 'Student').length + 1;
      const newStudent = {
        ...body,
        _id: `student-${Date.now()}`,
        id: `student-${Date.now()}`,
        studentId: `KPH-2026-${1000 + count}`,
        role: 'Student',
        status: body.status || 'Active',
        feeStatus: body.feeStatus || 'Pending',
        defaultPassword: 'student123',
        password: 'student123',
        profilePhoto: '',
      };
      allUsers.push(newStudent);
      saveUsers(allUsers);
      return { success: true, student: newStudent };
    }
  }

  // Single Student Actions
  const studentMatch = path.match(/^\/students\/([^/]+)$/);
  if (studentMatch) {
    const studentId = studentMatch[1];
    const allUsers = loadUsers();

    if (method === 'GET') {
      const found = allUsers.find(u => u._id === studentId || u.id === studentId);
      if (!found) return { success: false, message: 'Student not found' };
      return { success: true, student: found };
    }

    if (method === 'PUT') {
      const idx = allUsers.findIndex(u => u._id === studentId || u.id === studentId);
      if (idx !== -1) {
        allUsers[idx] = { ...allUsers[idx], ...body };
        saveUsers(allUsers);
        return { success: true, student: allUsers[idx] };
      }
      return { success: false, message: 'Student not found' };
    }

    if (method === 'DELETE') {
      const filtered = allUsers.filter(u => u._id !== studentId && u.id !== studentId);
      saveUsers(filtered);
      return { success: true };
    }
  }

  const studentStatusMatch = path.match(/^\/students\/([^/]+)\/status$/);
  if (studentStatusMatch && method === 'PUT') {
    const studentId = studentStatusMatch[1];
    const allUsers = loadUsers();
    const idx = allUsers.findIndex(u => u._id === studentId || u.id === studentId);
    if (idx !== -1) {
      allUsers[idx].status = body.status;
      saveUsers(allUsers);
      return { success: true, student: allUsers[idx] };
    }
  }

  // 3. Rooms API
  if (path === '/rooms') {
    const rooms = loadRooms();
    if (method === 'GET') return { success: true, rooms };
    if (method === 'POST') {
      const newRoom = {
        _id: `room-${Date.now()}`,
        residents: [],
        capacity: Number(body.capacity) || 2,
        monthlyFee: Number(body.monthlyFee) || 12000,
        floor: Number(body.floor) || 1,
        status: body.status || 'Available',
        ...body,
      };
      rooms.push(newRoom);
      saveRooms(rooms);
      return { success: true, room: newRoom };
    }
  }

  const roomMatch = path.match(/^\/rooms\/([^/]+)$/);
  if (roomMatch) {
    const roomId = roomMatch[1];
    const rooms = loadRooms();

    if (method === 'PUT') {
      const idx = rooms.findIndex(r => r._id === roomId);
      if (idx !== -1) {
        rooms[idx] = { ...rooms[idx], ...body };
        saveRooms(rooms);
        return { success: true, room: rooms[idx] };
      }
    }

    if (method === 'DELETE') {
      const filtered = rooms.filter(r => r._id !== roomId);
      saveRooms(filtered);
      return { success: true };
    }
  }

  if (path === '/rooms/assign' && method === 'POST') {
    const { roomId, studentId } = body;
    const rooms = loadRooms();
    const users = loadUsers();
    const student = users.find(u => u._id === studentId || u.id === studentId);
    const room = rooms.find(r => r._id === roomId);

    if (student && room) {
      room.residents = room.residents || [];
      if (!room.residents.some(r => r._id === student._id)) {
        room.residents.push({ _id: student._id, name: student.name, email: student.email });
      }
      room.status = room.residents.length >= room.capacity ? 'Full' : 'Available';
      student.roomNumber = room.roomNumber;

      saveRooms(rooms);
      saveUsers(users);
      return { success: true, room };
    }
    return { success: false, message: 'Room or student not found' };
  }

  if (path === '/rooms/unassign' && method === 'POST') {
    const { roomId, studentId } = body;
    const rooms = loadRooms();
    const users = loadUsers();
    const room = rooms.find(r => r._id === roomId);
    const student = users.find(u => u._id === studentId || u.id === studentId);

    if (room) {
      room.residents = (room.residents || []).filter(r => r._id !== studentId);
      room.status = room.residents.length >= room.capacity ? 'Full' : 'Available';
      if (student) student.roomNumber = '';

      saveRooms(rooms);
      saveUsers(users);
      return { success: true, room };
    }
  }

  // 4. Fees API
  if (path === '/fees/all' && method === 'GET') {
    let fees = loadFees();
    const search = query.get('search')?.toLowerCase() || '';
    const status = query.get('status') || '';
    const month = query.get('month') || '';
    const year = query.get('year') || '';

    if (search) {
      fees = fees.filter(f =>
        f.studentId?.name?.toLowerCase().includes(search) ||
        f.roomNumber?.includes(search) ||
        f.transactionId?.toLowerCase().includes(search)
      );
    }
    if (status) fees = fees.filter(f => f.status === status);
    if (month) fees = fees.filter(f => f.month === month);
    if (year) fees = fees.filter(f => f.year?.toString() === year);

    return { success: true, invoices: fees };
  }

  const studentFeeMatch = path.match(/^\/fees\/student\/([^/]+)$/);
  if (studentFeeMatch && method === 'GET') {
    const studentId = studentFeeMatch[1];
    const fees = loadFees();
    const studentInvoices = fees.filter(f => f.student === studentId || f.studentId?._id === studentId);
    return { success: true, invoices: studentInvoices };
  }

  const feePayMatch = path.match(/^\/fees\/([^/]+)\/pay$/);
  if (feePayMatch && method === 'POST') {
    const feeId = feePayMatch[1];
    const fees = loadFees();
    const idx = fees.findIndex(f => f._id === feeId);
    if (idx !== -1) {
      fees[idx] = {
        ...fees[idx],
        status: 'Paid',
        paymentDate: body.paymentDate || new Date().toISOString().split('T')[0],
        paymentMethod: body.paymentMethod || 'Online Transfer',
        transactionId: body.transactionId || `TX-${Math.floor(10000000 + Math.random() * 90000000)}`,
      };
      saveFees(fees);

      // Also update student feeStatus if all are paid
      const studentId = fees[idx].student;
      const allUsers = loadUsers();
      const sIdx = allUsers.findIndex(u => u._id === studentId || u.id === studentId);
      if (sIdx !== -1) {
        allUsers[sIdx].feeStatus = 'Paid';
        saveUsers(allUsers);
      }

      return { success: true, invoice: fees[idx] };
    }
    return { success: false, message: 'Invoice not found' };
  }

  if (path === '/fees/generate-monthly' && method === 'POST') {
    const { month, year } = body;
    const students = loadUsers().filter(u => u.role === 'Student' && u.status === 'Active' && u.roomNumber);
    const rooms = loadRooms();
    const fees = loadFees();
    let generatedCount = 0;

    students.forEach(s => {
      const alreadyHas = fees.some(f => (f.student === s._id || f.student === s.id) && f.month === month && f.year === Number(year));
      if (!alreadyHas) {
        const room = rooms.find(r => r.roomNumber === s.roomNumber);
        const amount = room?.monthlyFee || 9500;
        fees.unshift({
          _id: `fee-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          student: s._id || s.id,
          studentId: { _id: s._id || s.id, name: s.name, email: s.email, studentId: s.studentId || 'KPH-STUDENT' },
          roomNumber: s.roomNumber,
          amount,
          month,
          year: Number(year),
          dueDate: `${year}-${String(new Date().getMonth() + 1).padStart(2, '0')}-10`,
          status: 'Unpaid' as const,
        });
        generatedCount++;
      }
    });

    saveFees(fees);
    return { success: true, count: generatedCount, message: `Successfully generated ${generatedCount} invoices for ${month} ${year}.` };
  }

  // 5. Announcements API
  if (path === '/announcements') {
    const list = loadAnnouncements();
    if (method === 'GET') return { success: true, announcements: list };
    if (method === 'POST') {
      const newAnn = {
        _id: `ann-${Date.now()}`,
        title: body.title,
        content: body.content,
        targetAudience: body.targetAudience || 'All',
        createdAt: new Date().toISOString(),
        createdBy: { name: 'Prof. Dr. Tariq Mansoor' },
      };
      list.unshift(newAnn);
      saveAnnouncements(list);
      return { success: true, announcement: newAnn };
    }
  }

  const annMatch = path.match(/^\/announcements\/([^/]+)$/);
  if (annMatch && method === 'DELETE') {
    const id = annMatch[1];
    const list = loadAnnouncements().filter(a => a._id !== id);
    saveAnnouncements(list);
    return { success: true };
  }

  // 6. Messages / Inquiries API
  if (path === '/messages') {
    const msgs = loadMessages();
    if (method === 'GET') return { success: true, messages: msgs };
    if (method === 'POST') {
      const newMsg = {
        _id: `msg-${Date.now()}`,
        name: body.name || 'Anonymous',
        email: body.email || '',
        phone: body.phone || '',
        message: body.message || '',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      msgs.unshift(newMsg);
      saveMessages(msgs);
      return { success: true, message: newMsg };
    }
  }

  const msgMatch = path.match(/^\/messages\/([^/]+)$/);
  if (msgMatch && method === 'DELETE') {
    const id = msgMatch[1];
    const msgs = loadMessages().filter(m => m._id !== id);
    saveMessages(msgs);
    return { success: true };
  }

  // 7. Facilities API
  if (path === '/facilities') {
    const facs = loadFacilities();
    if (method === 'GET') return { success: true, facilities: facs };
    if (method === 'POST') {
      const newFac = { _id: `fac-${Date.now()}`, ...body };
      facs.push(newFac);
      saveFacilities(facs);
      return { success: true, facility: newFac };
    }
  }

  // 8. Hostel Info & Settings API
  if (path === '/hostel') {
    const info = loadHostelInfo();
    if (method === 'GET') return { success: true, hostelInfo: info };
    if (method === 'PUT') {
      const updated = { ...info, ...body };
      saveHostelInfo(updated);
      return { success: true, hostelInfo: updated };
    }
  }

  // 9. Notifications API
  if (path === '/notifications' && method === 'GET') {
    return {
      success: true,
      notifications: [
        { _id: 'notif-1', title: 'Monthly Fee Due', message: 'November 2026 boarding invoice has been posted to your dashboard.', isRead: false, createdAt: '2026-11-01T08:00:00Z' },
        { _id: 'notif-2', title: 'Wi-Fi Speed Upgrade', message: 'Bandwidth increased to 500 Mbps across all hostel floors.', isRead: true, createdAt: '2026-10-25T12:00:00Z' },
        { _id: 'notif-3', title: 'Library Extended Hours', message: 'Digital Study Room is open 24/7 with tea served at night.', isRead: true, createdAt: '2026-10-18T16:00:00Z' },
      ],
    };
  }

  // Fallback
  return { success: true, data: null };
};

export default apiRequest;
