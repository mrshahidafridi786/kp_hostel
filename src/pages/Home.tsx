import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Sun, Moon, ArrowRight, Shield, Zap, Wifi,
  Utensils, BookOpen, Heart, Droplet, RefreshCw, MapPin,
  Phone, Mail, Calendar, Info, Award, User, HelpCircle, Check,
  ChevronDown, MessageCircle, ChevronLeft, ChevronRight, Play, Eye, Target, Star
} from 'lucide-react';
import { apiRequest } from '@/services/api';
import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

// ── Mock Data ─────────────────────────────────────────────────────────
const defaultHostelInfo = {
  description: "KP Youth University Hostel Peshawar is Khyber Pakhtunkhwa's premier student boarding facility, offering secure, hygienic, and modern living quarters designed to support academic and personal growth.",
  mission: 'To digitalize residential operations and offer a premium, hygienic, and secure boarding environment that supports students in achieving academic excellence.',
  vision: 'To build a state-of-the-art model for youth accommodation that resolves student lodging constraints through advanced features, green energy, and technology.',
  history: 'Founded in 2020 by the Directorate of Youth Affairs KP to support students coming from remote regions (Chitral, Swat, Waziristan, etc.) to study in Peshawar.',
  rules: [
    'Curfew is strictly 10:00 PM. Late entries must be approved by the Warden.',
    'Cleanliness is mandatory. Residents must keep their rooms tidy.',
    'No external visitors are allowed inside room quarters without registering at the reception.',
    'Anti-social behaviors, smoking, or illegal substances are strictly prohibited and result in immediate suspension.',
  ],
  contact: { email: 'info@kpyouthhostel.com', phone: '+92-91-9216701', whatsApp: '+92-300-1234567' },
  location: {
    address: 'University Road, Zoo Street, Rahatabad, Peshawar, Khyber Pakhtunkhwa',
    googleMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.7247738202517!2d71.48003661148107!3d34.0124395723507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d9172bc9776f9d%3A0xc07a514d3f3f1e94!2sPeshawar%20Zoo!5e0!3m2!1sen!2spk!4v1719999999999!5m2!1sen!2spk',
    nearbyUniversities: ['University of Peshawar (UoP) — 1.2 km', 'UET Peshawar — 1.5 km', 'Khyber Medical University (KMU) — 2.0 km', 'Islamia College Peshawar — 1.8 km'],
  },
  warden: {
    name: 'M Noor Wazir', qualification: 'Master of Public Administration (Peshawar University)', experience: '12 Years in Student Housing Management',
    message: 'Welcome to KP Youth Hostel. Our aim is to provide you a home away from home. Here, we prioritize your safety, hygiene, and study environment above everything else.',
    bio: 'M Noor Wazir holds a Masters in Public Administration and has overseen student boarding facilities for 12 years. He believes in fostering a disciplined yet caring community environment.',
    image: '/images/warden.jpg',
  },
  md: {
    name: 'Hameed Khan', bio: 'The Managing Director focuses on implementing government policies for youth development, executing digital transformation in youth hostels, and creating affordable living conditions.',
    vision: 'To build modern, digitized youth hostels across KP, promoting academic success and national integration.',
    message: 'This hostel represents our commitment to the youth of KP. By digitizing fee collections, rooms allocations, and notifications, we ensure complete transparency and convenience.',
    image: '/images/md.jpg',
  },
  gallery: [
    { url: '/images/hostel_dining.jpg', category: 'Dining Hall', caption: 'Students Dining Together — KP Youth Hostel' },
    { url: '/images/hostel_outside.jpg', category: 'Building', caption: 'KP University Youth Hostel — Main Entrance' },
    { url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600', category: 'Rooms', caption: 'Premium Quad Share Student Room' },
    { url: 'https://images.unsplash.com/photo-1598900866636-458f430ca483?auto=format&fit=crop&q=80&w=600', category: 'Rooms', caption: 'Double Bed Room with Study Desks' },
    { url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600', category: 'Library', caption: 'Air Conditioned Library and Reading Room' },
    { url: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&q=80&w=600', category: 'Sports Area', caption: 'Indoor Games and Recreation Area' },
  ],
};

const defaultRooms = [
  { roomNumber: '101', floor: 1, capacity: 4, monthlyFee: 9500, residents: [1, 2], status: 'Available' },
  { roomNumber: '201', floor: 2, capacity: 2, monthlyFee: 14000, residents: [], status: 'Available' },
  { roomNumber: '301', floor: 3, capacity: 1, monthlyFee: 18000, residents: [], status: 'Available' },
];

const defaultFacilities = [
  { name: 'High Speed WiFi', description: '24/7 uninterrupted fiber internet across all rooms and common areas.', icon: 'wifi' },
  { name: 'Electricity Backup', description: 'Heavy generators and UPS modules handle load-shedding events.', icon: 'zap' },
  { name: 'CCTV & Security', description: '24/7 active CCTV recording and professional security guards at gates.', icon: 'shield' },
  { name: 'Dining Hall & Mess', description: 'Hygiene-certified kitchen serving three healthy meals daily.', icon: 'utensils' },
  { name: 'Laundry Services', description: 'In-house washing machines and ironing services twice a week.', icon: 'refreshcw' },
  { name: 'AC Library', description: 'Quiet study environment open 24/7 with academic resources.', icon: 'bookopen' },
];

const faqs = [
  { q: 'Who is eligible to apply?', a: 'Students currently enrolled in registered universities in Peshawar (UoP, UET, KMU, Islamia College) and young working professionals are eligible. Admission is merit-based.' },
  { q: 'What is included in the monthly fee?', a: 'The fee covers rent, high-speed WiFi, 24/7 electricity backup, cleaning, parking, security, and AC library access. Mess charges are billed separately.' },
  { q: 'Are visitors allowed?', a: 'Visitors are allowed in the reception lobby or dining area only. They must register at the gate and are not allowed in student corridors or rooms.' },
  { q: 'How is security managed?', a: '24/7 gate security, active CCTV in corridors, regular guard shifts, and a digitized entry log for check-in/check-out tracking.' },
];

const testimonials = [
  { name: 'Shahid Khan', university: 'UET Peshawar', rating: 5, text: 'The best private hostel in Peshawar. Backup power and the silent AC library saved me during final exams. Highly recommended!' },
  { name: 'Asad Ali', university: 'University of Peshawar', rating: 5, text: 'Hygienic food, 24/7 security, and friendly management. The digital portal makes paying fees extremely easy.' },
  { name: 'Zeeshan Ahmad', university: 'Khyber Medical College', rating: 4, text: 'Very neat and clean. The study hall is a great space. Highly disciplined atmosphere perfect for medical students.' },
];

// ── Icon renderer ──────────────────────────────────────────────────────
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

// ── Main Component ─────────────────────────────────────────────────────
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
      try { const d = await apiRequest('/hostel'); if (d?.success && d.hostelInfo) setHostelInfo(d.hostelInfo); } catch {}
      try { const d = await apiRequest('/rooms'); if (d?.success && d.rooms) setRooms(d.rooms); } catch {}
      try { const d = await apiRequest('/facilities'); if (d?.success && d.facilities) setFacilities(d.facilities); } catch {}
    })();
  }, []);

  const filteredGallery = galleryFilter === 'All' ? hostelInfo.gallery : hostelInfo.gallery.filter(i => i.category === galleryFilter);
  const openLightbox = (i: number) => { setLightboxIndex(i); setLightboxOpen(true); };
  const nextLightbox = () => setLightboxIndex(p => (p + 1) % filteredGallery.length);
  const prevLightbox = () => setLightboxIndex(p => (p - 1 + filteredGallery.length) % filteredGallery.length);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try { await apiRequest('/messages', { method: 'POST', body: JSON.stringify(contactForm) }); }
    catch {}
    setFormSuccess(true); setContactForm({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setFormSuccess(false), 5000);
    setFormLoading(false);
  };

  const navLinks = ['Home','About','Rooms','Gallery','Facilities','Library','Warden','Contact'].map(l => ({label: l, href: `#${l.toLowerCase()}`}));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">

      {/* ── NAVBAR ── */}
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">KP</div>
              <span className="hidden sm:block font-bold text-xl tracking-tight text-slate-900 dark:text-white">KP <span className="text-blue-600 dark:text-blue-400">Youth Hostel</span></span>
            </div>
            {/* Desktop nav */}
            <div className="hidden lg:flex items-center space-x-5">
              {navLinks.map(l => <a key={l.label} href={l.href} className="font-medium text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{l.label}</a>)}
            </div>
            <div className="hidden lg:flex items-center space-x-3">
              <button onClick={toggleTheme} className="p-2 h-10 w-10 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/auth/login">
                <button className="px-5 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-medium text-sm transition-all">Login Portal</button>
              </Link>
            </div>
            {/* Mobile */}
            <div className="flex lg:hidden items-center space-x-3">
              <button onClick={toggleTheme} className="p-2 h-9 w-9 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 flex items-center justify-center text-slate-700 dark:text-slate-300">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 h-9 w-9 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 flex items-center justify-center text-slate-700 dark:text-slate-300">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
              <div className="px-4 pt-2 pb-6 space-y-1">
                {navLinks.map(l => <a key={l.label} href={l.href} onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">{l.label}</a>)}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full h-12 rounded-xl bg-blue-600 text-white font-medium shadow-md shadow-blue-500/10">Login Portal</button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden py-16 px-4">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-1/4 -left-1/4 w-[80vw] h-[80vw] max-w-3xl max-h-3xl rounded-full bg-blue-600/8 dark:bg-blue-600/5 blur-[120px]" />
          <motion.div animate={{ scale: [1.1, 1, 1.1] }} transition={{ duration: 10, repeat: Infinity }}
            className="absolute -bottom-1/4 -right-1/4 w-[80vw] h-[80vw] max-w-3xl max-h-3xl rounded-full bg-emerald-500/8 dark:bg-emerald-500/5 blur-[120px]" />
        </div>
        <div className="max-w-7xl mx-auto w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="col-span-1 lg:col-span-7 text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs mb-6 uppercase tracking-wider mx-auto lg:mx-0">
                <Star className="w-4 h-4" /><span>Premium Boarding Facility</span>
              </div>
              <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
                KP Youth University <br /><span className="text-gradient">Hostel Peshawar</span>
              </h1>
              <p className="max-w-xl text-lg text-slate-600 dark:text-slate-400 mb-8 mx-auto lg:mx-0 leading-relaxed">
                Experience a modern, highly secure, and fully digitized residential ecosystem near University Road. Perfect study environment, biometric logs, and premium facilities for students.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <a href="#contact" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-12 px-8 rounded-xl btn-gradient flex items-center justify-center space-x-2">
                    <span>Apply Now</span><ArrowRight className="w-5 h-5" />
                  </button>
                </a>
                <a href="#facilities" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-12 px-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-all">
                    Explore Facilities
                  </button>
                </a>
              </div>
            </motion.div>
          </div>
          <div className="col-span-1 lg:col-span-5 flex justify-center">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-[480px] aspect-[4/3] sm:aspect-square rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800/50">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10" />
              <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800" alt="KP Youth Hostel" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute bottom-6 left-6 z-20 text-white">
                <p className="font-bold text-xl">Modern Study Chambers</p>
                <p className="text-slate-300 text-sm">Quiet, fully furnished shared student units.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-24 border-t border-slate-200/50 dark:border-slate-900/50 bg-white dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">About The Hostel</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{hostelInfo.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Target className="w-6 h-6" />, color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10', title: 'Our Mission', text: hostelInfo.mission },
              { icon: <Eye className="w-6 h-6" />, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10', title: 'Our Vision', text: hostelInfo.vision },
              { icon: <Calendar className="w-6 h-6" />, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10', title: 'Our History', text: hostelInfo.history },
            ].map(({ icon, color, title, text }) => (
              <motion.div key={title} whileHover={{ y: -5 }} className="p-8 rounded-2xl glass-card">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${color}`}>{icon}</div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROOMS ── */}
      <section id="rooms" className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">Premium Rooms</h2>
            <p className="text-slate-600 dark:text-slate-400">Choose from single private rooms or modern shared boarding spaces. Complete with high-speed internet and air-cooling.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rooms.slice(0, 3).map((room, i) => {
              const vacancy = room.capacity - (room.residents?.length || 0);
              const isFull = vacancy <= 0;
              const img = room.capacity === 1
                ? 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600'
                : room.capacity === 2
                ? 'https://images.unsplash.com/photo-1598900866636-458f430ca483?auto=format&fit=crop&q=80&w=600'
                : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600';
              return (
                <motion.div key={room.roomNumber} whileHover={{ y: -6 }} className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                  <div className="relative h-56">
                    <img src={img} alt={`Room ${room.roomNumber}`} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-800 shadow-sm">Room {room.roomNumber}</div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400">{room.capacity === 1 ? 'Single Room' : `${room.capacity}-Share Unit`}</span>
                      <span className="font-extrabold text-lg text-slate-900 dark:text-white">PKR {room.monthlyFee?.toLocaleString()} <span className="text-xs font-normal text-slate-400">/mo</span></span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-100 dark:border-slate-800 text-sm mb-6">
                      <div><span className="text-slate-400 block text-xs">Capacity</span><span className="font-semibold text-slate-800 dark:text-slate-200">{room.capacity} Seats</span></div>
                      <div><span className="text-slate-400 block text-xs">Available</span><span className={`font-semibold ${isFull ? 'text-red-500' : 'text-emerald-500'}`}>{isFull ? 'House Full' : `${vacancy} Vacant`}</span></div>
                    </div>
                    <a href="#contact">
                      <button className="w-full py-2.5 rounded-xl border border-blue-600 hover:bg-blue-600 text-blue-600 hover:text-white font-medium text-sm transition-all flex items-center justify-center space-x-2">
                        <span>Apply For Room</span><ArrowRight className="w-4 h-4" />
                      </button>
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FACILITIES ── */}
      <section id="facilities" className="py-24 bg-white dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">Premium Facilities</h2>
            <p className="text-slate-600 dark:text-slate-400">Enjoy a comfortable lifestyle with everything you need. Fully managed utilities so you can focus entirely on academics.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((fac, i) => (
              <motion.div key={fac.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/60 shadow-sm flex space-x-4 card-shine">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <FacilityIcon name={fac.icon || 'info'} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{fac.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{fac.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AC LIBRARY ── */}
      <section id="library" className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="col-span-1 lg:col-span-5 relative h-96 sm:h-[450px] rounded-3xl overflow-hidden shadow-xl border border-slate-200/50 dark:border-slate-800/50">
              <img src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800" alt="AC Library" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent z-10" />
              <div className="absolute bottom-8 left-8 right-8 z-20 text-white">
                <span className="px-3 py-1 rounded-full text-xs bg-emerald-500 font-semibold mb-3 inline-block">Open 24/7</span>
                <h3 className="font-bold text-2xl mb-2">Central Study Hall</h3>
                <p className="text-slate-300 text-sm">Quiet zoning equipped with continuous cooling and high-speed desks.</p>
              </div>
            </div>
            <div className="col-span-1 lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs mb-6 uppercase tracking-wider mr-auto">
                <BookOpen className="w-4 h-4" /><span>Silent Study Quarters</span>
              </div>
              <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-6">Air Conditioned Library</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">Dedicated silent study quarters boasting comfortable ergonomic chairs, separate study partitions, charging ports, and reference resources to ensure residents can study peacefully.</p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                {[['120 Seat Capacity','Separate desks and partitions.'],['Continuous Backup','UPS & Generator connected.'],['Reference Library','Journals and exam resources.'],['AC Cooling','Cool environment in hot summers.']].map(([h,sub]) => (
                  <div key={h} className="flex space-x-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5"><Check className="w-3.5 h-3.5" /></div>
                    <div><h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{h}</h4><p className="text-slate-500 text-xs">{sub}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="gallery" className="py-24 bg-white dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">Hostel Gallery</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl">Explore photos of our dining hall, building, study library, and student rooms.</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-6 md:mt-0">
              {['All','Rooms','Dining Hall','Library','Building','Sports Area'].map(cat => (
                <button key={cat} onClick={() => setGalleryFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${galleryFilter===cat?'bg-blue-600 text-white':'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((item, idx) => (
              <motion.div layout key={item.url} onClick={() => openLightbox(idx)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200/30 dark:border-slate-800/30 shadow-sm cursor-pointer">
                <img src={item.url} alt={item.caption || 'Hostel Image'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white"><Eye className="w-5 h-5" /></div>
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
        {/* Lightbox */}
        <AnimatePresence>
          {lightboxOpen && filteredGallery[lightboxIndex] && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-950/95 flex items-center justify-center p-4">
              <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white p-2 z-[110]"><X className="w-8 h-8" /></button>
              <button onClick={prevLightbox} className="absolute left-6 text-white p-3 bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-sm z-[110]"><ChevronLeft className="w-6 h-6" /></button>
              <div className="max-w-4xl max-h-[80vh] flex flex-col items-center justify-center px-12">
                <motion.img key={lightboxIndex} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}
                  src={filteredGallery[lightboxIndex].url} alt={filteredGallery[lightboxIndex].caption || ''} className="max-w-full max-h-[70vh] rounded-xl object-contain shadow-2xl" />
                {filteredGallery[lightboxIndex].caption && <p className="text-slate-400 text-sm mt-4 text-center">{filteredGallery[lightboxIndex].caption}</p>}
              </div>
              <button onClick={nextLightbox} className="absolute right-6 text-white p-3 bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-sm z-[110]"><ChevronRight className="w-6 h-6" /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── WARDEN & MD ── */}
      <section id="warden" className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">Leadership</h2>
            <p className="text-slate-600 dark:text-slate-400">Meet the people who manage and run KP Youth Hostel.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[
              { role: 'Hostel Warden', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', person: hostelInfo.warden, sub: hostelInfo.warden.qualification },
              { role: 'Managing Director', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', person: hostelInfo.md, sub: 'Directorate of Youth Affairs KP' },
            ].map(({ role, color, person, sub }) => (
              <motion.div key={role} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="rounded-3xl p-8 sm:p-12 border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-8 items-center sm:items-start">
                <div className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <img src={person.image} alt={person.name} className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <User className="w-12 h-12 text-slate-400 absolute" />
                </div>
                <div>
                  <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase mb-2 inline-block ${color}`}>{role}</span>
                  <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white mb-1">{person.name}</h3>
                  <p className="text-slate-400 text-xs mb-4">{sub}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4 italic">"{person.message}"</p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">{person.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCATION ── */}
      <section className="py-24 bg-white dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="col-span-1 lg:col-span-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs mb-6 uppercase tracking-wider">
                <MapPin className="w-4 h-4" /><span>Hostel Location</span>
              </div>
              <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">Peshawar University Road</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">Located near Zoo Street, our campus sits at a major transport hub, allowing students to walk to nearby campuses or access local buses within minutes.</p>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 mb-6 flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div><h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Address</h4><p className="text-slate-500 text-xs">{hostelInfo.location.address}</p></div>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-sm">Nearby Universities:</h4>
              <ul className="space-y-2">
                {hostelInfo.location.nearbyUniversities.map(u => (
                  <li key={u} className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /><span>{u}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-1 lg:col-span-7">
              <div className="w-full h-96 rounded-3xl overflow-hidden shadow-xl border border-slate-200/50 dark:border-slate-800/50">
                {hostelInfo.location.googleMapUrl ? (
                  <iframe title="Hostel Location Map" src={hostelInfo.location.googleMapUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
                ) : (
                  <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400"><MapPin className="w-12 h-12" /></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOSTEL RULES ── */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">Hostel Rules</h2>
            <p className="text-slate-600 dark:text-slate-400">All residents are expected to adhere to these guidelines for a safe and productive environment.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {hostelInfo.rules.map((rule, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-start space-x-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-extrabold flex-shrink-0">{i + 1}</div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{rule}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-white dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">Resident Testimonials</h2>
            <p className="text-slate-600 dark:text-slate-400">Hear from our residents what it's like living at KP Youth Hostel.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm card-shine">
                <div className="flex space-x-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-600 flex items-center justify-center font-extrabold text-xs uppercase">{t.name.substring(0,2)}</div>
                  <div><p className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</p><p className="text-xs text-slate-400">{t.university}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600 dark:text-slate-400">Answers to the most common admission and facility questions.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left">
                  <span className="font-bold text-slate-900 dark:text-white text-sm pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <p className="px-6 pb-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-24 bg-white dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="col-span-1 lg:col-span-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs mb-6 uppercase tracking-wider">
                <MessageCircle className="w-4 h-4" /><span>Get in Touch</span>
              </div>
              <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-6">Apply for Admission</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">Fill out this form with your details and our Warden's office will respond within 24 hours to schedule a visit or confirm your room booking.</p>
              <div className="space-y-5">
                {[<><Phone className="w-5 h-5 text-blue-600" /><div><p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Call / WhatsApp</p><p className="text-slate-500 text-xs">{hostelInfo.contact.phone}</p></div></>,<><Mail className="w-5 h-5 text-blue-600" /><div><p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Email Us</p><p className="text-slate-500 text-xs">{hostelInfo.contact.email}</p></div></>,].map((content, i) => (
                  <div key={i} className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">{content}</div>
                ))}
              </div>
            </div>
            <div className="col-span-1 lg:col-span-7">
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                <AnimatePresence>
                  {formSuccess && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm text-center flex items-center justify-center space-x-2">
                      <Check className="w-5 h-5" /><span>Message received! We'll respond within 24 hours.</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <form onSubmit={handleContact} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[['Full Name','text','name'],['Email Address','email','email'],['Phone Number','tel','phone']].map(([lbl,type,key]) => (
                      <div key={key} className={key==='phone'?'sm:col-span-2':''}>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{lbl}</label>
                        <input type={type} required value={(contactForm as any)[key]} onChange={e => setContactForm({...contactForm, [key]: e.target.value})} className="input-base" placeholder={key==='name'?'Your full name':key==='email'?'your@email.com':'+92-300-0000000'} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Your Message</label>
                    <textarea required rows={5} value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} className="input-base pt-3 resize-none h-auto" placeholder="Tell us about your university, preferred room type, expected move-in date..." />
                  </div>
                  <motion.button type="submit" disabled={formLoading} whileTap={{ scale: 0.97 }} className="w-full h-12 rounded-xl btn-gradient text-sm font-bold disabled:opacity-70 mt-2">
                    {formLoading ? 'Sending...' : 'Send Admission Inquiry →'}
                  </motion.button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-16 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">KP</div>
                <span className="font-bold text-lg">KP Youth Hostel</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">Khyber Pakhtunkhwa's premier digitized student boarding facility near University Road, Peshawar.</p>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-slate-300">Quick Links</h4>
              <ul className="space-y-2">
                {navLinks.map(l => <li key={l.label}><a href={l.href} className="text-slate-400 hover:text-white text-sm transition-colors">{l.label}</a></li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-slate-300">Contact</h4>
              <div className="space-y-3 text-sm text-slate-400">
                <p><MapPin className="w-4 h-4 inline mr-2 text-blue-400" />{hostelInfo.location.address}</p>
                <p><Phone className="w-4 h-4 inline mr-2 text-blue-400" />{hostelInfo.contact.phone}</p>
                <p><Mail className="w-4 h-4 inline mr-2 text-blue-400" />{hostelInfo.contact.email}</p>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs">
            <p>© {new Date().getFullYear()} KP Youth University Hostel. All rights reserved.</p>
            <Link to="/auth/login" className="mt-4 sm:mt-0 text-blue-400 hover:text-blue-300 transition-colors font-semibold">Staff Login →</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
