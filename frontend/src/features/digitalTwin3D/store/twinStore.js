import { create } from 'zustand';
import { DISEASE_REGISTRY } from '../data/diseaseRegistry';
import { computeVisualizationState } from '../visualization/visualizationEngine';
import { StorageService } from '../utils/storage';

export const DISEASE_TO_ORGAN = {
  breast_cancer: 'BREAST_LEFT',
  wdbc: 'BREAST_LEFT',
  heart: 'HEART',
  cleveland: 'HEART',
  cardio: 'HEART',
  diabetes: 'PANCREAS',
  pima: 'PANCREAS',
  parkinsons: 'BRAIN',
  pneumonia: 'LUNG_RIGHT',
  chest_xray: 'LUNG_RIGHT',
  skin: 'SKIN',
  skin_cancer: 'SKIN',
  liver: 'LIVER',
};

export const useTwinStore = create((set, get) => ({
  // Active real patient analysis synced from clinical checkup or DB
  patientAnalysis: null,

  // Patient configuration
  patient: {
    sex: 'female',
    notes: 'Standard patient digital twin profile'
  },

  // Disease selection
  selectedDisease: 'HEART_DISEASE',

  // Involvement map: { [anatomyId]: percentage }
  involvementMap: {
    HEART: 65,
  },

  // Disease-specific parameters
  diseaseParams: {
    BREAST_CANCER: {
      leftPercentage: 75,
      rightPercentage: 0,
      lesionEnabled: true,
      lesionX: 0.09,
      lesionY: 0.40,
      lesionZ: 0.10,
      lesionRadius: 0.035,
      selectedQuadrant: 'Upper Outer Quadrant'
    },
    HEART_DISEASE: {
      percentage: 70,
      selectedSubregion: 'Left Ventricle',
      pulseIntensity: true
    },
    DIABETES: {
      pancreas: 80,
      kidneyLeft: 45,
      kidneyRight: 45,
      heart: 30,
      vascular: 60,
      selectedSystemicOrgan: 'Pancreas'
    },
    PNEUMONIA: {
      leftPercentage: 20,
      rightPercentage: 65,
      selectedZone: 'Right Inferior Lobe'
    },
    LIVER_DISEASE: {
      percentage: 60,
      selectedLobe: 'Right Lobe'
    }
  },

  // Layer Visibility
  layers: {
    skin: true,
    skeleton: true,
    organs: true,
    vessels: true,
    diseaseOverlay: true
  },

  // X-Ray / Transparency mode
  xrayMode: false,
  xrayIntensity: 0.5,

  // Selected anatomy & Hovered anatomy for inspection
  selectedAnatomy: 'LUNG_RIGHT',
  hoveredAnatomy: null,

  // Camera Action Preset: 'front', 'back', 'left', 'right', 'top', 'reset', 'focus'
  cameraAction: { preset: 'front', trigger: Date.now() },

  // Modals
  isReportOpen: false,
  isComparisonOpen: false,
  isTimelineOpen: false,

  // Actions
  setPatientAnalysis: (analysis, patientId = 'PT-89421') => {
    if (!analysis) {
      set({ patientAnalysis: null });
      return;
    }

    const diseaseKey = (analysis.disease_key || analysis.disease || '').toLowerCase();
    let targetOrgan = 'HEART';
    for (const [k, organ] of Object.entries(DISEASE_TO_ORGAN)) {
      if (diseaseKey.includes(k)) {
        targetOrgan = organ;
        break;
      }
    }

    const confidence = analysis.prediction?.confidence || 0.88;
    const severity = analysis.prediction?.severity || 'normal';
    const predClass = (analysis.prediction?.class || '').toLowerCase();
    const isRisk =
      severity === 'danger' ||
      severity === 'warning' ||
      predClass.includes('malignant') ||
      predClass.includes('disease') ||
      predClass.includes('diabetic') ||
      predClass.includes('pneumonia');

    const involvementPct = isRisk
      ? Math.max(60, Math.round(confidence * 100))
      : Math.min(25, Math.round((1 - confidence) * 35));

    const activeAnalysis = {
      patientId: analysis.patient_id || patientId,
      disease: analysis.disease || 'Clinical Assessment',
      predictedClass: analysis.prediction?.class || 'Normal Physiological Baseline',
      confidence: confidence,
      severity: isRisk ? 'danger' : 'normal',
      topFeatures: analysis.explainability?.top_features || [],
      clinicalNarrative: analysis.explainability?.clinical_narrative || '',
      targetOrgan: targetOrgan,
      telemetry: analysis.quantum_telemetry || null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      patientAnalysis: activeAnalysis,
      selectedAnatomy: targetOrgan,
      involvementMap: {
        ...state.involvementMap,
        [targetOrgan]: involvementPct,
      },
      cameraAction: { preset: 'focus', trigger: Date.now() },
    }));
  },

  clearPatientAnalysis: () => set({ patientAnalysis: null }),

  setPatient: (patientUpdates) =>
    set((state) => {
      const updated = { ...state.patient, ...patientUpdates };
      StorageService.saveTwin({ patient: updated, disease: state.selectedDisease, involvement: state.involvementMap });
      return { patient: updated };
    }),

  setDisease: (diseaseId) => {
    const disease = DISEASE_REGISTRY[diseaseId];
    if (!disease) return;

    let newInvolvement = {};
    if (diseaseId === 'BREAST_CANCER') {
      newInvolvement = {
        BREAST_LEFT: get().diseaseParams.BREAST_CANCER.leftPercentage,
        BREAST_RIGHT: get().diseaseParams.BREAST_CANCER.rightPercentage
      };
    } else if (diseaseId === 'HEART_DISEASE') {
      newInvolvement = { HEART: get().diseaseParams.HEART_DISEASE.percentage };
    } else if (diseaseId === 'DIABETES') {
      const d = get().diseaseParams.DIABETES;
      newInvolvement = {
        PANCREAS: d.pancreas,
        KIDNEY_LEFT: d.kidneyLeft,
        KIDNEY_RIGHT: d.kidneyRight,
        HEART: d.heart,
        VASCULAR_SYSTEM: d.vascular
      };
    } else if (diseaseId === 'PNEUMONIA') {
      newInvolvement = {
        LUNG_LEFT: get().diseaseParams.PNEUMONIA.leftPercentage,
        LUNG_RIGHT: get().diseaseParams.PNEUMONIA.rightPercentage
      };
    } else if (diseaseId === 'LIVER_DISEASE') {
      newInvolvement = { LIVER: get().diseaseParams.LIVER_DISEASE.percentage };
    }

    const firstTarget = disease.targetOrgans[0] || null;

    set({
      selectedDisease: diseaseId,
      involvementMap: newInvolvement,
      selectedAnatomy: firstTarget
    });

    StorageService.saveTwin({ patient: get().patient, disease: diseaseId, involvement: newInvolvement });
  },

  updateInvolvement: (anatomyId, percentage) => {
    const pct = Math.max(0, Math.min(100, Number(percentage) || 0));
    set((state) => {
      const updated = {
        ...state.involvementMap,
        [anatomyId]: pct
      };
      StorageService.saveTwin({ patient: state.patient, disease: state.selectedDisease, involvement: updated });
      return { involvementMap: updated };
    });
  },

  updateDiseaseParam: (diseaseId, paramKey, value) => {
    set((state) => {
      const updatedDisease = {
        ...state.diseaseParams[diseaseId],
        [paramKey]: value
      };
      
      // Synchronize involvementMap
      let updatedInvolvement = { ...state.involvementMap };
      if (diseaseId === 'BREAST_CANCER') {
        if (paramKey === 'leftPercentage') updatedInvolvement.BREAST_LEFT = value;
        if (paramKey === 'rightPercentage') updatedInvolvement.BREAST_RIGHT = value;
      } else if (diseaseId === 'HEART_DISEASE') {
        if (paramKey === 'percentage') updatedInvolvement.HEART = value;
      } else if (diseaseId === 'DIABETES') {
        if (paramKey === 'pancreas') updatedInvolvement.PANCREAS = value;
        if (paramKey === 'kidneyLeft') updatedInvolvement.KIDNEY_LEFT = value;
        if (paramKey === 'kidneyRight') updatedInvolvement.KIDNEY_RIGHT = value;
        if (paramKey === 'heart') updatedInvolvement.HEART = value;
        if (paramKey === 'vascular') updatedInvolvement.VASCULAR_SYSTEM = value;
      } else if (diseaseId === 'PNEUMONIA') {
        if (paramKey === 'leftPercentage') updatedInvolvement.LUNG_LEFT = value;
        if (paramKey === 'rightPercentage') updatedInvolvement.LUNG_RIGHT = value;
      } else if (diseaseId === 'LIVER_DISEASE') {
        if (paramKey === 'percentage') updatedInvolvement.LIVER = value;
      }

      StorageService.saveTwin({ patient: state.patient, disease: state.selectedDisease, involvement: updatedInvolvement });

      return {
        diseaseParams: {
          ...state.diseaseParams,
          [diseaseId]: updatedDisease
        },
        involvementMap: updatedInvolvement
      };
    });
  },

  setSelectedAnatomy: (anatomyId) => set({ selectedAnatomy: anatomyId }),
  setHoveredAnatomy: (anatomyId) => set({ hoveredAnatomy: anatomyId }),

  toggleLayer: (layerKey) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layerKey]: !state.layers[layerKey]
      }
    })),

  setXrayMode: (enabled) => set({ xrayMode: enabled }),
  setXrayIntensity: (intensity) => set({ xrayIntensity: intensity }),

  setCameraAction: (preset) =>
    set({
      cameraAction: { preset, trigger: Date.now() }
    }),

  setReportOpen: (isOpen) => set({ isReportOpen: isOpen }),
  setComparisonOpen: (isOpen) => set({ isComparisonOpen: isOpen }),
  setTimelineOpen: (isOpen) => set({ isTimelineOpen: isOpen })
}));
