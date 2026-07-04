import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'KP Youth University Hostel Peshawar',
  description: 'Digital management system for KP Youth University Hostel, providing secure accommodation, fee summaries, announcements, and Warden alerts.',
  keywords: 'KP Hostel, University Hostel, Student Boarding, Peshawar, Youth Hostel, Khyber Pakhtunkhwa',
  authors: [{ name: 'KP Youth Hostel Management' }]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
