import React from 'react';
import { useTwinStore } from '../store/twinStore';
import { DISEASE_REGISTRY } from '../data/diseaseRegistry';
import { AGE_PROFILES } from '../data/ageProfiles';
import BreastCancerControls from '../diseases/BreastCancerControls';
import HeartDiseaseControls from '../diseases/HeartDiseaseControls';
import DiabetesControls from '../diseases/DiabetesControls';
import PneumoniaControls from '../diseases/PneumoniaControls';
import LiverDiseaseControls from '../diseases/LiverDiseaseControls';
import { User, Activity, Sparkles, HelpCircle } from 'lucide-react';

export default function LeftSidebar() {
  const patient = useTwinStore((state) => state.patient);
  const setPatient = useTwinStore((state) => state.setPatient);
  const selectedDisease = useTwinStore((state) => state.selectedDisease);
  const setDisease = useTwinStore((state) => state.setDisease);

  const diseases = Object.values(DISEASE_REGISTRY);

  return (
    <aside className="w-96 h-full bg-surface border-r border-slate-800 flex flex-col overflow-hidden select-none z-20">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-sky-400" />
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Patient & Twin Configuration
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* 1. Biological Sex / Anatomical Configuration */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Anatomical Configuration
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPatient({ sex: 'female' })}
              className={`py-2 px-3 rounded-xl text-xs font-medium transition border flex items-center justify-center gap-1.5 ${
                patient.sex === 'female'
                  ? 'bg-pink-500/20 border-pink-500/50 text-pink-200 shadow-sm'
                  : 'bg-surface-secondary border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>Female Anatomy</span>
            </button>
            <button
              onClick={() => setPatient({ sex: 'male' })}
              className={`py-2 px-3 rounded-xl text-xs font-medium transition border flex items-center justify-center gap-1.5 ${
                patient.sex === 'male'
                  ? 'bg-sky-500/20 border-sky-500/50 text-sky-200 shadow-sm'
                  : 'bg-surface-secondary border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>Male Anatomy</span>
            </button>
          </div>
        </div>

        {/* 2. Age Group Profile */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Age Group Profile
            </label>
            {patient.ageGroup === '<18' && (
              <span className="text-[10px] text-amber-400 font-mono">
                Asset: Pending Pediatric
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {AGE_PROFILES.map((age) => (
              <button
                key={age.id}
                onClick={() => setPatient({ ageGroup: age.id })}
                className={`py-2 rounded-lg text-xs font-medium transition border ${
                  patient.ageGroup === age.id
                    ? 'bg-sky-500/20 border-sky-400/50 text-sky-200 shadow-sm'
                    : 'bg-surface-secondary border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {age.id}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Disease Selection Tabs */}
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            Target Disease Condition
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {diseases.map((d) => (
              <button
                key={d.id}
                onClick={() => setDisease(d.id)}
                className={`text-left p-2.5 rounded-xl text-xs transition border flex items-center justify-between ${
                  selectedDisease === d.id
                    ? 'bg-gradient-to-r from-slate-800 to-slate-850 border-sky-500/60 text-white shadow-md ring-1 ring-sky-500/30'
                    : 'bg-surface-secondary/60 border-slate-800/80 text-slate-300 hover:bg-surface-secondary hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-[10px] text-slate-400">{d.category}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  selectedDisease === d.id ? 'bg-sky-500/30 text-sky-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {d.targetOrgans.length} organ{d.targetOrgans.length > 1 ? 's' : ''}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Dynamic Disease-Specific Parameters */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Disease Parameters
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {DISEASE_REGISTRY[selectedDisease]?.name}
            </span>
          </div>

          {selectedDisease === 'BREAST_CANCER' && <BreastCancerControls />}
          {selectedDisease === 'HEART_DISEASE' && <HeartDiseaseControls />}
          {selectedDisease === 'DIABETES' && <DiabetesControls />}
          {selectedDisease === 'PNEUMONIA' && <PneumoniaControls />}
          {selectedDisease === 'LIVER_DISEASE' && <LiverDiseaseControls />}
        </div>
      </div>
    </aside>
  );
}
