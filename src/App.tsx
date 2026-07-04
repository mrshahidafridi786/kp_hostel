import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import AdminLayout from '@/layouts/AdminLayout';
import StudentLayout from '@/layouts/StudentLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminStudents from '@/pages/admin/Students';
import AdminRooms from '@/pages/admin/Rooms';
import AdminFees from '@/pages/admin/Fees';
import AdminAnnouncements from '@/pages/admin/Announcements';
import AdminSettings from '@/pages/admin/Settings';
import StudentDashboard from '@/pages/student/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/auth/login" element={<Login />} />

            {/* Admin Portal */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="rooms" element={<AdminRooms />} />
              <Route path="fees" element={<AdminFees />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Student Portal */}
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
