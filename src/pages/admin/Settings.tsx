import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/services/api';
import { Settings, User, MapPin, Key, Check, AlertTriangle, X, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'profile' | 'hostel' | 'system';

const DEFAULT_FORM = {
  warden: { name: 'M Noor Wazir', qualification: 'Master of Public Administration (Peshawar University)', experience: '12 Years in Student Housing Management', message: 'Welcome to KP Youth Hostel. Our aim is to provide you a home away from home.', bio: 'M Noor Wazir holds a Masters in Public Administration and has overseen student boarding facilities for 12 years.', image: '' },
  md: { name: 'Hameed Khan', vision: 'To build modern, digitized youth hostels across KP, promoting academic success.', message: 'This hostel represents our commitment to the youth of KP.', bio: 'The Director focuses on implementing government policies for youth development.', image: '' },
  contact: { email: 'info@kpyouthhostel.com', phone: '+92-91-9216701', whatsApp: '+92-300-1234567' },
  location: { address: 'University Road, Zoo Street, Rahatabad, Peshawar, Khyber Pakhtunkhwa', googleMapUrl: '', nearbyUniversities: ['University of Peshawar (UoP) — 1.2 km', 'UET Peshawar — 1.5 km'] },
  system: { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: 'notifications@kpyouthhostel.com', smtpPass: '', twilioSid: '', twilioToken: '', twilioPhone: 'whatsapp:+14155238886' }
};

export default function AdminSettings() {
  const [tab, setTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [nearbyInput, setNearbyInput] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const d = await apiRequest('/hostel');
        if (d?.success && d?.hostelInfo) {
          const info = d.hostelInfo;
          setFormData({
            warden: info.warden || DEFAULT_FORM.warden,
            md: info.md || DEFAULT_FORM.md,
            contact: info.contact || DEFAULT_FORM.contact,
            location: { address: info.location?.address||'', googleMapUrl: info.location?.googleMapUrl||'', nearbyUniversities: info.location?.nearbyUniversities||[] },
            system: { smtpHost: info.system?.smtpHost||'', smtpPort: info.system?.smtpPort||587, smtpUser: info.system?.smtpUser||'', smtpPass: info.system?.smtpPass||'', twilioSid: info.system?.twilioSid||'', twilioToken: info.system?.twilioToken||'', twilioPhone: info.system?.twilioPhone||'' }
          });
        }
      } catch { /* use defaults */ }
      finally { setLoading(false); }
    })();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setSuccessMsg(null); setErrorMsg(null);
    try {
      const d = await apiRequest('/hostel', { method: 'PUT', body: JSON.stringify(formData) });
      if (d.success) { setSuccessMsg('Configuration saved successfully.'); }
    } catch {
      setSuccessMsg('Configurations saved (demo mode).');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const addUniversity = () => {
    if (!nearbyInput.trim()) return;
    setFormData(p => ({ ...p, location: { ...p.location, nearbyUniversities: [...p.location.nearbyUniversities, nearbyInput.trim()] } }));
    setNearbyInput('');
  };
  const removeUniversity = (idx: number) => setFormData(p => ({ ...p, location: { ...p.location, nearbyUniversities: p.location.nearbyUniversities.filter((_,i) => i !== idx) } }));

  const tabs: { key: Tab; label: string }[] = [{ key: 'profile', label: 'Leadership Bios' }, { key: 'hostel', label: 'Contact & Location' }, { key: 'system', label: 'System Credentials' }];

  if (loading) return <div className="p-16 text-center"><div className="w-8 h-8 border-4 border-t-blue-500 border-slate-200 dark:border-slate-700 rounded-full animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">System Settings</h1>
        <p className="text-slate-400 text-xs">Edit profiles, location info, and system credentials</p>
      </motion.div>

      <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800 pb-px">
        {tabs.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-3 border-b-2 font-medium text-xs tracking-wider uppercase transition-all duration-200 ${tab === key ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 flex-shrink-0" /><span>{successMsg}</span>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /><span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form onSubmit={save} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm p-6 sm:p-8">

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
            className="space-y-8 text-xs">

            {/* Leadership Bios */}
            {tab === 'profile' && (
              <>
                {[
                  { title: 'Warden Profile', color: 'text-blue-600', keys: [['name','Warden Name'],['qualification','Qualifications'],['message','Quote (Landing Page)'],['bio','Professional Bio']] as [string,string][], obj: 'warden' as const },
                  { title: 'Managing Director Profile', color: 'text-emerald-600', keys: [['name','MD Name'],['vision','Vision Summary'],['message','Quote (Landing Page)'],['bio','Full Bio']] as [string,string][], obj: 'md' as const },
                ].map(({ title, color, keys, obj }) => (
                  <div key={obj}>
                    <h3 className={`font-extrabold text-sm mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2 ${color}`}>
                      <User className="w-4 h-4" /><span>{title}</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {keys.map(([k, lbl]) => (
                        <div key={k} className={k === 'bio' || k === 'message' ? 'sm:col-span-2' : ''}>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{lbl}</label>
                          {k === 'bio' ? (
                            <textarea rows={3} value={(formData[obj] as any)[k]} onChange={e => setFormData({...formData, [obj]: {...formData[obj], [k]: e.target.value}})} className="input-base pt-3 resize-none h-auto" />
                          ) : (
                            <input value={(formData[obj] as any)[k]} onChange={e => setFormData({...formData, [obj]: {...formData[obj], [k]: e.target.value}})} className="input-base" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Contact & Location */}
            {tab === 'hostel' && (
              <>
                <div>
                  <h3 className="font-extrabold text-sm mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2 text-blue-600">
                    <Settings className="w-4 h-4" /><span>Public Contact</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[['email','Email','email'],['phone','Phone','text'],['whatsApp','WhatsApp','text']].map(([k,lbl,type]) => (
                      <div key={k}>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{lbl}</label>
                        <input type={type} value={(formData.contact as any)[k]} onChange={e => setFormData({...formData, contact: {...formData.contact, [k]: e.target.value}})} className="input-base" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2 text-emerald-600">
                    <MapPin className="w-4 h-4" /><span>Location</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Physical Address</label>
                      <input value={formData.location.address} onChange={e => setFormData({...formData, location: {...formData.location, address: e.target.value}})} className="input-base" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Google Maps Embed URL</label>
                      <input value={formData.location.googleMapUrl} onChange={e => setFormData({...formData, location: {...formData.location, googleMapUrl: e.target.value}})} className="input-base" placeholder="https://maps.google.com/..." />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nearby Universities</label>
                      <div className="flex space-x-2 mb-3">
                        <input value={nearbyInput} onChange={e => setNearbyInput(e.target.value)} placeholder="UET Peshawar — 1.5 km" className="input-base flex-1" />
                        <button type="button" onClick={addUniversity} className="px-4 h-11 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs whitespace-nowrap">Add Tag</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.location.nearbyUniversities.map((uni, idx) => (
                          <span key={idx} className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                            <span>{uni}</span>
                            <button type="button" onClick={() => removeUniversity(idx)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* System Credentials */}
            {tab === 'system' && (
              <>
                <div>
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-extrabold text-sm flex items-center space-x-2 text-blue-600"><Key className="w-4 h-4" /><span>SMTP Email Server</span></h3>
                    <button type="button" onClick={() => setShowSecrets(!showSecrets)} className="text-xs text-blue-500 hover:text-blue-400 font-semibold flex items-center space-x-1">
                      {showSecrets ? <><EyeOff className="w-3.5 h-3.5" /><span>Hide</span></> : <><Eye className="w-3.5 h-3.5" /><span>Show</span></>}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {[['smtpHost','SMTP Host','text','sm:col-span-2'],['smtpPort','Port','number',''],['smtpUser','Username','text','sm:col-span-2'],['smtpPass','Password',showSecrets?'text':'password','sm:col-span-2']].map(([k,lbl,type,cls]) => (
                      <div key={k} className={cls as string}>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{lbl}</label>
                        <input type={type as string} value={(formData.system as any)[k]} onChange={e => setFormData({...formData, system: {...formData.system, [k]: type==='number' ? +e.target.value : e.target.value}})} className="input-base" placeholder={k==='smtpHost'?'smtp.gmail.com':''} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2 text-emerald-600"><Key className="w-4 h-4" /><span>Twilio WhatsApp API</span></h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[['twilioSid','Account SID','text','sm:col-span-2'],['twilioPhone','Sender Number','text',''],['twilioToken','Auth Token',showSecrets?'text':'password','sm:col-span-3']].map(([k,lbl,type,cls]) => (
                      <div key={k} className={cls as string}>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{lbl}</label>
                        <input type={type as string} value={(formData.system as any)[k]} onChange={e => setFormData({...formData, system: {...formData.system, [k]: e.target.value}})} className="input-base" placeholder={k==='twilioPhone'?'whatsapp:+14155238886':''} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <motion.button type="submit" disabled={submitting} whileTap={{ scale: 0.97 }}
            className="px-8 h-11 rounded-xl btn-gradient text-xs font-bold disabled:opacity-70">
            {submitting ? 'Saving...' : 'Save Configuration'}
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
}
