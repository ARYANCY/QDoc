import { create } from 'zustand';
import { DISEASE_REGISTRY } from '../data/diseaseRegistry';
import { StorageService } from '../utils/storage';
import {
  fetchPatientTwinState,
  mapRisksToInvolvement,
  detectPrimaryDisease
} from '../api/twinApi';

// ─── Default blank patient profile ───────────────────────────────────────────
const DEFAULT_PATIENT = {
  // Identity
  id: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  sex: 'female',
  bloodType: '',
  heightCm: '',
  weightKg: '',
  ageGroup: '40-60',

  // Contact / Administrative
  patientId: '',
  phone: '',
  email: '',
  emergencyContact: '',

  // Clinical Notes
  notes: '',

  // Current Symptoms (array of strings)
  symptoms: [],

  // Medical History (array of { condition, diagnosedYear, status })
  medicalHistory: [],

  // Surgical History (array of { procedure, year, notes })
  surgicalHistory: [],

  // Allergies (array of { allergen, reaction, severity })
  allergies: [],

  // Current Medications (array of { name, dose, frequency, startDate, prescribedBy })
  medications: [],

  // Family History (object of condition → affected relatives)
  familyHistory: {
    heartDisease: false,
    diabetes: false,
    cancer: false,
    hypertension: false,
    stroke: false,
    mentalHealth: false,
    other: ''
  },

  // Lifestyle
  lifestyle: {
    smokingStatus: 'never',     // 'never' | 'former' | 'current'
    alcoholUse: 'none',         // 'none' | 'social' | 'moderate' | 'heavy'
    exerciseFrequency: 'none',  // 'none' | 'light' | 'moderate' | 'active'
    diet: '',
    occupation: ''
  },

  // Vital Signs (latest)
  vitals: {
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    spo2: '',
    respiratoryRate: '',
    glucose: '',
    cholesterol: ''
  }
};

// ─── Default disease params ───────────────────────────────────────────────────
const DEFAULT_DISEASE_PARAMS = {
  BREAST_CANCER: {
    leftPercentage: 0,
    rightPercentage: 0,
    lesionEnabled: false,
    lesionX: 0.09,
    lesionY: 0.40,
    lesionZ: 0.10,
    lesionRadius: 0.035,
    selectedQuadrant: 'Upper Outer Quadrant'
  },
  HEART_DISEASE: {
    percentage: 0,
    selectedSubregion: 'Left Ventricle',
    pulseIntensity: true
  },
  DIABETES: {
    pancreas: 0,
    kidneyLeft: 0,
    kidneyRight: 0,
    heart: 0,
    vascular: 0,
    selectedSystemicOrgan: 'Pancreas'
  },
  PNEUMONIA: {
    leftPercentage: 0,
    rightPercentage: 0,
    selectedZone: 'Right Inferior Lobe'
  },
  LIVER_DISEASE: {
    percentage: 0,
    selectedLobe: 'Right Lobe'
  }
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useTwinStore = create((set, get) => ({

  // ── Patient Profile ─────────────────────────────────────────────────────────
  patient: { ...DEFAULT_PATIENT },

  // ── DB / Patient Mode ───────────────────────────────────────────────────────
  // 'idle'    → Clean anatomical model, no disease overlays
  // 'loading' → Fetching from DB
  // 'active'  → Patient data loaded, disease overlays visible
  // 'error'   → DB fetch failed
  patientMode: 'idle',
  patientError: null,
  dbData: null, // raw API response from /digital-twin/state/:id
  patientAnalysis: null, // compatibility with direct diagnostic analysis results

  // ── Disease Selection ───────────────────────────────────────────────────────
  selectedDisease: 'PNEUMONIA',

  // ── Involvement Map ─────────────────────────────────────────────────────────
  // Starts completely empty in 'idle' mode (clean model)
  involvementMap: {},

  // ── Disease Parameters ──────────────────────────────────────────────────────
  diseaseParams: { ...DEFAULT_DISEASE_PARAMS },

  // ── Layer Visibility ────────────────────────────────────────────────────────
  layers: {
    skin: true,
    skeleton: true,
    organs: true,
    vessels: true,
    airway: true,
    digestive: true,
    urinary: true,
    diseaseOverlay: true,
    labels: true
  },

  // ── X-Ray Mode ──────────────────────────────────────────────────────────────
  xrayMode: false,
  xrayIntensity: 0.5,

  // ── Selection State ─────────────────────────────────────────────────────────
  selectedAnatomy: null,
  hoveredAnatomy: null,

  // ── Camera ──────────────────────────────────────────────────────────────────
  cameraAction: { preset: 'front', trigger: Date.now() },

  // ── Modals ──────────────────────────────────────────────────────────────────
  isReportOpen: false,
  isComparisonOpen: false,
  isTimelineOpen: false,
  isPatientPanelOpen: false,

  // ──────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ──────────────────────────────────────────────────────────────────────────

  setPatient: (updates) =>
    set((state) => {
      const updated = { ...state.patient, ...updates };
      StorageService.saveTwin({ patient: updated, disease: state.selectedDisease, involvement: state.involvementMap });
      return { patient: updated };
    }),

  setPatientField: (field, value) =>
    set((state) => {
      const updated = { ...state.patient, [field]: value };
      return { patient: updated };
    }),

  setPatientNested: (field, key, value) =>
    set((state) => {
      const updated = {
        ...state.patient,
        [field]: { ...state.patient[field], [key]: value }
      };
      return { patient: updated };
    }),

  addMedication: (med) =>
    set((state) => ({
      patient: {
        ...state.patient,
        medications: [...state.patient.medications, {
          id: Date.now(),
          name: '',
          dose: '',
          frequency: '',
          startDate: '',
          prescribedBy: '',
          ...med
        }]
      }
    })),

  updateMedication: (id, updates) =>
    set((state) => ({
      patient: {
        ...state.patient,
        medications: state.patient.medications.map(m =>
          m.id === id ? { ...m, ...updates } : m
        )
      }
    })),

  removeMedication: (id) =>
    set((state) => ({
      patient: {
        ...state.patient,
        medications: state.patient.medications.filter(m => m.id !== id)
      }
    })),

  addMedicalHistory: (entry) =>
    set((state) => ({
      patient: {
        ...state.patient,
        medicalHistory: [...state.patient.medicalHistory, {
          id: Date.now(), condition: '', diagnosedYear: '', status: 'active', ...entry
        }]
      }
    })),

  removeMedicalHistory: (id) =>
    set((state) => ({
      patient: {
        ...state.patient,
        medicalHistory: state.patient.medicalHistory.filter(h => h.id !== id)
      }
    })),

  updateMedicalHistory: (id, updates) =>
    set((state) => ({
      patient: {
        ...state.patient,
        medicalHistory: state.patient.medicalHistory.map(h =>
          h.id === id ? { ...h, ...updates } : h
        )
      }
    })),

  addAllergy: (allergy) =>
    set((state) => ({
      patient: {
        ...state.patient,
        allergies: [...state.patient.allergies, {
          id: Date.now(), allergen: '', reaction: '', severity: 'mild', ...allergy
        }]
      }
    })),

  removeAllergy: (id) =>
    set((state) => ({
      patient: {
        ...state.patient,
        allergies: state.patient.allergies.filter(a => a.id !== id)
      }
    })),

  toggleSymptom: (symptom) =>
    set((state) => {
      const existing = state.patient.symptoms;
      const next = existing.includes(symptom)
        ? existing.filter(s => s !== symptom)
        : [...existing, symptom];
      return { patient: { ...state.patient, symptoms: next } };
    }),

  // ── DB Patient Load ─────────────────────────────────────────────────────────
  loadPatientFromDB: async (patientId) => {
    if (!patientId?.trim()) return;
    set({ patientMode: 'loading', patientError: null });
    try {
      const data = await fetchPatientTwinState(patientId.trim());
      const moduleRisks = data?.selected_visit?.module_risks || data?.module_risks || {};
      const involvementMap = mapRisksToInvolvement(moduleRisks);
      const detectedDisease = detectPrimaryDisease(moduleRisks);
      const visitDate = data?.selected_visit?.date || '';
      const visitNotes = data?.selected_visit?.notes || '';

      // Build updated disease params from DB data
      const newDiseaseParams = { ...DEFAULT_DISEASE_PARAMS };
      if (involvementMap.HEART)        newDiseaseParams.HEART_DISEASE.percentage = involvementMap.HEART;
      if (involvementMap.LUNG_LEFT)    newDiseaseParams.PNEUMONIA.leftPercentage = involvementMap.LUNG_LEFT;
      if (involvementMap.LUNG_RIGHT)   newDiseaseParams.PNEUMONIA.rightPercentage = involvementMap.LUNG_RIGHT;
      if (involvementMap.BREAST_LEFT)  newDiseaseParams.BREAST_CANCER.leftPercentage = involvementMap.BREAST_LEFT;
      if (involvementMap.BREAST_RIGHT) newDiseaseParams.BREAST_CANCER.rightPercentage = involvementMap.BREAST_RIGHT;
      if (involvementMap.PANCREAS)     newDiseaseParams.DIABETES.pancreas = involvementMap.PANCREAS;

      set({
        patientMode: 'active',
        dbData: data,
        involvementMap,
        selectedDisease: detectedDisease || get().selectedDisease,
        diseaseParams: newDiseaseParams,
        selectedAnatomy: null,
        patient: {
          ...get().patient,
          patientId,
          notes: visitNotes,
        },
        layers: { ...get().layers, diseaseOverlay: true }
      });
    } catch (err) {
      set({ patientMode: 'error', patientError: err.message });
    }
  },

  clearPatient: () =>
    set({
      patientMode: 'idle',
      patientError: null,
      dbData: null,
      patientAnalysis: null,
      involvementMap: {},
      diseaseParams: { ...DEFAULT_DISEASE_PARAMS },
      selectedAnatomy: null,
      patient: { ...DEFAULT_PATIENT }
    }),

  setPatientAnalysis: (analysis, patientId) => {
    if (!analysis) return;
    const diseaseName = (analysis.disease || '').toUpperCase();
    let diseaseKey = 'HEART_DISEASE';
    let involvement = { HEART: Math.round((analysis.prediction?.confidence || 0.85) * 100) };

    if (diseaseName.includes('BREAST') || diseaseName.includes('ONCOLOGY')) {
      diseaseKey = 'BREAST_CANCER';
      involvement = { BREAST_LEFT: Math.round((analysis.prediction?.confidence || 0.85) * 100) };
    } else if (diseaseName.includes('PNEUM') || diseaseName.includes('LUNG') || diseaseName.includes('CHEST')) {
      diseaseKey = 'PNEUMONIA';
      involvement = { LUNG_RIGHT: Math.round((analysis.prediction?.confidence || 0.85) * 100), LUNG_LEFT: 25 };
    } else if (diseaseName.includes('DIABET') || diseaseName.includes('METABOLIC')) {
      diseaseKey = 'DIABETES';
      involvement = { PANCREAS: Math.round((analysis.prediction?.confidence || 0.85) * 100), KIDNEY_LEFT: 35, KIDNEY_RIGHT: 35 };
    } else if (diseaseName.includes('LIVER') || diseaseName.includes('HEPATIC')) {
      diseaseKey = 'LIVER_DISEASE';
      involvement = { LIVER: Math.round((analysis.prediction?.confidence || 0.85) * 100) };
    } else if (diseaseName.includes('DERMA') || diseaseName.includes('SKIN')) {
      involvement = { SKIN: Math.round((analysis.prediction?.confidence || 0.85) * 100) };
    }

    set({
      patientMode: 'active',
      patientAnalysis: analysis,
      selectedDisease: diseaseKey,
      involvementMap: involvement,
      patient: {
        ...get().patient,
        patientId: patientId || get().patient.patientId,
        notes: analysis.explainability?.clinical_narrative || get().patient.notes
      },
      layers: { ...get().layers, diseaseOverlay: true }
    });
  },

  // ── Disease ─────────────────────────────────────────────────────────────────
  setDisease: (diseaseId) => {
    const disease = DISEASE_REGISTRY[diseaseId];
    if (!disease) return;

    let newInvolvement = {};
    const dp = get().diseaseParams;
    if (diseaseId === 'BREAST_CANCER') {
      newInvolvement = { BREAST_LEFT: dp.BREAST_CANCER.leftPercentage, BREAST_RIGHT: dp.BREAST_CANCER.rightPercentage };
    } else if (diseaseId === 'HEART_DISEASE') {
      newInvolvement = { HEART: dp.HEART_DISEASE.percentage };
    } else if (diseaseId === 'DIABETES') {
      const d = dp.DIABETES;
      newInvolvement = { PANCREAS: d.pancreas, KIDNEY_LEFT: d.kidneyLeft, KIDNEY_RIGHT: d.kidneyRight, HEART: d.heart, VASCULAR_SYSTEM: d.vascular };
    } else if (diseaseId === 'PNEUMONIA') {
      newInvolvement = { LUNG_LEFT: dp.PNEUMONIA.leftPercentage, LUNG_RIGHT: dp.PNEUMONIA.rightPercentage };
    } else if (diseaseId === 'LIVER_DISEASE') {
      newInvolvement = { LIVER: dp.LIVER_DISEASE.percentage };
    }
    const firstTarget = disease.targetOrgans[0] || null;
    set({ selectedDisease: diseaseId, involvementMap: newInvolvement, selectedAnatomy: firstTarget });
    StorageService.saveTwin({ patient: get().patient, disease: diseaseId, involvement: newInvolvement });
  },

  updateInvolvement: (anatomyId, percentage) => {
    const pct = Math.max(0, Math.min(100, Number(percentage) || 0));
    set((state) => {
      const updated = { ...state.involvementMap, [anatomyId]: pct };
      StorageService.saveTwin({ patient: state.patient, disease: state.selectedDisease, involvement: updated });
      return { involvementMap: updated };
    });
  },

  updateDiseaseParam: (diseaseId, paramKey, value) => {
    set((state) => {
      const updatedDisease = { ...state.diseaseParams[diseaseId], [paramKey]: value };
      let updatedInvolvement = { ...state.involvementMap };
      if (diseaseId === 'BREAST_CANCER') {
        if (paramKey === 'leftPercentage')  updatedInvolvement.BREAST_LEFT  = value;
        if (paramKey === 'rightPercentage') updatedInvolvement.BREAST_RIGHT = value;
      } else if (diseaseId === 'HEART_DISEASE') {
        if (paramKey === 'percentage') updatedInvolvement.HEART = value;
      } else if (diseaseId === 'DIABETES') {
        if (paramKey === 'pancreas')    updatedInvolvement.PANCREAS      = value;
        if (paramKey === 'kidneyLeft')  updatedInvolvement.KIDNEY_LEFT   = value;
        if (paramKey === 'kidneyRight') updatedInvolvement.KIDNEY_RIGHT  = value;
        if (paramKey === 'heart')       updatedInvolvement.HEART         = value;
        if (paramKey === 'vascular')    updatedInvolvement.VASCULAR_SYSTEM = value;
      } else if (diseaseId === 'PNEUMONIA') {
        if (paramKey === 'leftPercentage')  updatedInvolvement.LUNG_LEFT  = value;
        if (paramKey === 'rightPercentage') updatedInvolvement.LUNG_RIGHT = value;
      } else if (diseaseId === 'LIVER_DISEASE') {
        if (paramKey === 'percentage') updatedInvolvement.LIVER = value;
      }
      StorageService.saveTwin({ patient: state.patient, disease: state.selectedDisease, involvement: updatedInvolvement });
      return {
        diseaseParams: { ...state.diseaseParams, [diseaseId]: updatedDisease },
        involvementMap: updatedInvolvement
      };
    });
  },

  // ── UI State ─────────────────────────────────────────────────────────────────
  setSelectedAnatomy: (id) => set({ selectedAnatomy: id }),
  setHoveredAnatomy: (id) => set({ hoveredAnatomy: id }),
  toggleLayer: (key) => set((state) => ({ layers: { ...state.layers, [key]: !state.layers[key] } })),
  setXrayMode: (enabled) => set({ xrayMode: enabled }),
  setXrayIntensity: (intensity) => set({ xrayIntensity: intensity }),
  setCameraAction: (preset) => set({ cameraAction: { preset, trigger: Date.now() } }),

  setReportOpen: (v) => set({ isReportOpen: v }),
  setComparisonOpen: (v) => set({ isComparisonOpen: v }),
  setTimelineOpen: (v) => set({ isTimelineOpen: v }),
  setPatientPanelOpen: (v) => set({ isPatientPanelOpen: v })
}));
