export const ANATOMY_REGISTRY = {
  SKIN: {
    id: "SKIN",
    label: "Skin Surface (GLB Body)",
    meshName: "HumanMesh",
    category: "integumentary",
    description: "Realistic anatomical human body skin mesh providing morphological boundaries and spatial context.",
    defaultColor: "#94a3b8",
    defaultOpacity: 0.16,
    layer: "skin"
  },
  SKELETON: {
    id: "SKELETON",
    label: "Skeletal Framework",
    meshName: "SKELETON",
    category: "skeletal",
    description: "Bony thoracic ribcage, vertebral column, sternum, and pelvic framework.",
    defaultColor: "#eae6df",
    defaultOpacity: 0.35,
    layer: "skeleton"
  },
  BRAIN: {
    id: "BRAIN",
    label: "Brain",
    meshName: "BRAIN",
    category: "nervous",
    description: "Cerebral hemispheres and cranial nerve centers situated inside the cranial skull vault.",
    defaultColor: "#e5989b",
    defaultOpacity: 0.92,
    position: [0.00, 0.72, -0.015],
    layer: "organs"
  },
  HEART: {
    id: "HEART",
    label: "Heart",
    meshName: "HEART",
    category: "cardiovascular",
    description: "Four-chambered muscular cardiac organ situated in the thoracic mediastinum.",
    defaultColor: "#dc2626",
    defaultOpacity: 0.95,
    position: [-0.025, 0.41, 0.03],
    layer: "organs"
  },
  LUNG_LEFT: {
    id: "LUNG_LEFT",
    label: "Left Lung",
    meshName: "LUNG_LEFT",
    category: "respiratory",
    description: "Bi-lobed left pulmonary organ flanking the cardiac notch in the left pleural cavity.",
    defaultColor: "#38bdf8",
    defaultOpacity: 0.85,
    position: [0.08, 0.44, 0.00],
    layer: "organs"
  },
  LUNG_RIGHT: {
    id: "LUNG_RIGHT",
    label: "Right Lung",
    meshName: "LUNG_RIGHT",
    category: "respiratory",
    description: "Tri-lobed right pulmonary organ in the right pleural cavity.",
    defaultColor: "#38bdf8",
    defaultOpacity: 0.85,
    position: [-0.08, 0.44, 0.00],
    layer: "organs"
  },
  LIVER: {
    id: "LIVER",
    label: "Liver",
    meshName: "LIVER",
    category: "digestive",
    description: "Largest metabolic and detoxification organ seated in the right hypochondrium under the diaphragm.",
    defaultColor: "#854d0e",
    defaultOpacity: 0.9,
    position: [-0.06, 0.28, 0.02],
    layer: "organs"
  },
  PANCREAS: {
    id: "PANCREAS",
    label: "Pancreas",
    meshName: "PANCREAS",
    category: "endocrine",
    description: "Endocrine insulin-producing and exocrine digestive glandular organ in the transpyloric plane.",
    defaultColor: "#eab308",
    defaultOpacity: 0.9,
    position: [0.01, 0.25, 0.00],
    layer: "organs"
  },
  KIDNEY_LEFT: {
    id: "KIDNEY_LEFT",
    label: "Left Kidney",
    meshName: "KIDNEY_LEFT",
    category: "urinary",
    description: "Left retroperitoneal filtration organ in the left flank at T12-L3.",
    defaultColor: "#7e22ce",
    defaultOpacity: 0.9,
    position: [0.08, 0.22, -0.05],
    layer: "organs"
  },
  KIDNEY_RIGHT: {
    id: "KIDNEY_RIGHT",
    label: "Right Kidney",
    meshName: "KIDNEY_RIGHT",
    category: "urinary",
    description: "Right retroperitoneal filtration organ positioned inferior to the liver.",
    defaultColor: "#7e22ce",
    defaultOpacity: 0.9,
    position: [-0.08, 0.20, -0.05],
    layer: "organs"
  },
  BREAST_LEFT: {
    id: "BREAST_LEFT",
    label: "Left Breast",
    meshName: "BREAST_LEFT",
    category: "reproductive",
    description: "Left anterior mammary parenchymal tissue situated over the pectoralis major muscle.",
    defaultColor: "#f472b6",
    defaultOpacity: 0.8,
    position: [0.09, 0.39, 0.08],
    layer: "organs"
  },
  BREAST_RIGHT: {
    id: "BREAST_RIGHT",
    label: "Right Breast",
    meshName: "BREAST_RIGHT",
    category: "reproductive",
    description: "Right anterior mammary parenchymal tissue situated over the pectoralis major muscle.",
    defaultColor: "#f472b6",
    defaultOpacity: 0.8,
    position: [-0.09, 0.39, 0.08],
    layer: "organs"
  },
  VASCULAR_SYSTEM: {
    id: "VASCULAR_SYSTEM",
    label: "Vascular Network",
    meshName: "VASCULAR_SYSTEM",
    category: "cardiovascular",
    description: "Systemic arterial aorta and venous vena cava pathways through the thoracic and abdominal cavities.",
    defaultColor: "#ef4444",
    defaultOpacity: 0.75,
    position: [0.00, 0.35, 0.00],
    layer: "vessels"
  }
};
