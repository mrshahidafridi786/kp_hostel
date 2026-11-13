import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Sun, Moon, ArrowRight, Shield, Zap, Wifi,
  Utensils, BookOpen, Heart, Droplet, RefreshCw, MapPin,
  Phone, Mail, Calendar, Info, Award, User, HelpCircle, Check,
  ChevronDown, MessageCircle, ChevronLeft, ChevronRight, Play, Eye, Target, Star,
  Sparkles, ShieldCheck, GraduationCap
} from 'lucide-react';
import { apiRequest, INITIAL_HOSTEL_INFO, INITIAL_FACILITIES, INITIAL_ROOMS } from '@/services/api';
import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

const defaultHostelInfo = {
  ...INITIAL_HOSTEL_INFO,
  rules: [
    'Curfew is strictly 10:00 PM. Late entries must be approved via Administration digital gate slip.',
    'Cleanliness is mandatory. Residents must keep their rooms tidy and hygienic.',
    'No external visitors are allowed inside residential rooms without logging at reception.',
    'Anti-social behaviors, smoking, or unauthorized electrical appliances are strictly prohibited.',
  ],
  gallery: [
    { url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1000', category: 'Building', caption: 'KP University Youth Hostel — Main Academic Facade' },
    { url: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&q=80&w=1000', category: 'Dining Hall', caption: 'Clean & Hygienic Dining Hall & Student Cafeteria' },
    { url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1000', category: 'Rooms', caption: 'Quad Shared Student Room with Ergonomic Desks' },
    { url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=1000', category: 'Rooms', caption: 'Executive Double Bed Studio with Study Setup' },
    { url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=1000', category: 'Library', caption: 'Air Conditioned Digital Study Hall & Reading Quarters' },
    { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000', category: 'Sports Area', caption: 'Indoor Recreation Arena & Table Tennis Pavilion' },
    { url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1000', category: 'Library', caption: 'High-Speed Computer & Research Workstation Pods' },
    { url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=1000', category: 'Building', caption: 'Student Common Lounge & Leisure Hall' },
  ],
};

const defaultRooms = INITIAL_ROOMS;
const defaultFacilities = INITIAL_FACILITIES;

const faqs = [
  {
    q: 'Who is eligible to apply for accommodation?',
    a: 'Students currently enrolled in registered universities in Peshawar (UoP, UET, KMU, FAST-NUCES, Islamia College, IMSciences) and young researchers are eligible. Admission is merit-based with priority for outstation youth.',
  },
  {
    q: 'What is included in the monthly rent package?',
    a: 'The fee covers furnished bed space, 500 Mbps redundant fiber WiFi, 24/7 solar/generator electricity backup, room cleaning, security, parking, and AC study hall access. Dining mess charges are billed separately.',
  },
  {
    q: 'How does digital fee payment work?',
    a: 'Residents receive an automated monthly invoice in their student portal on the 1st of every month. Payments can be deposited instantly via EasyPaisa, JazzCash, or bank transfer with immediate receipts.',
  },
  {
    q: 'What are the security and guest policies?',
    a: 'We maintain 24/7 gate security, active CCTV recording across corridors, RFID turnstile check-ins, and biometric verification. Guests may visit in the reception lounge only.',
  },
];

const testimonials = [
  {
    name: 'Bilal Tariq',
    university: 'FAST-NUCES Peshawar (Software Eng.)',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    text: 'The 500 Mbps high-speed fiber internet and uninterrupted solar power backup made remote coding and final semester projects completely seamless. Hands down the best student accommodation in KP.',
  },
  {
    name: 'Hamza Farooq',
    university: 'Khyber Medical University (Pharm-D)',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    text: 'Hygienic food, 24/7 security, and disciplined quiet hours. The student digital portal makes fee payments and hostel inquiries straightforward.',
  },
  {
    name: 'Danyal Rehman',
    university: 'UET Peshawar (Electrical Eng.)',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    text: 'Very neat and secure. The 24/7 AC library saved me during midterm and final exam weeks. Great community of aspiring engineers and medical scholars.',
  },
  {
    name: 'Shahzaib Shinwari',
    university: 'KMC Peshawar (Final Year MBBS)',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    text: 'Ideal environment for clinical rotation students who need quiet night study quarters. The administration staff is responsive and helpful.',
  },
];

function FacilityIcon({ name }: { name: string }) {
  const cls = 'w-6 h-6 text-blue-600 dark:text-blue-400';
  switch (name.toLowerCase()) {
    case 'wifi': return <Wifi className={cls} />;
    case 'zap': return <Zap className={cls} />;
    case 'shield': return <Shield className={cls} />;
    case 'utensils': return <Utensils className={cls} />;
    case 'refreshcw': return <RefreshCw className={cls} />;
    case 'bookopen': return <BookOpen className={cls} />;
    case 'heart': return <Heart className={cls} />;
    case 'droplet': return <Droplet className={cls} />;
    default: return <Info className={cls} />;
  }
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [hostelInfo, setHostelInfo] = useState(defaultHostelInfo);
  const [rooms, setRooms] = useState<any[]>(defaultRooms);
  const [facilities, setFacilities] = useState(defaultFacilities);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState('All');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [formSuccess, setFormSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const d = await apiRequest('/hostel');
        if (d?.success && d.hostelInfo) {
          setHostelInfo(prev => ({
            ...prev,
            ...d.hostelInfo,
            gallery: (Array.isArray(d.hostelInfo?.gallery) && d.hostelInfo.gallery.length > 0)
              ? d.hostelInfo.gallery
              : prev.gallery,
            rules: (Array.isArray(d.hostelInfo?.rules) && d.hostelInfo.rules.length > 0)
              ? d.hostelInfo.rules
              : prev.rules,
          }));
        }
      } catch (err) {
        console.debug('Failed to load hostel info', err);
      }
      try {
        const d = await apiRequest('/rooms');
        if (d?.success && Array.isArray(d.rooms)) setRooms(d.rooms);
      } catch (err) {
        console.debug('Failed to load rooms', err);
      }
      try {
        const d = await apiRequest('/facilities');
        if (d?.success && Array.isArray(d.facilities)) setFacilities(d.facilities);
      } catch (err) {
        console.debug('Failed to load facilities', err);
      }
    })();
  }, []);

  const galleryList = Array.isArray(hostelInfo?.gallery) && hostelInfo.gallery.length > 0
    ? hostelInfo.gallery
    : defaultHostelInfo.gallery;

  const filteredGallery = galleryFilter === 'All'
    ? galleryList
    : galleryList.filter((i: any) => i?.category === galleryFilter);

  const openLightbox = (i: number) => { setLightboxIndex(i); setLightboxOpen(true); };
  const nextLightbox = () => setLightboxIndex(p => (p + 1) % (filteredGallery.length || 1));
  const prevLightbox = () => setLightboxIndex(p => (p - 1 + (filteredGallery.length || 1)) % (filteredGallery.length || 1));

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await apiRequest('/messages', { method: 'POST', body: JSON.stringify(contactForm) });
    } catch (err) {
      console.debug('Failed to send contact message', err);
    }
    setFormSuccess(true);
    setContactForm({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setFormSuccess(false), 5000);
    setFormLoading(false);
  };

  const navLinks = ['Home', 'About', 'Rooms', 'Facilities', 'Library', 'Gallery', 'Reviews', 'Contact'].map(l => ({
    label: l,
    href: `#${l.toLowerCase()}`,
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      {/* ── NAVBAR ── */}
      <nav className="glass-nav sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/25">
                KP
              </div>
              <div>
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white leading-tight block">
                  KP Youth <span className="text-blue-600 dark:text-blue-400">Hostel</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">
                  Peshawar University Road
                </span>
              </div>
            </div>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center space-x-6">
              {navLinks.map(l => (
                <a
                  key={l.label}
                  href={l.href}
                  className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                title="Toggle Theme"
                className="p-2 h-10 w-10 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all border border-slate-200/60 dark:border-slate-800"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
              <Link to="/auth/login">
                <button className="px-5 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all">
                  Sign In Portal →
                </button>
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 h-9 w-9 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 flex items-center justify-center text-slate-700 dark:text-slate-300"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
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

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl"
            >
              <div className="px-4 pt-3 pb-6 space-y-1">
                {navLinks.map(l => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 px-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {l.label}
                  </a>
                ))}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full h-11 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/20">
                      Open Management Portal
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO SECTION ── */}
      <section id="home" className="relative min-h-[calc(100vh-120px)] flex items-center justify-center overflow-hidden py-16 px-4">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-1/4 -left-1/4 w-[80vw] h-[80vw] max-w-3xl max-h-3xl rounded-full bg-blue-600 blur-[130px]"
          />
          <motion.div
            animate={{ scale: [1.15, 1, 1.15], opacity: [0.05, 0.10, 0.05] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-1/4 -right-1/4 w-[80vw] h-[80vw] max-w-3xl max-h-3xl rounded-full bg-emerald-500 blur-[130px]"
          />
        </div>

        <div className="max-w-7xl mx-auto w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="col-span-1 lg:col-span-7 text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs mb-6 uppercase tracking-wider mx-auto lg:mx-0 border border-blue-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Premier Student Boarding & Study Hub</span>
              </div>

              <h1 className="font-black text-4xl sm:text-5xl md:text-6xl tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
                KP Youth University <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
                  Hostel Peshawar
                </span>
              </h1>

              <p className="max-w-xl text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-8 mx-auto lg:mx-0 leading-relaxed font-normal">
                A digitized residential campus designed for ambitious students. Featuring biometric turnstiles, 500 Mbps redundant fiber WiFi, 24/7 solar power, hygienic mess dining, and silent AC study halls near University Road.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3.5 sm:space-y-0 sm:space-x-4">
                <a href="#contact" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all">
                    <span>Apply for Spring Intake</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </a>
                <Link to="/auth/login" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-12 px-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm transition-all shadow-sm flex items-center justify-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span>Resident & Admin Portal</span>
                  </button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-10 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left border-t border-slate-200/80 dark:border-slate-800/80 mt-10">
                <div>
                  <span className="font-extrabold text-xl text-slate-900 dark:text-white block">24/7</span>
                  <span className="text-[11px] text-slate-500">Uninterrupted Power</span>
                </div>
                <div>
                  <span className="font-extrabold text-xl text-blue-600 dark:text-blue-400 block">500 Mbps</span>
                  <span className="text-[11px] text-slate-500">Fiber Optic Mesh</span>
                </div>
                <div>
                  <span className="font-extrabold text-xl text-emerald-600 dark:text-emerald-400 block">100%</span>
                  <span className="text-[11px] text-slate-500">Hygienic Halal Mess</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Hero Image Showcase */}
          <div className="col-span-1 lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative w-full max-w-[460px] aspect-[4/3] sm:aspect-square rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1000"
                alt="KP Youth Hostel Campus"
                className="absolute inset-0 w-full h-full object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800';
                }}
              />
              <div className="absolute bottom-6 left-6 right-6 z-20 text-white">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white mb-2 inline-block">
                  Rahatabad Peshawar Campus
                </span>
                <p className="font-black text-xl">Main Hostel Entrance</p>
                <p className="text-slate-300 text-xs mt-0.5">Zoo Street, University Road, Khyber Pakhtunkhwa</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section id="about" className="py-24 border-t border-slate-200/60 dark:border-slate-900 bg-white dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-2">
              Vision & Leadership
            </span>
            <h2 className="font-black text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">
              About KP Youth University Hostel
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {hostelInfo.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Target className="w-6 h-6" />, color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10', title: 'Our Mission', text: hostelInfo.mission },
              { icon: <Eye className="w-6 h-6" />, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10', title: 'Our Vision', text: hostelInfo.vision },
              { icon: <Calendar className="w-6 h-6" />, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10', title: 'Campus Heritage', text: hostelInfo.history },
            ].map(({ icon, color, title, text }) => (
              <motion.div
                key={title}
                whileHover={{ y: -4 }}
                className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${color}`}>{icon}</div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROOMS EXPLORER ── */}
      <section id="rooms" className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-2">
              Boarding Options
            </span>
            <h2 className="font-black text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">
              Modern Room Plans & Pricing
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              All plans include high-speed fiber internet, continuous power backup, and quiet study quarters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[
              {
                title: 'Quad Shared Dormitory',
                capacity: 4,
                monthlyFee: 9500,
                desc: 'Economical, spacious room with 4 private study desks, wardrobes, and high-speed Wi-Fi.',
                img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=700',
                badge: 'Most Popular',
              },
              {
                title: 'Executive Double Bed Studio',
                capacity: 2,
                monthlyFee: 14000,
                desc: 'Balanced privacy with premium attached washroom, study partitioned tables, and cooling.',
                img: 'https://images.unsplash.com/photo-1598900866636-458f430ca483?auto=format&fit=crop&q=80&w=700',
                badge: 'High Demand',
              },
              {
                title: 'Single Private Deluxe Suite',
                capacity: 1,
                monthlyFee: 19500,
                desc: 'Full quiet privacy designed for medical researchers, postgraduates, and final-year scholars.',
                img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=700',
                badge: 'Premium Private',
              },
            ].map(plan => (
              <motion.div
                key={plan.title}
                whileHover={{ y: -5 }}
                className="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56">
                    <img src={plan.img} alt={plan.title} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-900 shadow-md">
                      {plan.badge}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{plan.title}</h3>
                    </div>
                    <div className="text-xl font-black text-blue-600 dark:text-blue-400 mb-3">
                      PKR {plan.monthlyFee.toLocaleString()}{' '}
                      <span className="text-xs font-normal text-slate-400">/ month</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      {plan.desc}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] py-3 border-t border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                      <div>✓ Fiber Mesh WiFi</div>
                      <div>✓ 24/7 UPS & Solar</div>
                      <div>✓ Biometric Turnstile</div>
                      <div>✓ AC Library Access</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <a href="#contact">
                    <button className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2">
                      <span>Reserve Bed Space</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FACILITIES SECTION ── */}
      <section id="facilities" className="py-24 bg-white dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-2">
              Campus Amenities
            </span>
            <h2 className="font-black text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">
              Everything You Need To Excel
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              We manage all hostel utilities, security, and logistics so students can focus on academics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {facilities.map((fac, i) => (
              <motion.div
                key={fac.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-500/20">
                    <FacilityIcon name={fac.icon || 'wifi'} />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2 leading-tight">
                    {fac.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    {fac.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 24/7 AC LIBRARY FEATURE ── */}
      <section id="library" className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="col-span-1 lg:col-span-6 relative h-96 sm:h-[440px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=900"
                alt="AC Library Hall"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent z-10" />
              <div className="absolute bottom-8 left-8 right-8 z-20 text-white">
                <span className="px-3 py-1 rounded-full text-xs bg-emerald-500 font-bold mb-3 inline-block">
                  Open 24 Hours / 7 Days
                </span>
                <h3 className="font-black text-2xl mb-1">Silent Academic Study Hall</h3>
                <p className="text-slate-300 text-xs">Separate study partitions, charging sockets, and high-speed Wi-Fi.</p>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-5 uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Dedicated Study Quarters</span>
              </div>
              <h2 className="font-black text-3xl sm:text-4xl text-slate-900 dark:text-white mb-5 leading-tight">
                Quiet & Air-Conditioned Digital Reading Hall
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                Recognizing the demands of competitive university examinations (UET, KMU MBBS, FAST CS), our dedicated study lounge operates around the clock. Ergonomic seating and complete silence help you stay focused.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  ['120 Study Desks', 'Separate partitions and charging hubs.'],
                  ['24/7 Power Continuity', 'Dedicated UPS and generator loop.'],
                  ['Hot Beverage Station', 'Complimentary midnight tea during exams.'],
                  ['Climate Controlled', 'Dual inverter ACs maintaining cool temperature.'],
                ].map(([title, desc]) => (
                  <div key={title} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{title}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] pl-5">{desc}</p>
                  </div>
                ))}
              </div>

              <a href="#contact">
                <button className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-all shadow-md">
                  Book a Campus Tour →
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── PHOTO GALLERY ── */}
      <section id="gallery" className="py-24 bg-white dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-2">
                Visual Tour
              </span>
              <h2 className="font-black text-3xl sm:text-4xl text-slate-900 dark:text-white mb-2">
                Campus Gallery
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs max-w-xl">
                Explore authentic photos of our student rooms, dining hall, building facade, and recreation areas.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-5 md:mt-0">
              {['All', 'Rooms', 'Dining Hall', 'Library', 'Building', 'Sports Area'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setGalleryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    galleryFilter === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((item, idx) => (
              <motion.div
                layout
                key={item.url}
                onClick={() => openLightbox(idx)}
                className="group relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm cursor-pointer"
              >
                <img
                  src={item.url}
                  alt={item.caption || 'Hostel Campus'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
                {item.caption && (
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950/80 to-transparent text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-xs font-semibold">{item.caption}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {lightboxOpen && filteredGallery[lightboxIndex] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-950/95 flex items-center justify-center p-4 backdrop-blur-md"
            >
              <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white p-2 z-[110]">
                <X className="w-8 h-8" />
              </button>
              <button onClick={prevLightbox} className="absolute left-6 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm z-[110]">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="max-w-4xl max-h-[80vh] flex flex-col items-center justify-center px-12">
                <motion.img
                  key={lightboxIndex}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  src={filteredGallery[lightboxIndex].url}
                  alt={filteredGallery[lightboxIndex].caption || ''}
                  className="max-w-full max-h-[70vh] rounded-2xl object-contain shadow-2xl"
                />
                {filteredGallery[lightboxIndex].caption && (
                  <p className="text-slate-300 text-sm mt-4 text-center font-semibold">
                    {filteredGallery[lightboxIndex].caption}
                  </p>
                )}
              </div>
              <button onClick={nextLightbox} className="absolute right-6 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm z-[110]">
                <ChevronRight className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── RESIDENT REVIEWS & TESTIMONIALS ── */}
      <section id="reviews" className="py-24 bg-white dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-2">
              Resident Voices
            </span>
            <h2 className="font-black text-3xl sm:text-4xl text-slate-900 dark:text-white mb-2">
              What Our Residents Say
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Real reviews from students attending universities across Peshawar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex space-x-1 mb-3">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-5 italic">
                    "{t.text}"
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                  {t.avatar ? (
                    <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-xl object-cover shadow-sm border border-slate-200 dark:border-slate-700" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                      {t.name.substring(0, 2)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">{t.name}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{t.university}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-2">
              Clarifications
            </span>
            <h2 className="font-black text-3xl sm:text-4xl text-slate-900 dark:text-white mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Key questions about admissions, fees, security, and facility access.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                      activeFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="px-5 pb-5 text-slate-600 dark:text-slate-400 text-xs leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT & ADMISSION FORM ── */}
      <section id="contact" className="py-24 bg-white dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="col-span-1 lg:col-span-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs mb-5 uppercase tracking-wider">
                <MessageCircle className="w-4 h-4" />
                <span>Admission Desk</span>
              </div>
              <h2 className="font-black text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">
                Inquire or Apply Online
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-6">
                Submit your inquiry and our hostel administration will contact you within 24 hours to schedule an in-person room inspection or confirm seat allocation.
              </p>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">Admin Office Hotline</p>
                    <p className="text-slate-400 text-xs font-mono">{hostelInfo?.contact?.phone || defaultHostelInfo.contact.phone}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">Official Admissions Email</p>
                    <p className="text-slate-400 text-xs">{hostelInfo?.contact?.email || defaultHostelInfo.contact.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">Campus Location</p>
                    <p className="text-slate-400 text-xs">{hostelInfo?.location?.address || defaultHostelInfo.location.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-7">
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-1">
                  Send Admission Inquiry
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  Inquire about seat availability for Spring / Fall semester intakes.
                </p>

                <AnimatePresence>
                  {formSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Inquiry submitted! Our admissions office will get back to you shortly.</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleContact} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="e.g. Asad Ullah Khan"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="asad@example.com"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactForm.phone}
                      onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="+92-300-1234567"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Message / University / Preferred Room Type *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Tell us about your university, degree department, preferred room type (Single, Double, Quad), and expected move-in date..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
                  >
                    {formLoading ? 'Submitting...' : 'Submit Admission Inquiry →'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-14 bg-slate-950 text-white border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center space-x-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm">
                  KP
                </div>
                <span className="font-extrabold text-base">KP Youth Hostel</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Khyber Pakhtunkhwa's premier digitized student boarding facility near University Road, Rahatabad, Peshawar.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-slate-300">Quick Navigation</h4>
              <ul className="space-y-1.5 text-xs">
                {navLinks.map(l => (
                  <li key={l.label}>
                    <a href={l.href} className="text-slate-400 hover:text-white transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-slate-300">Hostel Helpdesk</h4>
              <div className="space-y-2 text-xs text-slate-400">
                <p>{hostelInfo?.location?.address || defaultHostelInfo.location.address}</p>
                <p>Hotline: {hostelInfo?.contact?.phone || defaultHostelInfo.contact.phone}</p>
                <p>Email: {hostelInfo?.contact?.email || defaultHostelInfo.contact.email}</p>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs">
            <p>© {new Date().getFullYear()} KP Youth University Hostel. All rights reserved.</p>
            <Link to="/auth/login" className="mt-3 sm:mt-0 text-blue-400 hover:text-blue-300 font-bold">
              Staff & Resident Login Portal →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
