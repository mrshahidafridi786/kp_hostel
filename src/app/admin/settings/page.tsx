"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/services/api';
import {
  Settings, User, MapPin, Key, ShieldCheck, Check,
  X, RefreshCw, AlertTriangle, Eye, EyeOff
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'hostel' | 'system'>('profile');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // System credentials show/hide toggle
  const [showSecrets, setShowSecrets] = useState(false);

  // Big Settings Form State (maps to HostelInfo Singleton)
  const [formData, setFormData] = useState({
    warden: { name: '', qualification: '', experience: '', message: '', bio: '', image: '' },
    md: { name: '', vision: '', message: '', bio: '', image: '' },
    contact: { email: '', phone: '', whatsApp: '' },
    location: { address: '', googleMapUrl: '', nearbyUniversities: [] as string[] },
    system: {
      smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '',
      twilioSid: '', twilioToken: '', twilioPhone: ''
    }
  });

  const [nearbyInput, setNearbyInput] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/hostel');
      if (data?.success && data?.hostelInfo) {
        const info = data.hostelInfo;
        setFormData({
          warden: info.warden || formData.warden,
          md: info.md || formData.md,
          contact: info.contact || formData.contact,
          location: {
            address: info.location?.address || '',
            googleMapUrl: info.location?.googleMapUrl || '',
            nearbyUniversities: info.location?.nearbyUniversities || []
          },
          system: {
            smtpHost: info.system?.smtpHost || '',
            smtpPort: info.system?.smtpPort || 587,
            smtpUser: info.system?.smtpUser || '',
            smtpPass: info.system?.smtpPass || '',
            twilioSid: info.system?.twilioSid || '',
            twilioToken: info.system?.twilioToken || '',
            twilioPhone: info.system?.twilioPhone || ''
          }
        });
      }
    } catch (err) {
      console.warn('[SETTINGS] Fetch failed, using default state placeholders');
      // Set default placeholders for offline test
      setFormData({
        warden: {
          name: 'Hameed Khan',
          qualification: 'Master of Public Administration (Peshawar University)',
          experience: '12 Years in Student Housing Management',
          message: 'Welcome to KP Youth Hostel. Our aim is to provide you a home away from home.',
          bio: 'Hameed Khan holds a Masters in Public Administration and has overseen student boarding facilities for 12 years.',
          image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
        },
        md: {
          name: 'Director KP Youth Affairs',
          vision: 'To build modern, digitized youth hostels across KP, promoting academic success.',
          message: 'This hostel represents our commitment to the youth of KP.',
          bio: 'The Managing Director focuses on implementing government policies for youth development.',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'
        },
        contact: {
          email: 'info@kpyouthhostel.com',
          phone: '+92-91-9216701',
          whatsApp: '+92-300-1234567'
        },
        location: {
          address: 'University Road, Zoo Street, Rahatabad, Peshawar, Khyber Pakhtunkhwa',
          googleMapUrl: 'https://www.google.com/maps/embed?...',
          nearbyUniversities: [
            'University of Peshawar (UoP) - 1.2 km',
            'University of Engineering & Technology (UET) - 1.5 km'
          ]
        },
        system: {
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUser: 'notifications@kpyouthhostel.com',
          smtpPass: '••••••••••••••••',
          twilioSid: 'AC9876543210abcdef',
          twilioToken: '••••••••••••••••',
          twilioPhone: 'whatsapp:+14155238886'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const data = await apiRequest('/hostel', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      if (data.success) {
        setSuccessMsg('System configuration and profiles updated successfully.');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Failed to update configurations. Mock saved.');
      setSuccessMsg('Configurations successfully simulated.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddUniversity = () => {
    if (!nearbyInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        nearbyUniversities: [...prev.location.nearbyUniversities, nearbyInput.trim()]
      }
    }));
    setNearbyInput('');
  };

  const handleRemoveUniversity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        nearbyUniversities: prev.location.nearbyUniversities.filter((_, i) => i !== index)
      }
    }));
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-450">Loading configurations editor...</div>;
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          System Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          Edit public Warden/MD profiles, configure geolocation address, and customize SMTP/Twilio credentials.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-3 border-b-2 font-medium text-xs tracking-wider uppercase transition-all duration-200 ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Leadership Bios
        </button>
        <button
          onClick={() => setActiveTab('hostel')}
          className={`px-5 py-3 border-b-2 font-medium text-xs tracking-wider uppercase transition-all duration-200 ${
            activeTab === 'hostel'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Contact & Location
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-5 py-3 border-b-2 font-medium text-xs tracking-wider uppercase transition-all duration-200 ${
            activeTab === 'system'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          System Credentials
        </button>
      </div>

      {/* Feedback Alerts */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
          <Check className="w-5 h-5 flex-shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form editor */}
      <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8">
        
        {/* TAB 1: LEADERSHIP BIOS */}
        {activeTab === 'profile' && (
          <div className="space-y-8 text-xs">
            {/* Warden Bio Section */}
            <div>
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm mb-4 pb-2 border-b border-slate-100 dark:border-slate-850 flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Warden Contact Settings</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Warden Name</label>
                  <input
                    type="text" value={formData.warden.name}
                    onChange={(e) => setFormData({ ...formData, warden: { ...formData.warden, name: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Qualifications</label>
                  <input
                    type="text" value={formData.warden.qualification}
                    onChange={(e) => setFormData({ ...formData, warden: { ...formData.warden, qualification: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Warden Message Quote (Landing Page)</label>
                  <input
                    type="text" value={formData.warden.message}
                    onChange={(e) => setFormData({ ...formData, warden: { ...formData.warden, message: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Full Professional Bio Message</label>
                  <textarea
                    rows={3} value={formData.warden.bio}
                    onChange={(e) => setFormData({ ...formData, warden: { ...formData.warden, bio: e.target.value } })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* MD Bio Section */}
            <div>
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm mb-4 pb-2 border-b border-slate-100 dark:border-slate-855 flex items-center space-x-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>Managing Director Settings</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">MD Name / Designation</label>
                  <input
                    type="text" value={formData.md.name}
                    onChange={(e) => setFormData({ ...formData, md: { ...formData.md, name: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Directorate Vision Summary</label>
                  <input
                    type="text" value={formData.md.vision}
                    onChange={(e) => setFormData({ ...formData, md: { ...formData.md, vision: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">MD Message Quote (Landing Page)</label>
                  <input
                    type="text" value={formData.md.message}
                    onChange={(e) => setFormData({ ...formData, md: { ...formData.md, message: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONTACT & LOCATION */}
        {activeTab === 'hostel' && (
          <div className="space-y-8 text-xs">
            {/* Contacts */}
            <div>
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm mb-4 pb-2 border-b border-slate-100 dark:border-slate-855 flex items-center space-x-2">
                <Settings className="w-4 h-4 text-blue-600" />
                <span>Public Contact Channels</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Public Email</label>
                  <input
                    type="email" value={formData.contact.email}
                    onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Office Landline</label>
                  <input
                    type="text" value={formData.contact.phone}
                    onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">WhatsApp Inquiry Number</label>
                  <input
                    type="text" value={formData.contact.whatsApp}
                    onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, whatsApp: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm mb-4 pb-2 border-b border-slate-100 dark:border-slate-855 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Geographic Location</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Physical Campus Address</label>
                  <input
                    type="text" value={formData.location.address}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Google Maps Iframe Embed URL</label>
                  <input
                    type="text" value={formData.location.googleMapUrl}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, googleMapUrl: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>
                
                {/* Nearby Universities Tags */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Nearby Educational Institutions</label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text" value={nearbyInput}
                      onChange={(e) => setNearbyInput(e.target.value)}
                      placeholder="e.g. UET Peshawar - 1.5 km"
                      className="flex-1 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                    />
                    <button
                      type="button" onClick={handleAddUniversity}
                      className="px-4 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold"
                    >
                      Add Tag
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.location.nearbyUniversities.map((uni, idx) => (
                      <span key={idx} className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        <span>{uni}</span>
                        <button type="button" onClick={() => handleRemoveUniversity(idx)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM CREDENTIALS */}
        {activeTab === 'system' && (
          <div className="space-y-8 text-xs">
            {/* SMTP Settings */}
            <div>
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-855">
                <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                  <Key className="w-4 h-4 text-blue-600" />
                  <span>SMTP E-Mail Server Settings</span>
                </h3>
                <button
                  type="button" onClick={() => setShowSecrets(!showSecrets)}
                  className="text-blue-500 hover:text-blue-400 text-xs font-semibold"
                >
                  {showSecrets ? 'Hide Passwords' : 'View Passwords'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">SMTP Host Address</label>
                  <input
                    type="text" value={formData.system.smtpHost}
                    onChange={(e) => setFormData({ ...formData, system: { ...formData.system, smtpHost: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                    placeholder="e.g. smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Port</label>
                  <input
                    type="number" value={formData.system.smtpPort}
                    onChange={(e) => setFormData({ ...formData, system: { ...formData.system, smtpPort: parseInt(e.target.value, 10) } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">SMTP Security</label>
                  <select className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950 text-slate-855 dark:text-white">
                    <option>TLS (STARTTLS)</option>
                    <option>SSL</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">User Login ID</label>
                  <input
                    type="text" value={formData.system.smtpUser}
                    onChange={(e) => setFormData({ ...formData, system: { ...formData.system, smtpUser: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-855 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Password</label>
                  <input
                    type={showSecrets ? 'text' : 'password'}
                    value={formData.system.smtpPass}
                    onChange={(e) => setFormData({ ...formData, system: { ...formData.system, smtpPass: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-855 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Twilio Settings */}
            <div>
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm mb-4 pb-2 border-b border-slate-100 dark:border-slate-855 flex items-center space-x-2">
                <Key className="w-4 h-4 text-emerald-600" />
                <span>Twilio WhatsApp API Credentials</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Twilio Account SID</label>
                  <input
                    type="text" value={formData.system.twilioSid}
                    onChange={(e) => setFormData({ ...formData, system: { ...formData.system, twilioSid: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Sender Number (WhatsApp)</label>
                  <input
                    type="text" value={formData.system.twilioPhone}
                    onChange={(e) => setFormData({ ...formData, system: { ...formData.system, twilioPhone: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:outline-none"
                    placeholder="e.g. whatsapp:+14155238886"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Twilio Auth Token</label>
                  <input
                    type={showSecrets ? 'text' : 'password'}
                    value={formData.system.twilioToken}
                    onChange={(e) => setFormData({ ...formData, system: { ...formData.system, twilioToken: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-855 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form save buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 h-11 rounded-xl btn-gradient text-xs font-semibold"
          >
            {submitting ? 'Saving Configurations...' : 'Save Configuration'}
          </button>
        </div>

      </form>

    </div>
  );
}
