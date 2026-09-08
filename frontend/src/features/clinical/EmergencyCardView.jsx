import React, { useState, useEffect, useRef } from 'react';
import {
  Phone, AlertTriangle, Heart, Shield, Activity,
  Pill, User, Droplet, Clock, Stethoscope, Share2,
  PhoneCall, AlertOctagon, CheckCircle2, Siren,
  Smartphone, MapPin, Building2, Copy, Check
} from 'lucide-react';
import apiClient from '../../api/client';

export default function EmergencyCardView({ patientId = 'PT-89421' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shakeTriggered, setShakeTriggered] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [motionSupported, setMotionSupported] = useState(false);

  // 1. Fetch Public Emergency Profile
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await apiClient.get(`/api/v1/emergency/${patientId}`);
        setData(res);
      } catch (err) {
        setError(err.message || 'Unable to load this patient emergency record.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [patientId]);

  // 2. Shake-to-Call Accelerometer Listener (DeviceMotionEvent)
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = 0;
    const SHAKE_THRESHOLD = 18; // Acceleration threshold (m/s²)

    function handleMotion(e) {
      setMotionSupported(true);
      const current = e.accelerationIncludingGravity;
      if (!current) return;

      const currentTime = Date.now();
      if (currentTime - lastTime > 100) {
        const diffTime = currentTime - lastTime;
        lastTime = currentTime;

        const speed = Math.abs(current.x + current.y + current.z - lastX - lastY - lastZ) / diffTime * 10000;
        if (speed > SHAKE_THRESHOLD * 10) {
          setShakeTriggered(true);
        }

        lastX = current.x;
        lastY = current.y;
        lastZ = current.z;
      }
    }

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, []);

  const primaryContact = data?.emergency_contacts?.find((c) => c.is_primary) || {
    name: 'No primary contact listed',
    phone: '',
    relation: 'Not provided',
  };

  const INDIA_HELPLINES = [
    { code: '108', title: 'Ambulance / Medical', desc: 'National Emergency Medical Service', color: 'bg-red-600', icon: Siren },
    { code: '112', title: 'National Emergency', desc: 'All-in-One Unified Response', color: 'bg-rose-700', icon: AlertOctagon },
    { code: '100', title: 'Police Helpline', desc: 'Emergency Police Assistance', color: 'bg-blue-700', icon: Shield },
    { code: '101', title: 'Fire Services', desc: 'Emergency Fire & Rescue', color: 'bg-amber-600', icon: AlertTriangle },
    { code: '1091', title: 'Women Safety', desc: 'National Women Helpline', color: 'bg-purple-700', icon: Heart },
    { code: '1075', title: 'Health Helpline', desc: 'National Health Services (MoHFW)', color: 'bg-teal-700', icon: Stethoscope },
  ];

  if (loading) {
    return (
      <div className="emergency-page emergency-loading">
        <div className="w-12 h-12 rounded-full border-2 border-red-500 border-t-transparent animate-spin mb-4" />
        <h2 className="text-sm font-mono font-bold tracking-widest uppercase text-red-400">Loading Medical Emergency Record...</h2>
        <p className="text-xs text-slate-400 font-mono mt-1">Authenticating WORM Cryptographic Seal</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="emergency-page emergency-loading">
        <div className="emergency-error-card">
          <AlertOctagon size={30} />
          <h2>Emergency record unavailable</h2>
          <p>{error || 'No verified patient record was returned by the clinical API.'}</p>
          <span>Patient ID: {patientId}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="emergency-page">
      {/* ── Emergency Top Bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#0C0E14]/95 border-b border-[#252935] backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500 flex items-center justify-center">
            <Siren className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-black tracking-widest uppercase text-red-400 flex items-center gap-1.5">
              <span>CRITICAL MEDICAL PASSPORT</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            </div>
            <div className="text-xs font-bold text-slate-200 font-mono">Q-MEDSENSE EMERGENCY</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Shake Simulator Button */}
          <button
            onClick={() => setShakeTriggered(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-[10px] font-mono font-bold text-red-300 transition active:scale-95 shadow-lg"
          >
            <Smartphone className="w-3 h-3 animate-bounce" />
            <span>Shake / Call</span>
          </button>
        </div>
      </header>

      {/* ── Shake-to-Call Emergency Trigger Modal ──────────────────────────── */}
      {shakeTriggered && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-5 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center mb-4 animate-pulse">
            <PhoneCall className="w-10 h-10 text-red-500" />
          </div>

          <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-400">
            EMERGENCY CALL PROTOCOL ACTIVATED
          </span>
          <h2 className="text-2xl font-black text-white mt-1 mb-1 font-display">
            Call Primary Contact Now?
          </h2>
          <p className="text-xs text-slate-400 font-mono max-w-xs mb-6">
            Immediate dialer trigger for <span className="text-white font-bold">{data?.name}</span>'s emergency contact:
          </p>

          <div className="w-full max-w-sm p-4 rounded-2xl bg-[#12141D] border border-red-500/40 space-y-3 mb-6 shadow-2xl">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Contact Person:</span>
              <span className="font-bold text-white text-sm">{primaryContact.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Relationship:</span>
              <span className="font-bold text-[#D4AF37]">{primaryContact.relation}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Phone Number:</span>
              <span className="font-bold text-red-400 font-mono text-sm">{primaryContact.phone}</span>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-2.5">
            <a
              href={`tel:${primaryContact.phone.replace(/[^0-9+]/g, '')}`}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white text-base font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl shadow-red-600/50 hover:brightness-110 active:scale-95 transition"
            >
              <PhoneCall className="w-5 h-5" />
              <span>DIAL {primaryContact.phone}</span>
            </a>

            <a
              href="tel:108"
              className="w-full py-3 rounded-2xl bg-[#1A1E29] border border-slate-700 text-slate-200 text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-800 transition"
            >
              <Siren className="w-4 h-4 text-red-400" />
              <span>Or Call 108 (Ambulance Hotline)</span>
            </a>

            <button
              onClick={() => setShakeTriggered(false)}
              className="w-full py-2.5 text-xs text-slate-500 font-mono hover:text-slate-300 transition"
            >
              Cancel / Dismiss Overlay
            </button>
          </div>
        </div>
      )}

      {/* ── Main Mobile Content Container ──────────────────────────────────── */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* 1. Critical Medical Alert Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/60 via-[#150B0E] to-[#0A0B0E] border-2 border-red-600/70 shadow-2xl space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-red-400">
                PATIENT IDENTITY
              </div>
              <h1 className="text-xl font-black text-white tracking-tight uppercase font-display">
                {data?.name}
              </h1>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {data?.age} Yrs · {data?.gender} · MRN: <span className="text-slate-200">{data?.mrn}</span>
              </div>
            </div>

            {/* Blood Group Hero Badge */}
            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-red-600 border-2 border-red-400 text-white shadow-xl shadow-red-600/30">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider opacity-90 leading-none">BLOOD</span>
              <span className="text-xl font-black tracking-tight">{data?.blood_group}</span>
            </div>
          </div>

          {/* Quick Critical Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {data?.organ_donor && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300 flex items-center gap-1">
                <Heart className="w-3 h-3 text-emerald-400" /> ORGAN DONOR: YES
              </span>
            )}
            <span className="px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-[10px] font-mono font-bold text-red-300">
              ⚠ SEVERE ALLERGIES
            </span>
          </div>
        </div>

        {/* 2. Direct Emergency Contact Card */}
        <div className="p-4 rounded-2xl bg-[#0F1118] border border-[#252938] shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-red-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Primary Emergency Contact
              </h3>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-red-600/20 text-red-300 font-bold border border-red-500/30">
              NEXT OF KIN
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#141722] border border-[#232736] flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white font-mono">{primaryContact.name}</div>
              <div className="text-[11px] text-[#D4AF37] font-mono">{primaryContact.relation}</div>
              <div className="text-xs font-mono text-slate-300 mt-1">{primaryContact.phone}</div>
            </div>

            <a
              href={`tel:${primaryContact.phone.replace(/[^0-9+]/g, '')}`}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-600/30 active:scale-95 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          </div>

          {/* Secondary Contact if present */}
          {data?.emergency_contacts?.[1] && (
            <div className="p-2.5 rounded-xl bg-[#12141D] border border-[#1E222D] flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-200 font-mono">{data.emergency_contacts[1].name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{data.emergency_contacts[1].relation}</div>
              </div>
              <a
                href={`tel:${data.emergency_contacts[1].phone.replace(/[^0-9+]/g, '')}`}
                className="px-3 py-1.5 rounded-lg bg-[#1D212E] border border-slate-700 text-slate-200 font-mono text-[11px] font-bold hover:bg-slate-700 transition"
              >
                Dial
              </a>
            </div>
          )}
        </div>

        {/* 3. Severe Allergies & Alerts */}
        <div className="p-4 rounded-2xl bg-[#0F1118] border border-[#252938] shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Known Allergies & Anaphylaxis Alerts
            </h3>
          </div>

          <div className="space-y-2">
            {data?.allergies?.map((alg, idx) => {
              const allergenName = typeof alg === 'string' ? alg : (alg?.allergen || alg?.name || 'Allergen');
              const severity = (typeof alg === 'object' && alg?.severity) ? alg.severity : 'HIGH';
              const reaction = (typeof alg === 'object' && alg?.reaction) ? alg.reaction : 'Allergic sensitivity';
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-red-950/25 border border-red-900/50 flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-bold text-red-200 font-mono flex items-center gap-1.5">
                      <span>{allergenName}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-600 text-white font-black uppercase">
                        {severity}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{reaction}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Active Medications */}
        <div className="p-4 rounded-2xl bg-[#0F1118] border border-[#252938] shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Active Medications & Regimen
            </h3>
          </div>

          <div className="space-y-2">
            {data?.medications?.map((med, idx) => {
              const medName = typeof med === 'string' ? med : (med?.name || 'Medication');
              const frequency = (typeof med === 'object' && med?.frequency) ? med.frequency : 'Daily Regimen';
              const dose = (typeof med === 'object' && med?.dose) ? med.dose : 'Standard';
              return (
                <div key={idx} className="p-3 rounded-xl bg-[#141722] border border-[#232736] flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-slate-100 font-mono">{medName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{frequency}</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-1 rounded bg-cyan-950/60 border border-cyan-800/40">
                    {dose}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Baseline Vitals & Medical History */}
        <div className="p-4 rounded-2xl bg-[#0F1118] border border-[#252938] shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Baseline Vitals & Conditions
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-[#141722] border border-[#232736]">
              <div className="text-[10px] text-slate-500 font-mono">Blood Pressure</div>
              <div className="text-xs font-bold font-mono text-slate-100 mt-0.5">{data?.baseline_vitals?.blood_pressure || '120/80 mmHg'}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#141722] border border-[#232736]">
              <div className="text-[10px] text-slate-500 font-mono">Resting Heart Rate</div>
              <div className="text-xs font-bold font-mono text-slate-100 mt-0.5">{data?.baseline_vitals?.heart_rate_bpm || 72} bpm</div>
            </div>
          </div>

          <div className="pt-1">
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1.5">Diagnosed Conditions</div>
            <div className="flex flex-wrap gap-1.5">
              {data?.conditions?.map((cond, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#1A1D28] border border-[#2B303E] text-[10px] font-mono text-slate-300">
                  {typeof cond === 'string' ? cond : (cond?.name || cond?.condition || 'Clinical Condition')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 6. India Emergency Speed Dial Grid */}
        <div className="p-4 rounded-2xl bg-[#0F1118] border border-[#252938] shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Siren className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                India Emergency Speed Dial
              </h3>
            </div>
            <span className="text-[9px] font-mono text-slate-500">Toll-Free 24x7</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {INDIA_HELPLINES.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.code}
                  href={`tel:${item.code}`}
                  className="p-3 rounded-xl bg-[#141722] border border-[#252938] hover:border-red-500/60 active:scale-95 transition flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base font-black font-mono text-white">{item.code}</span>
                    <div className={`w-6 h-6 rounded-lg ${item.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-slate-200 font-mono leading-tight">{item.title}</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5 truncate">{item.desc}</div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Footer Security Verification */}
        <div className="p-4 text-center rounded-2xl bg-[#0A0B0E] border border-[#1E212A] space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#D4AF37] font-mono font-bold">
            <Shield className="w-3 h-3" />
            <span>WORM AUDIT VERIFIED MEDICAL RECORD</span>
          </div>
          <p className="text-[9px] text-slate-600 font-mono">
            Cryptographic SHA-256 Seal · Verified by Q-MedSense Health Authority Network
          </p>
        </div>
      </main>
    </div>
  );
}
