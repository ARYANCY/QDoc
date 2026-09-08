import React, { useState } from 'react';
import { useTwinStore } from '../store/twinStore';
import { DISEASE_REGISTRY } from '../data/diseaseRegistry';
import BreastCancerControls from '../diseases/BreastCancerControls';
import HeartDiseaseControls from '../diseases/HeartDiseaseControls';
import DiabetesControls from '../diseases/DiabetesControls';
import PneumoniaControls from '../diseases/PneumoniaControls';
import LiverDiseaseControls from '../diseases/LiverDiseaseControls';
import {
  User, Activity, Pill, Heart, Clock, AlertTriangle,
  ChevronDown, ChevronRight, Plus, Trash2, Search,
  Loader2, UserCheck, Stethoscope, Dna, FlaskConical,
  X, Check, Building2
} from 'lucide-react';

// ── Reusable Components ───────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, color = 'text-[#D4AF37]' }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-mono">{title}</span>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder = '', className = '' }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#14161F] border border-[#262B38] rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all font-mono"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, className = '' }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#14161F] border border-[#262B38] rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-[#D4AF37] transition-all appearance-none cursor-pointer font-mono"
      >
        {options.map(([val, lbl]) => (
          <option key={val} value={val} className="bg-[#14161F] text-slate-200">{lbl}</option>
        ))}
      </select>
    </div>
  );
}

function VitalInput({ label, value, onChange, unit, placeholder }) {
  return (
    <div className="space-y-1">
      {label && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">{label}</label>}
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#14161F] border border-[#262B38] rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 pr-9 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all font-mono"
        />
        {unit && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#D4AF37] font-mono pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Tab Definitions ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile',    label: 'Profile',      icon: User },
  { id: 'history',    label: 'History',      icon: Clock },
  { id: 'meds',       label: 'Medications',  icon: Pill },
  { id: 'vitals',     label: 'Vitals',       icon: Activity },
  { id: 'disease',    label: 'Analysis',     icon: Stethoscope },
];

const COMMON_SYMPTOMS = [
  'Chest Pain', 'Shortness of Breath', 'Fatigue', 'Fever', 'Cough',
  'Palpitations', 'Dizziness', 'Headache', 'Nausea', 'Abdominal Pain',
  'Joint Pain', 'Swollen Lymph Nodes', 'Weight Loss', 'Night Sweats',
  'Edema (Swelling)', 'Vision Changes', 'Numbness / Tingling', 'Back Pain'
];

const BLOOD_TYPES = ['', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];
const AGE_GROUPS  = [['<18','<18 yrs'], ['18-40','18–40 yrs'], ['40-60','40–60 yrs'], ['60+','60+ yrs']];

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab() {
  const patient          = useTwinStore((s) => s.patient);
  const setPatientField  = useTwinStore((s) => s.setPatientField);
  const toggleSymptom    = useTwinStore((s) => s.toggleSymptom);
  const loadPatientFromDB = useTwinStore((s) => s.loadPatientFromDB);
  const patientMode      = useTwinStore((s) => s.patientMode);
  const clearPatient     = useTwinStore((s) => s.clearPatient);

  const [searchId, setSearchId] = useState(patient.patientId || '');

  const handleLoad = () => {
    if (searchId.trim()) loadPatientFromDB(searchId.trim());
  };

  return (
    <div className="space-y-4">
      {/* DB Patient Search */}
      <div className="p-3 rounded-xl bg-gradient-to-br from-[#14161F] to-[#0D0E14] border border-[#2A2F3D] shadow-md">
        <SectionHeader icon={Search} title="Database Patient Lookup" color="text-[#D4AF37]" />
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
              placeholder="Patient ID (e.g. PT-89421)"
              className="w-full bg-[#0B0C10] border border-[#282C38] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all font-mono pr-8"
            />
            {patientMode === 'loading' && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#D4AF37] animate-spin" />
            )}
            {patientMode === 'active' && (
              <UserCheck className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#0F766E]" />
            )}
          </div>
          <button
            onClick={handleLoad}
            disabled={patientMode === 'loading' || !searchId.trim()}
            className="px-3 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-40 text-black text-xs font-bold font-mono transition-all active:scale-95 shrink-0"
          >
            Fetch
          </button>
          {patientMode === 'active' && (
            <button
              onClick={() => { clearPatient(); setSearchId(''); }}
              className="p-2 rounded-lg bg-[#181A22] hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-[#2D313E] transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {patientMode === 'active' && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#2DD4BF] font-mono font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
            Analysis synchronized — 3D Twin is reflecting live clinical records
          </div>
        )}
      </div>

      {/* Identity */}
      <div className="space-y-3 pt-1">
        <SectionHeader icon={User} title="Patient Demographics" />
        <div className="grid grid-cols-2 gap-2">
          <InputField label="First Name" value={patient.firstName} onChange={(v) => setPatientField('firstName', v)} placeholder="First name" />
          <InputField label="Last Name" value={patient.lastName} onChange={(v) => setPatientField('lastName', v)} placeholder="Last name" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <InputField label="Date of Birth" value={patient.dateOfBirth} onChange={(v) => setPatientField('dateOfBirth', v)} type="date" />
          <SelectField label="Blood Type" value={patient.bloodType} onChange={(v) => setPatientField('bloodType', v)}
            options={BLOOD_TYPES.map(b => [b, b || 'Unknown'])} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <InputField label="Height (cm)" value={patient.heightCm} onChange={(v) => setPatientField('heightCm', v)} type="number" placeholder="175" />
          <InputField label="Weight (kg)" value={patient.weightKg} onChange={(v) => setPatientField('weightKg', v)} type="number" placeholder="70" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Anatomical Model</label>
            <div className="grid grid-cols-2 gap-1.5">
              {['female', 'male'].map((s) => (
                <button
                  key={s}
                  onClick={() => setPatientField('sex', s)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all border capitalize font-mono ${
                    patient.sex === s
                      ? 'bg-[#181A24] border-[#D4AF37] text-[#D4AF37] shadow-inner'
                      : 'bg-[#12141A] border-[#252933] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Age Cohort</label>
            <div className="grid grid-cols-2 gap-1">
              {AGE_GROUPS.map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setPatientField('ageGroup', val)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold transition-all border font-mono ${
                    patient.ageGroup === val
                      ? 'bg-[#181A24] border-[#D4AF37] text-[#D4AF37]'
                      : 'bg-[#12141A] border-[#252933] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Symptoms */}
      <div className="space-y-2 pt-2 border-t border-[#1F232D]">
        <SectionHeader icon={AlertTriangle} title="Clinical Symptoms (Multi-Select)" color="text-amber-400" />
        <div className="flex flex-wrap gap-1.5">
          {COMMON_SYMPTOMS.map((symptom) => {
            const active = patient.symptoms.includes(symptom);
            return (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all border ${
                  active
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                    : 'bg-[#12141A] border-[#252933] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                {active && <span className="mr-1">✓</span>}
                {symptom}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clinical Notes */}
      <div className="space-y-1 pt-2 border-t border-[#1F232D]">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Clinical Notes & Observations</label>
        <textarea
          value={patient.notes}
          onChange={(e) => setPatientField('notes', e.target.value)}
          placeholder="Physician observations, referral rationale, treatment response..."
          rows={3}
          className="w-full bg-[#14161F] border border-[#262B38] rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all resize-none leading-relaxed font-mono"
        />
      </div>
    </div>
  );
}

// ── History Tab ────────────────────────────────────────────────────────────────
function HistoryTab() {
  const patient             = useTwinStore((s) => s.patient);
  const addMedicalHistory   = useTwinStore((s) => s.addMedicalHistory);
  const removeMedicalHistory = useTwinStore((s) => s.removeMedicalHistory);
  const updateMedicalHistory = useTwinStore((s) => s.updateMedicalHistory);
  const setPatientNested    = useTwinStore((s) => s.setPatientNested);
  const addAllergy          = useTwinStore((s) => s.addAllergy);
  const removeAllergy       = useTwinStore((s) => s.removeAllergy);

  const FAMILY_CONDITIONS = [
    ['heartDisease', 'Heart Disease'], ['diabetes', 'Diabetes'],
    ['cancer', 'Cancer'], ['hypertension', 'Hypertension'],
    ['stroke', 'Stroke'], ['mentalHealth', 'Mental Health']
  ];

  return (
    <div className="space-y-5">
      {/* Medical History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader icon={Clock} title="Medical History" color="text-violet-400" />
          <button
            onClick={() => addMedicalHistory({})}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/15 border border-violet-500/30 text-[10px] text-violet-300 font-mono font-bold hover:bg-violet-500/25 transition-all"
          >
            <Plus className="w-3 h-3" /> Add Record
          </button>
        </div>
        {patient.medicalHistory.length === 0 ? (
          <div className="text-center py-4 text-[11px] text-slate-500 border border-dashed border-[#242833] rounded-xl font-mono">
            No medical history records logged
          </div>
        ) : (
          <div className="space-y-2">
            {patient.medicalHistory.map((entry) => (
              <div key={entry.id} className="p-3 rounded-xl bg-[#13151D] border border-[#242834] space-y-2">
                <div className="flex gap-2">
                  <input
                    value={entry.condition}
                    onChange={(e) => updateMedicalHistory(entry.id, { condition: e.target.value })}
                    placeholder="Diagnosis / Condition"
                    className="flex-1 bg-[#0D0E14] border border-[#222530] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 font-mono"
                  />
                  <button onClick={() => removeMedicalHistory(entry.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={entry.diagnosedYear}
                    onChange={(e) => updateMedicalHistory(entry.id, { diagnosedYear: e.target.value })}
                    placeholder="Year"
                    type="number"
                    className="bg-[#0D0E14] border border-[#222530] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
                  />
                  <select
                    value={entry.status}
                    onChange={(e) => updateMedicalHistory(entry.id, { status: e.target.value })}
                    className="bg-[#0D0E14] border border-[#222530] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                    <option value="chronic">Chronic</option>
                    <option value="managed">Managed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Allergies */}
      <div className="pt-2 border-t border-[#1F232D]">
        <div className="flex items-center justify-between mb-3">
          <SectionHeader icon={AlertTriangle} title="Known Allergies" color="text-red-400" />
          <button
            onClick={() => addAllergy({})}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-[10px] text-red-300 font-mono font-bold hover:bg-red-500/25 transition-all"
          >
            <Plus className="w-3 h-3" /> Add Allergy
          </button>
        </div>
        {patient.allergies.length === 0 ? (
          <div className="text-center py-4 text-[11px] text-slate-500 border border-dashed border-[#242833] rounded-xl font-mono">
            No known allergies recorded
          </div>
        ) : (
          <div className="space-y-2">
            {patient.allergies.map((allergy) => (
              <div key={allergy.id} className="p-3 rounded-xl bg-red-950/20 border border-red-900/40 space-y-2">
                <div className="flex gap-2">
                  <input
                    value={allergy.allergen}
                    onChange={(e) => {}}
                    placeholder="Allergen (e.g. Penicillin)"
                    className="flex-1 bg-[#0D0E14] border border-red-900/40 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-mono"
                  />
                  <button onClick={() => removeAllergy(allergy.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Family History */}
      <div className="pt-2 border-t border-[#1F232D]">
        <SectionHeader icon={Dna} title="Hereditary Family Risk" color="text-[#D4AF37]" />
        <div className="grid grid-cols-2 gap-1.5">
          {FAMILY_CONDITIONS.map(([key, label]) => {
            const active = patient.familyHistory[key];
            return (
              <button
                key={key}
                onClick={() => setPatientNested('familyHistory', key, !active)}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all border font-mono ${
                  active
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#D4AF37] font-bold'
                    : 'bg-[#12141A] border-[#252933] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                  active ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-slate-700'
                }`}>
                  {active && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                </div>
                <span className="text-[11px]">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Medications Tab ────────────────────────────────────────────────────────────
function MedicationsTab() {
  const patient        = useTwinStore((s) => s.patient);
  const addMedication  = useTwinStore((s) => s.addMedication);
  const removeMedication = useTwinStore((s) => s.removeMedication);
  const updateMedication = useTwinStore((s) => s.updateMedication);

  const FREQUENCIES = [
    ['od','Once daily (OD)'], ['bd','Twice daily (BD)'], ['tds','Three times (TDS)'],
    ['qds','Four times (QDS)'], ['prn','As needed (PRN)'], ['weekly','Weekly'],
    ['monthly','Monthly']
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader icon={Pill} title="Active Prescription Regimen" color="text-cyan-400" />
        <button
          onClick={() => addMedication({})}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono font-bold hover:bg-cyan-500/25 transition-all"
        >
          <Plus className="w-3 h-3" /> Add Medication
        </button>
      </div>

      {patient.medications.length === 0 ? (
        <div className="py-10 flex flex-col items-center gap-2 text-center border border-dashed border-[#242833] rounded-2xl">
          <Pill className="w-7 h-7 text-slate-600" />
          <p className="text-xs text-slate-400 font-mono">No active medications registered</p>
        </div>
      ) : (
        <div className="space-y-3">
          {patient.medications.map((med, idx) => (
            <div key={med.id} className="p-3.5 rounded-xl bg-[#13151D] border border-[#262A36] space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest font-mono">
                  Rx #{idx + 1}
                </span>
                <button onClick={() => removeMedication(med.id)} className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                value={med.name}
                onChange={(e) => updateMedication(med.id, { name: e.target.value })}
                placeholder="Drug name (e.g. Atorvastatin 20mg)"
                className="w-full bg-[#0B0C10] border border-[#242834] rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500 transition-all"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={med.dose}
                  onChange={(e) => updateMedication(med.id, { dose: e.target.value })}
                  placeholder="Dose"
                  className="bg-[#0B0C10] border border-[#242834] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                />
                <select
                  value={med.frequency}
                  onChange={(e) => updateMedication(med.id, { frequency: e.target.value })}
                  className="bg-[#0B0C10] border border-[#242834] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                >
                  <option value="">Frequency...</option>
                  {FREQUENCIES.map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Vitals Tab ─────────────────────────────────────────────────────────────────
function VitalsTab() {
  const patient          = useTwinStore((s) => s.patient);
  const setPatientNested = useTwinStore((s) => s.setPatientNested);
  const v = patient.vitals;
  const upd = (key, val) => setPatientNested('vitals', key, val);

  const bpRisk = v.bloodPressureSystolic > 140 || v.bloodPressureDiastolic > 90;
  const hrRisk = v.heartRate && (v.heartRate < 50 || v.heartRate > 100);
  const spo2Risk = v.spo2 && v.spo2 < 95;

  return (
    <div className="space-y-4">
      <SectionHeader icon={Activity} title="Cardiopulmonary & Cellular Vitals" color="text-rose-400" />
      <div className="p-3.5 rounded-xl bg-[#13151E] border border-[#262A38] space-y-2">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="font-bold text-slate-300">Blood Pressure</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${bpRisk ? 'bg-red-950/60 text-red-300' : 'bg-emerald-950/60 text-emerald-300'}`}>
            {bpRisk ? '⚠ Elevated' : '✓ Normal'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <VitalInput label="Systolic" value={v.bloodPressureSystolic} onChange={(val) => upd('bloodPressureSystolic', val)} unit="mmHg" placeholder="120" />
          <VitalInput label="Diastolic" value={v.bloodPressureDiastolic} onChange={(val) => upd('bloodPressureDiastolic', val)} unit="mmHg" placeholder="80" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl bg-[#13151E] border border-[#262A38] space-y-1">
          <span className="text-[10px] font-bold text-slate-400 font-mono">Heart Rate</span>
          <VitalInput label="" value={v.heartRate} onChange={(val) => upd('heartRate', val)} unit="bpm" placeholder="72" />
        </div>
        <div className="p-3 rounded-xl bg-[#13151E] border border-[#262A38] space-y-1">
          <span className="text-[10px] font-bold text-slate-400 font-mono">SpO₂</span>
          <VitalInput label="" value={v.spo2} onChange={(val) => upd('spo2', val)} unit="%" placeholder="99" />
        </div>
      </div>
    </div>
  );
}

// ── Disease Tab ────────────────────────────────────────────────────────────────
function DiseaseTab() {
  const selectedDisease = useTwinStore((s) => s.selectedDisease);
  const setDisease      = useTwinStore((s) => s.setDisease);
  const patientMode     = useTwinStore((s) => s.patientMode);
  const diseases        = Object.values(DISEASE_REGISTRY);

  return (
    <div className="space-y-4">
      <SectionHeader icon={Stethoscope} title="Target Disease Models (5)" color="text-[#D4AF37]" />

      <div className="space-y-1.5">
        {diseases.map((d) => (
          <button
            key={d.id}
            onClick={() => setDisease(d.id)}
            className={`w-full text-left p-3 rounded-xl text-xs transition-all border flex items-center justify-between group ${
              selectedDisease === d.id
                ? 'bg-[#181B26] border-[#D4AF37] text-white shadow-md'
                : 'bg-[#101218] border-[#222530] text-slate-400 hover:bg-[#151720] hover:border-[#323644]'
            }`}
          >
            <div>
              <div className="font-bold font-mono tracking-wide">{d.name}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{d.category}</div>
            </div>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
              selectedDisease === d.id ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-[#161820] text-slate-500'
            }`}>
              {d.targetOrgans.length} organ{d.targetOrgans.length > 1 ? 's' : ''}
            </span>
          </button>
        ))}
      </div>

      <div className="pt-2 border-t border-[#1F232D] space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Simulation Parameters</label>
          <span className="text-[10px] text-[#D4AF37] font-mono font-bold">{DISEASE_REGISTRY[selectedDisease]?.name}</span>
        </div>
        {selectedDisease === 'BREAST_CANCER' && <BreastCancerControls />}
        {selectedDisease === 'HEART_DISEASE'  && <HeartDiseaseControls />}
        {selectedDisease === 'DIABETES'        && <DiabetesControls />}
        {selectedDisease === 'PNEUMONIA'       && <PneumoniaControls />}
        {selectedDisease === 'LIVER_DISEASE'   && <LiverDiseaseControls />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LEFT SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════════
export default function LeftSidebar() {
  const [activeTab, setActiveTab] = useState('profile');
  const patient     = useTwinStore((s) => s.patient);
  const patientMode = useTwinStore((s) => s.patientMode);

  const displayName = patient.firstName || patient.lastName
    ? `${patient.firstName} ${patient.lastName}`.trim()
    : patient.patientId || 'New Patient Profile';

  return (
    <aside className="w-96 h-full bg-[#090A0D] border-r border-[#20232B] flex flex-col overflow-hidden select-none z-20">
      {/* Header */}
      <div className="px-4 pt-3 pb-3 border-b border-[#20232B]">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
            patientMode === 'active'
              ? 'bg-[#0F766E]/20 border-[#0F766E] text-[#2DD4BF]'
              : 'bg-[#14161F] border-[#2B303C] text-slate-400'
          }`}>
            {patientMode === 'active' ? <UserCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-100 truncate font-mono">{displayName}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${
                patientMode === 'active' ? 'bg-[#2DD4BF] animate-pulse' : 'bg-slate-600'
              }`} />
              <span className="text-[10px] text-slate-400 font-mono capitalize">
                {patientMode === 'active' ? `DB Active (${patient.patientId})` : 'Anatomical Preview'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[#20232B] bg-[#0C0D11]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-mono font-bold transition-all border-b-2 ${
                isActive
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-[#14161F]'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-[#101217]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#252933]">
        {activeTab === 'profile'  && <ProfileTab />}
        {activeTab === 'history'  && <HistoryTab />}
        {activeTab === 'meds'     && <MedicationsTab />}
        {activeTab === 'vitals'   && <VitalsTab />}
        {activeTab === 'disease'  && <DiseaseTab />}
      </div>
    </aside>
  );
}
