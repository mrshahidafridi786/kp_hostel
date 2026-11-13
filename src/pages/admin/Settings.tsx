import React, { useState, useEffect } from 'react';
import { apiRequest, INITIAL_HOSTEL_INFO, resetDemoData } from '@/services/api';
import { Settings, User, MapPin, Key, Check, AlertTriangle, X, Eye, EyeOff, RotateCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'profile' | 'hostel' | 'system';

export default function AdminSettings() {
  const [tab, setTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [formData, setFormData] = useState(INITIAL_HOSTEL_INFO);
  const [nearbyInput, setNearbyInput] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const d = await apiRequest('/hostel');
        if (d?.success && d?.hostelInfo) {
          const info = d.hostelInfo;
          setFormData({
            ...INITIAL_HOSTEL_INFO,
            ...info,
            warden: { ...INITIAL_HOSTEL_INFO.warden, ...info.warden },
            md: { ...INITIAL_HOSTEL_INFO.md, ...info.md },
            contact: { ...INITIAL_HOSTEL_INFO.contact, ...info.contact },
            location: { ...INITIAL_HOSTEL_INFO.location, ...info.location },
            system: { ...INITIAL_HOSTEL_INFO.system, ...info.system },
          });
        }
      } catch {
        setFormData(INITIAL_HOSTEL_INFO);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      await apiRequest('/hostel', { method: 'PUT', body: JSON.stringify(formData) });
      setSuccessMsg('Settings saved successfully and persisted in local storage.');
    } catch {
      setSuccessMsg('Configuration updated (demo mode).');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleResetData = () => {
    if (!confirm('Reset all demo data (students, rooms, fee ledger, and notices) back to default?')) return;
    resetDemoData();
    setSuccessMsg('All demo datasets have been successfully restored!');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const addUniversity = () => {
    if (!nearbyInput.trim()) return;
    setFormData(p => ({
      ...p,
      location: {
        ...p.location,
        nearbyUniversities: [...(p.location.nearbyUniversities || []), nearbyInput.trim()],
      },
    }));
    setNearbyInput('');
  };

  const removeUniversity = (idx: number) => {
    setFormData(p => ({
      ...p,
      location: {
        ...p.location,
        nearbyUniversities: p.location.nearbyUniversities.filter((_, i) => i !== idx),
      },
    }));
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'Leadership & Bios' },
    { key: 'hostel', label: 'Contact & Campus Map' },
    { key: 'system', label: 'Notification Gateways' },
  ];

  if (loading) {
    return (
      <div className="p-16 text-center">
        <div className="w-8 h-8 border-4 border-t-blue-500 border-slate-200 dark:border-slate-700 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
            <Settings className="w-4 h-4" />
            <span>Platform Configuration</span>
          </div>
          <h1 className="font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            System Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Manage warden profile, hostel public contact information, and testing defaults.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="h-10 px-4 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs font-bold flex items-center space-x-2 transition-all shadow-sm self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo Store</span>
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800 pb-px">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-3 border-b-2 font-bold text-xs tracking-wider uppercase transition-all duration-200 ${
              tab === key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={save} className="space-y-6">
        {/* Leadership Bios Tab */}
        {tab === 'profile' && (
          <div className="space-y-6">
            {/* Warden Details */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Hostel Warden Profile</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Name & Title
                  </label>
                  <input
                    value={formData.warden.name}
                    onChange={e => setFormData({ ...formData, warden: { ...formData.warden, name: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Academic Qualification
                  </label>
                  <input
                    value={formData.warden.qualification}
                    onChange={e => setFormData({ ...formData, warden: { ...formData.warden, qualification: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Warden's Welcome Message
                  </label>
                  <textarea
                    rows={2}
                    value={formData.warden.message}
                    onChange={e => setFormData({ ...formData, warden: { ...formData.warden, message: e.target.value } })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Managing Director */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Executive Director Profile</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Director Name
                  </label>
                  <input
                    value={formData.md.name}
                    onChange={e => setFormData({ ...formData, md: { ...formData.md, name: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Strategic Vision
                  </label>
                  <input
                    value={formData.md.vision}
                    onChange={e => setFormData({ ...formData, md: { ...formData.md, vision: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Official Message
                  </label>
                  <textarea
                    rows={2}
                    value={formData.md.message}
                    onChange={e => setFormData({ ...formData, md: { ...formData.md, message: e.target.value } })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact & Location Tab */}
        {tab === 'hostel' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Hostel Geographic & Contact Details</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    value={formData.contact.email}
                    onChange={e => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Landline Desk
                  </label>
                  <input
                    value={formData.contact.phone}
                    onChange={e => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    WhatsApp Helpline
                  </label>
                  <input
                    value={formData.contact.whatsApp}
                    onChange={e => setFormData({ ...formData, contact: { ...formData.contact, whatsApp: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Physical Campus Address
                  </label>
                  <input
                    value={formData.location.address}
                    onChange={e => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Nearby Universities Tag Manager */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Nearby Universities & Distances
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.location.nearbyUniversities.map((uni, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      <span>{uni}</span>
                      <button
                        type="button"
                        onClick={() => removeUniversity(idx)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    value={nearbyInput}
                    onChange={e => setNearbyInput(e.target.value)}
                    placeholder="e.g. CECOS University — 2.4 km"
                    className="w-full max-w-sm h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addUniversity}
                    className="px-4 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700"
                  >
                    Add Institution
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Credentials Tab */}
        {tab === 'system' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" />
                <span>Automated SMS & Email Alert Dispatcher</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="text-xs text-blue-500 font-semibold flex items-center gap-1"
              >
                {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showSecrets ? 'Mask' : 'Reveal'} Secrets</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  SMTP Mail Host
                </label>
                <input
                  value={formData.system.smtpHost}
                  onChange={e => setFormData({ ...formData, system: { ...formData.system, smtpHost: e.target.value } })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Sender Email Address
                </label>
                <input
                  value={formData.system.smtpUser}
                  onChange={e => setFormData({ ...formData, system: { ...formData.system, smtpUser: e.target.value } })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  WhatsApp Bot Phone
                </label>
                <input
                  value={formData.system.twilioPhone}
                  onChange={e => setFormData({ ...formData, system: { ...formData.system, twilioPhone: e.target.value } })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  API Auth Secret
                </label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={formData.system.smtpPass}
                  onChange={e => setFormData({ ...formData, system: { ...formData.system, smtpPass: e.target.value } })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
          >
            {submitting ? 'Saving Configuration...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
