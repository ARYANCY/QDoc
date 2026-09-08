import React, { useState, useEffect, useRef } from 'react';
import { useTwinStore } from '../store/twinStore';
import { DISEASE_REGISTRY } from '../data/diseaseRegistry';
import BreastCancerControls from '../diseases/BreastCancerControls';
import HeartDiseaseControls from '../diseases/HeartDiseaseControls';
import DiabetesControls from '../diseases/DiabetesControls';
import PneumoniaControls from '../diseases/PneumoniaControls';
import LiverDiseaseControls from '../diseases/LiverDiseaseControls';
import {
  User, Activity, Pill, Clock, AlertTriangle,
  ChevronDown, ChevronRight, Plus, Trash2, Search,
  Loader2, UserCheck, Stethoscope, Dna, FlaskConical,
  X, Check, ShieldCheck, Heart, Wind, Thermometer,
  Sparkles, RefreshCw
} from 'lucide-react';
import gsap from 'gsap';

function SectionHeader({ icon: Icon, title, color = 'var(--dt-gold)' }) {
  return (
    <div className="dt-section-header">
      <Icon size={14} color={color} />
      <h4 className="dt-section-title">{title}</h4>
    </div>
  );
}

// ── Tab Definitions ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',   label: 'Telemetry',    icon: Activity },
  { id: 'disease',    label: 'Simulation',   icon: Stethoscope },
  { id: 'history',    label: 'History',      icon: Clock },
  { id: 'meds',       label: 'Prescriptions', icon: Pill },
];

// ── Telemetry & Overview Tab ──────────────────────────────────────────────────
function TelemetryTab() {
  const patient           = useTwinStore((s) => s.patient);
  const toggleSymptom     = useTwinStore((s) => s.toggleSymptom);
  const setPatientField   = useTwinStore((s) => s.setPatientField);
  const setPatientNested  = useTwinStore((s) => s.setPatientNested);
  const patientMode       = useTwinStore((s) => s.patientMode);

  const v = patient.vitals || {};
  const sys = Number(v.bloodPressureSystolic) || 120;
  const dia = Number(v.bloodPressureDiastolic) || 80;
  const hr  = Number(v.heartRate) || 72;
  const spo2 = Number(v.spo2) || 98;
  const temp = Number(v.temperature) || 98.6;

  const bpElevated = sys > 130 || dia > 85;
  const hrElevated = hr > 95 || hr < 55;
  const spo2Low = spo2 < 95;

  // Calculate BMI if height and weight exist
  const hM = (Number(patient.heightCm) || 175) / 100;
  const wKg = Number(patient.weightKg) || 70;
  const bmi = (wKg / (hM * hM)).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Verified Patient Demographics Badge */}
      <div className="dt-card" style={{ background: '#0D0F17', borderColor: 'var(--dt-border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.60rem', color: 'var(--dt-gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Verified Clinical Record
            </div>
            <div style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.90rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
              {patient.firstName || 'Demo'} {patient.lastName || 'Patient'}
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--dt-text-muted)', fontFamily: 'var(--dt-font-mono)', marginTop: '2px' }}>
              ABHA: {patient.abhaId || '91-4829-1092-8821'}
            </div>
          </div>
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'rgba(15, 118, 110, 0.2)',
              border: '1px solid var(--dt-teal-glow)',
              color: 'var(--dt-teal-glow)',
              fontSize: '0.60rem',
              fontWeight: 800,
              fontFamily: 'var(--dt-font-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ShieldCheck size={11} /> DB VERIFIED
          </span>
        </div>

        {/* Demographic Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '4px' }}>
          <div style={{ background: '#08090E', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.55rem', color: 'var(--dt-text-muted)', fontFamily: 'var(--dt-font-mono)' }}>BLOOD</div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--dt-gold)', fontFamily: 'var(--dt-font-mono)' }}>{patient.bloodType || 'O+'}</div>
          </div>
          <div style={{ background: '#08090E', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.55rem', color: 'var(--dt-text-muted)', fontFamily: 'var(--dt-font-mono)' }}>SEX</div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--dt-font-mono)', textTransform: 'capitalize' }}>{patient.sex || 'Male'}</div>
          </div>
          <div style={{ background: '#08090E', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.55rem', color: 'var(--dt-text-muted)', fontFamily: 'var(--dt-font-mono)' }}>AGE</div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--dt-font-mono)' }}>{patient.ageGroup || '48 yrs'}</div>
          </div>
          <div style={{ background: '#08090E', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.55rem', color: 'var(--dt-text-muted)', fontFamily: 'var(--dt-font-mono)' }}>BMI</div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--dt-font-mono)' }}>{bmi}</div>
          </div>
        </div>
      </div>

      {/* Cardiopulmonary & Baseline Vitals Telemetry */}
      <div className="dt-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionHeader icon={Activity} title="Cardiopulmonary Vitals" color="#FB7185" />
          <span style={{ fontSize: '0.58rem', color: 'var(--dt-teal-glow)', fontFamily: 'var(--dt-font-mono)' }}>
            Real-time DB Sync
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {/* Blood Pressure */}
          <div style={{ background: '#0D0E15', padding: '10px', borderRadius: '8px', border: '1px solid var(--dt-border-subtle)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.60rem', color: 'var(--dt-text-muted)', fontFamily: 'var(--dt-font-mono)' }}>BLOOD PRESSURE</span>
              <span style={{ fontSize: '0.55rem', fontWeight: 800, padding: '1px 4px', borderRadius: '3px', background: bpElevated ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', color: bpElevated ? '#F87171' : '#34D399' }}>
                {bpElevated ? 'ELEVATED' : 'NORMAL'}
              </span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--dt-font-mono)' }}>
              {sys} / {dia} <span style={{ fontSize: '0.62rem', color: 'var(--dt-text-muted)', fontWeight: 400 }}>mmHg</span>
            </div>
          </div>

          {/* Resting Heart Rate */}
          <div style={{ background: '#0D0E15', padding: '10px', borderRadius: '8px', border: '1px solid var(--dt-border-subtle)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.60rem', color: 'var(--dt-text-muted)', fontFamily: 'var(--dt-font-mono)' }}>HEART RATE</span>
              <Heart size={11} color={hrElevated ? '#F87171' : '#34D399'} />
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--dt-font-mono)' }}>
              {hr} <span style={{ fontSize: '0.62rem', color: 'var(--dt-text-muted)', fontWeight: 400 }}>BPM</span>
            </div>
          </div>

          {/* SpO2 Saturation */}
          <div style={{ background: '#0D0E15', padding: '10px', borderRadius: '8px', border: '1px solid var(--dt-border-subtle)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.60rem', color: 'var(--dt-text-muted)', fontFamily: 'var(--dt-font-mono)' }}>OXYGEN SpO₂</span>
              <Wind size={11} color={spo2Low ? '#F87171' : '#38BDF8'} />
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--dt-font-mono)' }}>
              {spo2}% <span style={{ fontSize: '0.62rem', color: 'var(--dt-text-muted)', fontWeight: 400 }}>SaO2</span>
            </div>
          </div>

          {/* Body Temperature */}
          <div style={{ background: '#0D0E15', padding: '10px', borderRadius: '8px', border: '1px solid var(--dt-border-subtle)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.60rem', color: 'var(--dt-text-muted)', fontFamily: 'var(--dt-font-mono)' }}>TEMPERATURE</span>
              <Thermometer size={11} color="var(--dt-gold)" />
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--dt-font-mono)' }}>
              {temp}° <span style={{ fontSize: '0.62rem', color: 'var(--dt-text-muted)', fontWeight: 400 }}>F</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Diagnosed Conditions & Symptoms */}
      <div className="dt-card">
        <SectionHeader icon={AlertTriangle} title="Diagnosed Conditions & Symptoms" color="#F59E0B" />
        <div className="dt-symptoms-matrix">
          {(patient.symptoms?.length > 0 ? patient.symptoms : ['Coronary Plaque Risk', 'Dense Breast Tissue', 'Mild Dyslipidemia']).map((symptom) => {
            const active = patient.symptoms.includes(symptom);
            return (
              <button
                key={symptom}
                type="button"
                onClick={() => toggleSymptom(symptom)}
                className={`dt-symptom-tag ${active ? 'active' : ''}`}
                title="Toggle symptom status"
              >
                {active && <Check size={11} strokeWidth={3} />}
                <span>{symptom}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Clinical Observations & Record Notes */}
      <div className="dt-card">
        <label className="dt-label">Physician Clinical Narrative</label>
        <div
          style={{
            background: '#0D0E15',
            border: '1px solid var(--dt-border-subtle)',
            borderRadius: '6px',
            padding: '10px',
            fontSize: '0.70rem',
            color: 'var(--dt-text-secondary)',
            fontFamily: 'var(--dt-font-mono)',
            lineHeight: 1.45,
          }}
        >
          {patient.notes || `Clinical telemetry synchronized for ${patient.patientId || 'patient'}. Biomechanical parameters reflecting active baseline diagnosis.`}
        </div>
      </div>
    </div>
  );
}

// ── Disease Simulation Tab ─────────────────────────────────────────────────────
function DiseaseTab() {
  const selectedDisease = useTwinStore((s) => s.selectedDisease);
  const setDisease      = useTwinStore((s) => s.setDisease);
  const diseases        = Object.values(DISEASE_REGISTRY);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="dt-card">
        <SectionHeader icon={Stethoscope} title="Target Disease Models" color="var(--dt-gold)" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {diseases.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDisease(d.id)}
              className={`dt-affected-item ${selectedDisease === d.id ? 'active' : ''}`}
            >
              <div>
                <div style={{ fontWeight: 800, color: selectedDisease === d.id ? '#FFFFFF' : 'var(--dt-text-primary)' }}>
                  {d.name}
                </div>
                <div style={{ fontSize: '0.60rem', color: 'var(--dt-text-muted)', marginTop: '2px' }}>
                  {d.category}
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.58rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: selectedDisease === d.id ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.05)',
                  color: selectedDisease === d.id ? 'var(--dt-gold)' : 'var(--dt-text-muted)',
                  fontWeight: 800,
                }}
              >
                {d.targetOrgans.length} organ{d.targetOrgans.length > 1 ? 's' : ''}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Disease Controls */}
      <div className="dt-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="dt-label">Biomechanical Parameters</label>
          <span style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.62rem', fontWeight: 800, color: 'var(--dt-gold)' }}>
            {DISEASE_REGISTRY[selectedDisease]?.name}
          </span>
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

// ── Medical History & Allergies Tab ───────────────────────────────────────────
function HistoryTab() {
  const patient              = useTwinStore((s) => s.patient);
  const addMedicalHistory    = useTwinStore((s) => s.addMedicalHistory);
  const removeMedicalHistory = useTwinStore((s) => s.removeMedicalHistory);
  const updateMedicalHistory = useTwinStore((s) => s.updateMedicalHistory);
  const setPatientNested     = useTwinStore((s) => s.setPatientNested);
  const addAllergy           = useTwinStore((s) => s.addAllergy);
  const removeAllergy        = useTwinStore((s) => s.removeAllergy);

  const FAMILY_CONDITIONS = [
    ['heartDisease', 'Heart Disease'], ['diabetes', 'Diabetes'],
    ['cancer', 'Cancer'], ['hypertension', 'Hypertension'],
    ['stroke', 'Stroke'], ['mentalHealth', 'Mental Health']
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Medical History Log */}
      <div className="dt-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionHeader icon={Clock} title="Clinical History Log" color="#A78BFA" />
          <button
            type="button"
            onClick={() => addMedicalHistory({})}
            className="dt-action-btn"
            style={{ padding: '4px 8px', fontSize: '0.62rem' }}
          >
            <Plus size={12} /> Add Entry
          </button>
        </div>

        {(!patient.medicalHistory || patient.medicalHistory.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--dt-text-muted)', fontSize: '0.70rem', fontFamily: 'var(--dt-font-mono)', border: '1px dashed var(--dt-border-default)', borderRadius: '6px' }}>
            No prior medical history logged in DB
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {patient.medicalHistory.map((entry) => (
              <div key={entry.id} style={{ background: '#0D0E15', padding: '10px', borderRadius: '6px', border: '1px solid var(--dt-border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.74rem', fontFamily: 'var(--dt-font-mono)' }}>
                    {entry.condition || 'Hypertension'}
                  </span>
                  <span style={{ fontSize: '0.60rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--dt-gold)', fontWeight: 700 }}>
                    {entry.status || 'Active'}
                  </span>
                </div>
                <div style={{ fontSize: '0.64rem', color: 'var(--dt-text-muted)', fontFamily: 'var(--dt-font-mono)' }}>
                  Diagnosed Year: {entry.diagnosedYear || '2024'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Known Allergies */}
      <div className="dt-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionHeader icon={AlertTriangle} title="Known Allergies & Alerts" color="#EF4444" />
          <button
            type="button"
            onClick={() => addAllergy({})}
            className="dt-action-btn"
            style={{ padding: '4px 8px', fontSize: '0.62rem' }}
          >
            <Plus size={12} /> Add Alert
          </button>
        </div>

        {(!patient.allergies || patient.allergies.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '12px', color: 'var(--dt-text-muted)', fontSize: '0.70rem', fontFamily: 'var(--dt-font-mono)', border: '1px dashed var(--dt-border-default)', borderRadius: '6px' }}>
            No critical allergies recorded
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {patient.allergies.map((allergy, idx) => {
              const allergyName = typeof allergy === 'string' ? allergy : (allergy?.allergen || allergy?.name || 'Allergen');
              const reaction = typeof allergy === 'object' ? (allergy?.reaction || 'Allergic sensitivity') : 'Allergic sensitivity';
              const severity = typeof allergy === 'object' ? (allergy?.severity || 'HIGH') : 'HIGH';
              const keyId = typeof allergy === 'object' ? (allergy?.id || idx) : idx;
              return (
                <div key={keyId} style={{ background: '#0D0E15', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#FCA5A5', fontSize: '0.72rem', fontFamily: 'var(--dt-font-mono)' }}>
                      {allergyName}
                    </div>
                    <div style={{ fontSize: '0.60rem', color: 'var(--dt-text-muted)' }}>
                      Reaction: {reaction}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '2px 5px', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' }}>
                    {severity}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hereditary Risk */}
      <div className="dt-card">
        <SectionHeader icon={Dna} title="Hereditary Family Risk" color="var(--dt-gold)" />
        <div className="dt-grid-2">
          {FAMILY_CONDITIONS.map(([key, label]) => {
            const active = patient.familyHistory?.[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPatientNested('familyHistory', key, !active)}
                className={`dt-symptom-tag ${active ? 'active' : ''}`}
                style={{ width: '100%', justifyContent: 'space-between', padding: '7px 10px' }}
              >
                <span>{label}</span>
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '3px',
                    border: active ? 'none' : '1px solid var(--dt-border-default)',
                    background: active ? 'var(--dt-gold)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {active && <Check size={10} color="#000000" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Prescriptions & Medications Tab ───────────────────────────────────────────
function MedicationsTab() {
  const patient          = useTwinStore((s) => s.patient);
  const addMedication    = useTwinStore((s) => s.addMedication);
  const removeMedication = useTwinStore((s) => s.removeMedication);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="dt-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionHeader icon={Pill} title="Active Prescriptions (Rx)" color="#38BDF8" />
          <button
            type="button"
            onClick={() => addMedication({})}
            className="dt-action-btn"
            style={{ padding: '4px 8px', fontSize: '0.62rem' }}
          >
            <Plus size={12} /> Add Drug
          </button>
        </div>

        {(!patient.medications || patient.medications.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--dt-text-muted)', fontSize: '0.72rem', fontFamily: 'var(--dt-font-mono)', border: '1px dashed var(--dt-border-default)', borderRadius: '6px' }}>
            No active prescriptions registered in DB
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {patient.medications.map((med, idx) => (
              <div key={med.id || idx} style={{ background: '#0D0E15', padding: '12px', borderRadius: '8px', border: '1px solid var(--dt-border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.65rem', fontWeight: 800, color: 'var(--dt-gold)' }}>
                    Rx #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMedication(med.id)}
                    style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--dt-font-mono)' }}>
                  {med.name || 'Atorvastatin'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: 'var(--dt-text-muted)', fontFamily: 'var(--dt-font-mono)' }}>
                  <span>Dosage: <strong style={{ color: 'var(--dt-text-primary)' }}>{med.dose || '20mg'}</strong></span>
                  <span>Schedule: <strong style={{ color: 'var(--dt-text-primary)' }}>{med.frequency || 'Once daily'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LEFT SIDEBAR (DB-First Clinical Telemetry & Controls)
// ═══════════════════════════════════════════════════════════════════════════════
export default function LeftSidebar() {
  const [activeTab, setActiveTab] = useState('overview');
  const patient           = useTwinStore((s) => s.patient);
  const patientMode       = useTwinStore((s) => s.patientMode);
  const loadPatientFromDB = useTwinStore((s) => s.loadPatientFromDB);
  const clearPatient      = useTwinStore((s) => s.clearPatient);
  const [searchId, setSearchId] = useState(patient.patientId || 'PT-89421');
  const tabContentRef = useRef(null);

  useEffect(() => {
    if (tabContentRef.current) {
      gsap.fromTo(
        tabContentRef.current,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
      );
    }
  }, [activeTab]);

  const handleSelectPatient = (id) => {
    setSearchId(id);
    loadPatientFromDB(id);
  };

  const handleFetch = () => {
    if (searchId.trim()) {
      loadPatientFromDB(searchId.trim());
    }
  };

  return (
    <aside className="dt-left-sidebar">
      {/* ── Top DB Patient Quick Switcher ── */}
      <div className="dt-panel-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: patientMode === 'active' ? 'var(--dt-teal-glow)' : 'var(--dt-gold)' }} />
            <span style={{ fontFamily: 'var(--dt-font-mono)', fontSize: '0.64rem', fontWeight: 800, color: 'var(--dt-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              DB Patient Inspector
            </span>
          </div>
          {patientMode === 'active' && (
            <span style={{ fontSize: '0.58rem', color: 'var(--dt-teal-glow)', fontFamily: 'var(--dt-font-mono)', fontWeight: 700 }}>
              ● LIVE SYNC
            </span>
          )}
        </div>

        {/* Search & Fetch Input */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              placeholder="Search Patient ID (e.g. PT-89421)"
              className="dt-input"
              style={{ paddingRight: '28px', fontSize: '0.72rem' }}
            />
            {patientMode === 'loading' && (
              <Loader2
                size={13}
                color="var(--dt-gold)"
                className="spin"
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}
              />
            )}
          </div>
          <button
            type="button"
            onClick={handleFetch}
            disabled={patientMode === 'loading' || !searchId.trim()}
            className="dt-action-btn dt-action-btn-gold"
            style={{ padding: '6px 12px', fontSize: '0.66rem' }}
          >
            Fetch
          </button>
        </div>

        {/* API-only patient lookup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '0.56rem', color: 'var(--dt-text-muted)', fontFamily: 'var(--dt-font-mono)', textTransform: 'uppercase' }}>
            Patient records are loaded by ID from the clinical API.
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="dt-tab-bar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`dt-tab-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Scrollable Tab Body ── */}
      <div ref={tabContentRef} className="dt-panel-body">
        {activeTab === 'overview' && <TelemetryTab />}
        {activeTab === 'disease'  && <DiseaseTab />}
        {activeTab === 'history'  && <HistoryTab />}
        {activeTab === 'meds'     && <MedicationsTab />}
      </div>
    </aside>
  );
}


