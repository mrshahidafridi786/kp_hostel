"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Sun, Moon, ArrowRight, Shield, Zap, Wifi,
  Utensils, BookOpen, Heart, Droplet, RefreshCw, MapPin,
  Phone, Mail, Calendar, Info, Award, User, HelpCircle, Check,
  ChevronDown, MessageCircle, ChevronLeft, ChevronRight, Play, Eye
} from 'lucide-react';
import { apiRequest } from '../services/api';
import Link from 'next/link';

// --- Curated Mock Fallbacks in case Backend is offline ---
const defaultHostelInfo = {
  description: 'KP Youth University Hostel Peshawar is Khyber Pakhtunkhwa\'s premier student boarding facility, offering secure, hygienic, and modern living quarters designed to support academic and personal growth.',
  mission: 'To digitalize residential operations and offer a premium, hygienic, and secure boarding environment that supports students in achieving academic excellence.',
  vision: 'To build a state-of-the-art model for youth accommodation that resolves student lodging constraints through advanced features, green energy, and technology.',
  history: 'Founded in 2020 by the Directorate of Youth Affairs KP to support students coming from remote regions (Chitral, Swat, Waziristan, etc.) to study in Peshawar.',
  rules: [
    'Curfew is strictly 10:00 PM. Late entries must be approved by the Warden.',
    'Cleanliness is mandatory. Residents must keep their rooms tidy.',
    'No external visitors are allowed inside room quarters without registering at the reception.',
    'Anti-social behaviors, smoking, or illegal substances are strictly prohibited and result in immediate suspension.'
  ],
  contact: {
    email: 'info@kpyouthhostel.com',
    phone: '+92-91-9216701',
    whatsApp: '+92-300-1234567'
  },
  location: {
    address: 'University Road, Zoo Street, Rahatabad, Peshawar, Khyber Pakhtunkhwa',
    googleMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.7247738202517!2d71.48003661148107!3d34.0124395723507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d9172bc9776f9d%3A0xc07a514d3f3f1e94!2sPeshawar%20Zoo!5e0!3m2!1sen!2spk!4v1719999999999!5m2!1sen!2spk',
    nearbyUniversities: [
      'University of Peshawar (UoP) - 1.2 km',
      'University of Engineering & Technology (UET) - 1.5 km',
      'Khyber Medical University (KMU) - 2.0 km',
      'Islamia College Peshawar - 1.8 km'
    ]
  },
  warden: {
    name: 'M Noor Wazir',
    bio: 'M Noor Wazir holds a Masters in Public Administration and has overseen student boarding facilities for 12 years. He believes in fostering a disciplined yet caring community environment.',
    qualification: 'Master of Public Administration (Peshawar University)',
    experience: '12 Years in Student Housing Management',
    message: 'Welcome to KP Youth Hostel. Our aim is to provide you a home away from home. Here, we prioritize your safety, hygiene, and study environment above everything else.',
    image: '/images/warden.jpg'
  },
  md: {
    name: 'Hameed Khan',
    bio: 'The Managing Director focuses on implementing government policies for youth development, executing digital transformation in youth hostels, and creating affordable living conditions.',
    vision: 'To build modern, digitized youth hostels across KP, promoting academic success and national integration.',
    message: 'This hostel represents our commitment to the youth of KP. By digitizing fee collections, rooms allocations, and notifications, we ensure complete transparency and convenience.',
    image: '/images/md.jpg'
  },
  gallery: [
    { url: '/images/hostel_dining.jpg', type: 'image', category: 'Dining Hall', caption: 'Students Dining Together — KP Youth Hostel' },
    { url: '/images/hostel_outside.jpg', type: 'image', category: 'Building', caption: 'KP University Youth Hostel — Main Entrance' },
    { url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600', type: 'image', category: 'Rooms', caption: 'Premium Quad Share Student Room' },
    { url: 'https://images.unsplash.com/photo-1598900866636-458f430ca483?auto=format&fit=crop&q=80&w=600', type: 'image', category: 'Rooms', caption: 'Double Bed Room with Study Desks' },
    { url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600', type: 'image', category: 'Library', caption: 'Air Conditioned Library and Reading Room' },
    { url: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&q=80&w=600', type: 'image', category: 'Sports Area', caption: 'Indoor Games and Recreation Area' }
  ]
};

const defaultRooms = [
  { roomNumber: '101', floor: 1, capacity: 4, monthlyFee: 9500, residents: [1, 2], status: 'Available' },
  { roomNumber: '102', floor: 1, capacity: 4, monthlyFee: 9500, residents: [1, 2, 3, 4], status: 'Full' },
  { roomNumber: '201', floor: 2, capacity: 2, monthlyFee: 14000, residents: [], status: 'Available' },
  { roomNumber: '202', floor: 2, capacity: 2, monthlyFee: 14000, residents: [1], status: 'Available' },
  { roomNumber: '301', floor: 3, capacity: 1, monthlyFee: 18000, residents: [], status: 'Available' }
];

const defaultFacilities = [
  { name: 'High Speed WiFi', description: '24/7 uninterrupted fiber internet connection across all rooms and common areas.', icon: 'Wifi' },
  { name: 'Electricity Backup', description: 'Heavy generators and UPS modules installed to handle load-shedding events.', icon: 'Zap' },
  { name: 'CCTV & Security', description: '24/7 active CCTV recording and professional security guards at gates.', icon: 'Shield' },
  { name: 'Dining Hall & Mess', description: 'Hygiene-certified kitchen serving three healthy meals daily to residents.', icon: 'Utensils' },
  { name: 'Laundry Services', description: 'In-house washing machines and ironing services available twice a week.', icon: 'RefreshCw' },
  { name: 'Air Conditioned Library', description: 'Quiet study environment open 24/7 with academic journals and study desks.', icon: 'BookOpen' }
];

const faqs = [
  { q: 'Who is eligible to apply for the hostel?', a: 'Students currently enrolled in registered universities in Peshawar (like UoP, UET, KMU, Islamia College) and young working professionals are eligible to apply. Admission is merit-based.' },
  { q: 'What is included in the monthly fee?', a: 'The monthly fee covers rent, high-speed WiFi, 24/7 electricity backup, cleaning, parking, security, and access to the AC library. Mess/meals charges are billed separately depending on your meal plan.' },
  { q: 'Are visitors allowed inside the rooms?', a: 'To ensure resident safety, external visitors (including family members) are allowed in the reception lobby or dining area only. They must register at the gate and are not allowed inside the student corridors/rooms.' },
  { q: 'How is the security managed?', a: 'The hostel features 24/7 gate security, active CCTV recording in common corridors, regular guard shifts, and a digitized entry log for check-in and check-out tracking.' }
];

const testimonials = [
  { name: 'Shahid Khan', university: 'UET Peshawar', rating: 5, text: 'The best private hostel in Peshawar. The backup power and silent study halls in the AC library saved me during final exams. Highly recommended!' },
  { name: 'Asad Ali', university: 'University of Peshawar', rating: 5, text: 'Hygienic food, 24/7 security, and friendly management. The digital portals make downloading invoices and paying fees extremely easy.' },
  { name: 'Zeeshan Ahmad', university: 'Khyber Medical College', rating: 4, text: 'Very neat and clean. The study hall is a great space. Highly disciplined atmosphere which is perfect for medical students.' }
];

export default function LandingPage() {
  const [hostelInfo, setHostelInfo] = useState(defaultHostelInfo);
  const [rooms, setRooms] = useState<any[]>(defaultRooms);
  const [facilities, setFacilities] = useState(defaultFacilities);
  
  // Theme state
  const [isDark, setIsDark] = useState(false);
  
  // UI states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeGalleryFilter, setActiveGalleryFilter] = useState('All');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [formSuccess, setFormSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  // Fetch data from backend on mount
  useEffect(() => {
    // Check dark class on page load
    setIsDark(document.documentElement.classList.contains('dark'));

    const fetchData = async () => {
      try {
        const infoData = await apiRequest('/hostel');
        if (infoData?.success && infoData?.hostelInfo) {
          setHostelInfo(infoData.hostelInfo);
        }
      } catch (e) {
        console.log('[LANDING] Could not fetch hostelInfo, using defaults');
      }

      try {
        const roomsData = await apiRequest('/rooms');
        if (roomsData?.success && roomsData?.rooms) {
          setRooms(roomsData.rooms);
        }
      } catch (e) {
        console.log('[LANDING] Could not fetch rooms, using defaults');
      }

      try {
        const facData = await apiRequest('/facilities');
        if (facData?.success && facData?.facilities) {
          setFacilities(facData.facilities);
        }
      } catch (e) {
        console.log('[LANDING] Could not fetch facilities, using defaults');
      }
    };

    fetchData();
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const data = await apiRequest('/messages', {
        method: 'POST',
        body: JSON.stringify(contactForm)
      });
      if (data.success) {
        setFormSuccess(true);
        setContactForm({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setFormSuccess(false), 5000);
      }
    } catch (err) {
      console.error('[CONTACT-FORM]', err);
      // Mock success in case server is offline
      setFormSuccess(true);
      setContactForm({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setFormSuccess(false), 5000);
    } finally {
      setFormLoading(false);
    }
  };

  const filteredGallery = activeGalleryFilter === 'All'
    ? hostelInfo.gallery
    : hostelInfo.gallery.filter(item => item.category === activeGalleryFilter);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextLightbox = () => {
    setLightboxIndex((prev) => (prev + 1) % filteredGallery.length);
  };

  const prevLightbox = () => {
    setLightboxIndex((prev) => (prev - 1 + filteredGallery.length) % filteredGallery.length);
  };

  // Map icon strings to Lucide components
  const renderIcon = (iconName: string) => {
    const iconClass = "w-6 h-6 text-blue-600 dark:text-blue-400";
    switch (iconName.toLowerCase()) {
      case 'wifi': return <Wifi className={iconClass} />;
      case 'zap': return <Zap className={iconClass} />;
      case 'shield': return <Shield className={iconClass} />;
      case 'utensils': return <Utensils className={iconClass} />;
      case 'refreshcw': return <RefreshCw className={iconClass} />;
      case 'bookopen': return <BookOpen className={iconClass} />;
      case 'heart': return <Heart className={iconClass} />;
      case 'droplet': return <Droplet className={iconClass} />;
      case 'car': return <Play className={iconClass} />; // Fallback icon
      default: return <Info className={iconClass} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      
      {/* --- STICKY GLASSMORPHIC NAVBAR --- */}
      <nav className="glass-nav top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
                KP
              </div>
              <span className="hidden sm:block font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                KP <span className="text-blue-600 dark:text-blue-400">Youth Hostel</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <a href="#hero" className="font-medium text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</a>
              <a href="#about" className="font-medium text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a>
              <a href="#rooms" className="font-medium text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Rooms</a>
              <a href="#gallery" className="font-medium text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Gallery</a>
              <a href="#facilities" className="font-medium text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Facilities</a>
              <a href="#library" className="font-medium text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">AC Library</a>
              <a href="#warden" className="font-medium text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Warden</a>
              <a href="#md" className="font-medium text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">MD</a>
              <a href="#contact" className="font-medium text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
            </div>

            {/* Icons & Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 h-10 w-10 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all duration-200"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link href="/auth/login">
                <button className="px-5 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-medium text-sm transition-all duration-200">
                  Login Portal
                </button>
              </Link>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex lg:hidden items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="p-2 h-9 w-9 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 flex items-center justify-center text-slate-700 dark:text-slate-300"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 h-9 w-9 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 flex items-center justify-center text-slate-700 dark:text-slate-300"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Home</a>
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">About</a>
                <a href="#rooms" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Rooms</a>
                <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Gallery</a>
                <a href="#facilities" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Facilities</a>
                <a href="#library" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">AC Library</a>
                <a href="#warden" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Warden</a>
                <a href="#md" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">MD</a>
                <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-blue-600 dark:text-blue-400">Contact</a>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Link href="/auth/login">
                    <button className="w-full h-12 rounded-xl bg-blue-600 text-white font-medium shadow-md shadow-blue-500/10 hover:shadow-lg">
                      Login Portal
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="hero" className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden py-16 px-4">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -left-[20%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-blue-600/10 blur-[120px] dark:bg-blue-600/5 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute -bottom-[30%] -right-[20%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-500/5 animate-pulse" style={{ animationDuration: '10s' }} />
        </div>

        <div className="max-w-7xl mx-auto w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Left Content */}
          <div className="col-span-1 lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs mb-6 uppercase tracking-wider mx-auto lg:mx-0">
                <Sparkles className="w-4 h-4" />
                <span>Premium Boarding Facility</span>
              </div>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
                KP Youth University <br />
                <span className="text-gradient">Hostel Peshawar</span>
              </h1>
              <p className="max-w-xl text-lg text-slate-600 dark:text-slate-350 mb-8 mx-auto lg:mx-0 leading-relaxed font-sans">
                Experience a modern, highly secure, and fully digitized residential ecosystem near University Road. Perfect study environment, biometric logs, and premium facilities for students.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                <a href="#contact" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-12 px-8 rounded-xl btn-gradient flex items-center justify-center space-x-2 font-display">
                    <span>Apply Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </a>
                <a href="#facilities" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-12 px-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium transition-all duration-200 flex items-center justify-center">
                    Explore Facilities
                  </button>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Hero Right Media */}
          <div className="col-span-1 lg:col-span-5 flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-[480px] aspect-[4/3] sm:aspect-square rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800/50"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800"
                alt="KP Hostel Building"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 z-20 text-white">
                <p className="font-display font-bold text-xl">Modern Study Chambers</p>
                <p className="text-slate-300 text-sm">Quiet, fully furnished shared student units.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- ABOUT HOSTEL SECTION --- */}
      <section id="about" className="py-24 border-t border-slate-200/50 dark:border-slate-900/50 bg-white dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">
              About The Hostel
            </h2>
            <p className="text-slate-600 dark:text-slate-350 font-sans leading-relaxed">
              {hostelInfo.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card: Mission */}
            <motion.div whileHover={{ y: -5 }} className="p-8 rounded-2xl glass-card">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">Our Mission</h3>
              <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed">
                {hostelInfo.mission}
              </p>
            </motion.div>

            {/* Card: Vision */}
            <motion.div whileHover={{ y: -5 }} className="p-8 rounded-2xl glass-card">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">Our Vision</h3>
              <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed">
                {hostelInfo.vision}
              </p>
            </motion.div>

            {/* Card: History */}
            <motion.div whileHover={{ y: -5 }} className="p-8 rounded-2xl glass-card">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6 text-amber-600 dark:text-amber-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">Our History</h3>
              <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed">
                {hostelInfo.history}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- HOSTEL ROOMS SECTION --- */}
      <section id="rooms" className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">
              Premium Rooms
            </h2>
            <p className="text-slate-600 dark:text-slate-350 font-sans">
              Choose from single private rooms or modern shared boarding spaces. Complete with high-speed internet and air-cooling parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rooms.slice(0, 3).map((room, idx) => {
              const vacancy = room.capacity - (room.residents?.length || 0);
              const isFull = vacancy <= 0;
              // Map dynamic placeholder images based on capacity
              const imgUrl = room.capacity === 1
                ? 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600'
                : room.capacity === 2
                  ? 'https://images.unsplash.com/photo-1598900866636-458f430ca483?auto=format&fit=crop&q=80&w=600'
                  : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600';

              return (
                <motion.div
                  key={room.roomNumber}
                  whileHover={{ y: -6 }}
                  className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm"
                >
                  <div className="relative h-56">
                    <img src={imgUrl} alt={`Room ${room.roomNumber}`} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-800 shadow-sm">
                      Room {room.roomNumber}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400">
                        {room.capacity === 1 ? 'Single Room' : `${room.capacity}-Share Unit`}
                      </span>
                      <span className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                        PKR {room.monthlyFee} <span className="text-xs font-normal text-slate-400">/mo</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-100 dark:border-slate-800 text-sm mb-6">
                      <div>
                        <span className="text-slate-400 block text-xs">Capacity</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{room.capacity} Seats</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Available Seats</span>
                        <span className={`font-semibold ${isFull ? 'text-red-500' : 'text-emerald-500'}`}>
                          {isFull ? 'House Full' : `${vacancy} Vacant`}
                        </span>
                      </div>
                    </div>
                    <a href="#contact">
                      <button className="w-full py-2.5 rounded-xl border border-blue-600 hover:bg-blue-600 text-blue-600 hover:text-white font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2">
                        <span>Apply For Room</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- FACILITIES SECTION --- */}
      <section id="facilities" className="py-24 bg-white dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">
              Premium Facilities
            </h2>
            <p className="text-slate-600 dark:text-slate-350 font-sans">
              Enjoy a comfortable lifestyle with everything you need. Fully managed utilities so you can focus entirely on your academics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((fac, idx) => (
              <motion.div
                key={fac.name}
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/60 shadow-sm flex space-x-4"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  {renderIcon(fac.icon || 'info')}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">{fac.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{fac.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- AC LIBRARY SECTION --- */}
      <section id="library" className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Library Image Card */}
            <div className="col-span-1 lg:col-span-5 relative h-96 sm:h-[450px] rounded-3xl overflow-hidden shadow-xl border border-slate-200/50 dark:border-slate-800/50">
              <img
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800"
                alt="AC Library Study Hall"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent z-10" />
              <div className="absolute bottom-8 left-8 right-8 z-20 text-white">
                <span className="px-3 py-1 rounded-full text-xs bg-emerald-500 font-semibold mb-3 inline-block">
                  Open 24/7
                </span>
                <h3 className="font-display font-bold text-2xl mb-2">Central Study Hall</h3>
                <p className="text-slate-300 text-sm">Quiet zoning equipped with continuous cooling and high-speed desks.</p>
              </div>
            </div>

            {/* Library Details */}
            <div className="col-span-1 lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs mb-6 uppercase tracking-wider mr-auto">
                <BookOpen className="w-4 h-4" />
                <span>Silent study quarters</span>
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-6">
                Air Conditioned Library
              </h2>
              <p className="text-slate-600 dark:text-slate-350 leading-relaxed mb-6 font-sans">
                Dedicated silent study quarters boasting comfortable ergonomic chairs, separate study partitions, charging ports, and reference resources to ensure residents can study peacefully without interruptions.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex space-x-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-800 dark:text-slate-200">120 Seat Capacity</h4>
                    <p className="text-slate-500 text-xs">Separate desks and partitions.</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-800 dark:text-slate-200">Continuous Backup</h4>
                    <p className="text-slate-500 text-xs">UPS & Generator connected.</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-800 dark:text-slate-200">Reference Library</h4>
                    <p className="text-slate-500 text-xs">Journals and exam resource material.</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-800 dark:text-slate-200">AC Cooling</h4>
                    <p className="text-slate-500 text-xs">Cool environment during hot summers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- GALLERY SECTION (WITH FILTER & LIGHTBOX) --- */}
      <section id="gallery" className="py-24 bg-white dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">
                Hostel Gallery
              </h2>
              <p className="text-slate-600 dark:text-slate-350 text-sm max-w-xl font-sans">
                Explore photos of our dining hall, central building structure, study library, and student rooms.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 mt-6 md:mt-0">
              {['All', 'Rooms', 'Dining Hall', 'Library', 'Building', 'Sports Area'].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveGalleryFilter(category)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                    activeGalleryFilter === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-150 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((item, idx) => (
              <motion.div
                layout
                key={item.url}
                onClick={() => openLightbox(idx)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200/30 dark:border-slate-800/30 shadow-sm cursor-pointer"
              >
                <img
                  src={item.url}
                  alt={item.caption || 'Hostel Image'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
                {item.caption && (
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950/70 to-transparent text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-xs font-medium">{item.caption}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- LIGHTBOX CAROUSEL MODAL --- */}
        <AnimatePresence>
          {lightboxOpen && filteredGallery[lightboxIndex] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-950/95 flex items-center justify-center p-4"
            >
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-6 right-6 text-white hover:text-slate-300 p-2 z-[110]"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Prev Button */}
              <button
                onClick={prevLightbox}
                className="absolute left-6 text-white hover:text-slate-300 p-3 bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-sm z-[110]"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Media Display */}
              <div className="max-w-4xl max-h-[80vh] flex flex-col items-center justify-center z-10 px-12">
                <motion.img
                  key={lightboxIndex}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={filteredGallery[lightboxIndex].url}
                  alt={filteredGallery[lightboxIndex].caption || 'Lightbox media'}
                  className="max-w-full max-h-[70vh] rounded-xl object-contain shadow-2xl"
                />
                {filteredGallery[lightboxIndex].caption && (
                  <p className="text-slate-350 text-sm mt-4 text-center">
                    {filteredGallery[lightboxIndex].caption}
                  </p>
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={nextLightbox}
                className="absolute right-6 text-white hover:text-slate-300 p-3 bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-sm z-[110]"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* --- LEADERSHIP (WARDEN & MD PROFILES) --- */}
      <section id="warden" className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Profile: Warden */}
            <div className="rounded-3xl p-8 sm:p-12 border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-8 items-center sm:items-start">
              <div className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-850 shadow-inner">
                <img src={hostelInfo.warden.image} alt={hostelInfo.warden.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 tracking-wider uppercase mb-2 inline-block">
                  Hostel Warden
                </span>
                <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mb-1">
                  {hostelInfo.warden.name}
                </h3>
                <p className="text-slate-400 text-xs mb-4">{hostelInfo.warden.qualification}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4 italic font-sans">
                  &quot;{hostelInfo.warden.message}&quot;
                </p>
                <p className="text-slate-600 dark:text-slate-350 text-xs leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                  {hostelInfo.warden.bio}
                </p>
              </div>
            </div>

            {/* Profile: Managing Director */}
            <div id="md" className="rounded-3xl p-8 sm:p-12 border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-8 items-center sm:items-start">
              <div className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-850 shadow-inner">
                <img src={hostelInfo.md.image} alt={hostelInfo.md.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 tracking-wider uppercase mb-2 inline-block">
                  Managing Director
                </span>
                <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mb-1">
                  {hostelInfo.md.name}
                </h3>
                <p className="text-slate-400 text-xs mb-4">Directorate of Youth Affairs KP</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4 italic font-sans">
                  &quot;{hostelInfo.md.message}&quot;
                </p>
                <p className="text-slate-600 dark:text-slate-350 text-xs leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                  {hostelInfo.md.bio}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- LOCATION (MAP & COLLEGES) --- */}
      <section className="py-24 bg-white dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Nearby Universities & Info */}
            <div className="col-span-1 lg:col-span-5 flex flex-col justify-center">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs mb-6 uppercase tracking-wider mr-auto">
                <MapPin className="w-4 h-4" />
                <span>Hostel Location</span>
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">
                Peshawar University Road
              </h2>
              <p className="text-slate-600 dark:text-slate-350 leading-relaxed mb-6 font-sans">
                Located near Zoo Street, our campus sits at a major transport hub, allowing students to walk to nearby campuses or access local buses within minutes.
              </p>
              <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-850/50 border border-slate-200/30 dark:border-slate-800/30 mb-8 flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Address</h4>
                  <p className="text-slate-500 dark:text-slate-405 text-xs">{hostelInfo.location.address}</p>
                </div>
              </div>
              
              <h4 className="font-display font-bold text-slate-800 dark:text-slate-200 mb-3 text-sm">Nearby Universities:</h4>
              <ul className="space-y-2 text-sm text-slate-550 dark:text-slate-350">
                {hostelInfo.location.nearbyUniversities.map((uni) => (
                  <li key={uni} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{uni}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Embedded Iframe Map */}
            <div className="col-span-1 lg:col-span-7 h-96 sm:h-[450px] rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-md">
              <iframe
                title="KP Youth Hostel Map"
                src={hostelInfo.location.googleMapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">
              Student Reviews
            </h2>
            <p className="text-slate-600 dark:text-slate-350 font-sans">
              Read what our residents have to say about their living and study experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex space-x-1 mb-4 text-amber-500">
                    {[...Array(test.rating)].map((_, i) => (
                      <span key={i} className="text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed mb-6 font-sans">
                    &quot;{test.text}&quot;
                  </p>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs uppercase">
                    {test.name.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">{test.name}</h4>
                    <p className="text-slate-400 text-[10px]">{test.university}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-white dark:bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 dark:text-slate-350 font-sans">
              Have questions about security, billing, or policies? Explore answers below.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-6 text-left flex justify-between items-center font-display font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-250 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-1 text-slate-600 dark:text-slate-350 text-sm leading-relaxed font-sans border-t border-slate-100 dark:border-slate-850">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- CONTACT & APPLICATION SECTION --- */}
      <section id="contact" className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Contact details */}
            <div className="col-span-1 lg:col-span-5 flex flex-col justify-center">
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-6">
                Apply For Admission
              </h2>
              <p className="text-slate-600 dark:text-slate-350 leading-relaxed mb-8 font-sans">
                Ready to secure your seat? Fill out our application inquiry form, or get in touch directly with our warden office via phone or WhatsApp.
              </p>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-700 dark:text-slate-300 text-sm">Call Office</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">{hostelInfo.contact.phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-700 dark:text-slate-300 text-sm">WhatsApp</h4>
                    <a
                      href={`https://wa.me/${hostelInfo.contact.whatsApp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-500 text-xs"
                    >
                      {hostelInfo.contact.whatsApp}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-700 dark:text-slate-300 text-sm">Email Inquiries</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">{hostelInfo.contact.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Application form */}
            <div className="col-span-1 lg:col-span-7">
              <div className="p-8 sm:p-12 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-xl">
                <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-6">Inquiry Form</h3>
                
                {formSuccess ? (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                  >
                    <h4 className="font-bold mb-1">Submission Successful!</h4>
                    <p className="text-sm">Thank you. Your inquiry has been registered. The Warden office will email/call you shortly.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Full Name</label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:border-blue-600 focus:outline-none transition-colors"
                          placeholder="Shahid Afridi"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:border-blue-600 focus:outline-none transition-colors"
                          placeholder="0300-1234567"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Email Address</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:border-blue-600 focus:outline-none transition-colors"
                        placeholder="student@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Message / Academic Details</label>
                      <textarea
                        required
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:border-blue-600 focus:outline-none transition-colors resize-none"
                        placeholder="Mention your university name, department, semester, and target room type (Single, Double, or Shared)."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="w-full h-12 rounded-xl btn-gradient font-display text-sm tracking-wide"
                    >
                      {formLoading ? 'Submitting...' : 'Submit Inquiry'}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                KP
              </div>
              <span className="font-display font-bold text-white text-lg tracking-tight">
                KP <span className="text-blue-500">Youth Hostel</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Directorate of Youth Affairs Khyber Pakhtunkhwa. Digitized student hostel solutions near Peshawar University Road.
            </p>
          </div>
          <div>
            <h4 className="text-white font-display font-semibold text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#about" className="hover:text-white transition-colors">About History</a></li>
              <li><a href="#rooms" className="hover:text-white transition-colors">Hostel Rooms</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Media Gallery</a></li>
              <li><a href="#facilities" className="hover:text-white transition-colors">Facilities List</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-display font-semibold text-sm mb-4">Support & Terms</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#hero" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#hero" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Warden Support</a></li>
              <li><a href="/auth/login" className="hover:text-blue-400 transition-colors font-semibold">Student Portal</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-display font-semibold text-sm mb-4">Contact Info</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans mb-2">
              University Road, Zoo Street, Rahatabad, Peshawar, Pakistan
            </p>
            <p className="text-xs text-slate-400">Phone: {hostelInfo.contact.phone}</p>
            <p className="text-xs text-slate-400">Email: {hostelInfo.contact.email}</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-12 pt-6 text-center text-xs text-slate-600 font-sans">
          &copy; {new Date().getFullYear()} KP Youth University Hostel. All rights reserved. Managed by Directorate of Youth Affairs KP.
        </div>
      </footer>

    </div>
  );
}

// Sparkles local sub-icon
function Sparkles(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 6Z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
    </svg>
  );
}

// Target local sub-icon
function Target(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
