/**
 * ANATOMY REGISTRY — All 25 GLB organs + constructed structures
 * Each entry includes: id, label, category, description, defaultColor,
 * defaultOpacity, position, scale, rotation, glbPath, layer
 *
 * Coordinate system (body-space):
 *   X: -left  → +right (patient's right = our left)
 *   Y: 0 = feet, ~0.86 = top of head
 *   Z: -back  → +front
 */
export const ANATOMY_REGISTRY = {

  // ── INTEGUMENTARY ──────────────────────────────────────────────────────────
  SKIN: {
    id: 'SKIN',
    label: 'Skin Surface',
    category: 'integumentary',
    description: 'Full-body skin envelope providing morphological boundary and spatial context.',
    defaultColor: '#94a3b8',
    defaultOpacity: 0.14,
    glbPath: null, // handled by GLBHumanBody (sex-specific: skin_male/female.glb)
    position: [0, 0, 0],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    layer: 'skin'
  },

  // ── SKELETAL ───────────────────────────────────────────────────────────────
  SKULL: {
    id: 'SKULL',
    label: 'Skull',
    category: 'skeletal',
    description: 'Bony cranial vault housing and protecting the brain.',
    defaultColor: '#e8dcc8',
    defaultOpacity: 0.30,
    glbPath: '/models/skull.glb',
    position: [0.00, 0.735, 0.00],
    scale: [0.225, 0.225, 0.225],
    rotation: [0, 0, 0],
    layer: 'skeleton'
  },

  PELVIS: {
    id: 'PELVIS',
    label: 'Pelvis',
    category: 'skeletal',
    description: 'Bony pelvic girdle connecting the spine to the lower limbs.',
    defaultColor: '#e8dcc8',
    defaultOpacity: 0.30,
    glbPath: '/models/pelvis.glb',
    position: [0.00, 0.04, -0.01],
    scale: [0.22, 0.22, 0.22],
    rotation: [0, 0, 0],
    layer: 'skeleton'
  },

  SPINAL_CORD: {
    id: 'SPINAL_CORD',
    label: 'Spinal Cord',
    category: 'nervous',
    description: 'Central neural pathway running through the vertebral column.',
    defaultColor: '#fde68a',
    defaultOpacity: 0.60,
    glbPath: '/models/spinal_cord.glb',
    position: [0.00, 0.36, -0.045],
    scale: [0.10, 0.10, 0.10],
    rotation: [0, 0, 0],
    layer: 'skeleton'
  },

  // ── NERVOUS ────────────────────────────────────────────────────────────────
  BRAIN: {
    id: 'BRAIN',
    label: 'Brain',
    category: 'nervous',
    description: 'Cerebral hemispheres, cerebellum and brainstem within the cranial vault.',
    defaultColor: '#e5989b',
    defaultOpacity: 0.90,
    glbPath: '/models/brain.glb',
    position: [0.00, 0.73, 0.00],
    scale: [0.20, 0.20, 0.20],
    rotation: [0, 0, 0],
    layer: 'organs'
  },

  // ── CARDIOVASCULAR ────────────────────────────────────────────────────────
  HEART: {
    id: 'HEART',
    label: 'Heart',
    category: 'cardiovascular',
    description: 'Four-chambered muscular cardiac organ in the thoracic mediastinum.',
    defaultColor: '#dc2626',
    defaultOpacity: 0.95,
    glbPath: '/models/heart.glb',
    position: [-0.025, 0.415, 0.03],
    scale: [0.11, 0.11, 0.11],
    rotation: [0.08, 0.15, -0.15],
    layer: 'organs'
  },

  VASCULAR_SYSTEM: {
    id: 'VASCULAR_SYSTEM',
    label: 'Vasculature',
    category: 'cardiovascular',
    description: 'Systemic arterial and venous vasculature network throughout the body.',
    defaultColor: '#ef4444',
    defaultOpacity: 0.70,
    glbPath: null, // sex-specific: handled by GLBHumanBody via vasculature_male/female.glb
    position: [0.00, 0.35, 0.00],
    scale: [0.22, 0.22, 0.22],
    rotation: [0, 0, 0],
    layer: 'vessels'
  },

  // ── RESPIRATORY ───────────────────────────────────────────────────────────
  LUNG_LEFT: {
    id: 'LUNG_LEFT',
    label: 'Left Lung',
    category: 'respiratory',
    description: 'Bi-lobed left pulmonary organ flanking the cardiac notch.',
    defaultColor: '#7dd3fc',
    defaultOpacity: 0.82,
    glbPath: '/models/lungs.glb', // shared GLB, left portion
    position: [0.00, 0.435, 0.00],
    scale: [0.21, 0.20, 0.21],
    rotation: [0, 0, 0],
    layer: 'organs'
  },

  LUNG_RIGHT: {
    id: 'LUNG_RIGHT',
    label: 'Right Lung',
    category: 'respiratory',
    description: 'Tri-lobed right pulmonary organ in the right pleural cavity.',
    defaultColor: '#7dd3fc',
    defaultOpacity: 0.82,
    glbPath: '/models/lungs.glb', // shared GLB, right portion
    position: [0.00, 0.435, 0.00],
    scale: [0.21, 0.20, 0.21],
    rotation: [0, 0, 0],
    layer: 'organs'
  },

  TRACHEA: {
    id: 'TRACHEA',
    label: 'Trachea',
    category: 'respiratory',
    description: 'Cartilaginous airway tube connecting larynx to bronchi.',
    defaultColor: '#bae6fd',
    defaultOpacity: 0.75,
    glbPath: '/models/trachea.glb',
    position: [0.00, 0.535, 0.015],
    scale: [0.095, 0.095, 0.095],
    rotation: [0, 0, 0],
    layer: 'airway'
  },

  BRONCHUS: {
    id: 'BRONCHUS',
    label: 'Bronchi',
    category: 'respiratory',
    description: 'Primary bronchial airways branching into the lungs.',
    defaultColor: '#93c5fd',
    defaultOpacity: 0.72,
    glbPath: '/models/bronchus.glb',
    position: [0.00, 0.465, 0.00],
    scale: [0.13, 0.13, 0.13],
    rotation: [0, 0, 0],
    layer: 'airway'
  },

  LARYNX: {
    id: 'LARYNX',
    label: 'Larynx',
    category: 'respiratory',
    description: 'Voice box and upper airway sphincter at the base of the throat.',
    defaultColor: '#bfdbfe',
    defaultOpacity: 0.70,
    glbPath: '/models/larynx.glb',
    position: [0.00, 0.574, 0.015],
    scale: [0.075, 0.075, 0.075],
    rotation: [0, 0, 0],
    layer: 'airway'
  },

  // ── DIGESTIVE ─────────────────────────────────────────────────────────────
  LIVER: {
    id: 'LIVER',
    label: 'Liver',
    category: 'digestive',
    description: 'Largest metabolic organ seated in the right hypochondrium.',
    defaultColor: '#92400e',
    defaultOpacity: 0.90,
    glbPath: '/models/liver.glb',
    position: [-0.055, 0.285, 0.02],
    scale: [0.175, 0.175, 0.175],
    rotation: [0, 0, 0],
    layer: 'organs'
  },

  SPLEEN: {
    id: 'SPLEEN',
    label: 'Spleen',
    category: 'digestive',
    description: 'Lymphoid organ for blood filtration in the left hypochondrium.',
    defaultColor: '#7c3aed',
    defaultOpacity: 0.88,
    glbPath: '/models/spleen.glb',
    position: [0.10, 0.275, -0.02],
    scale: [0.115, 0.115, 0.115],
    rotation: [0, 0, 0],
    layer: 'organs'
  },

  PANCREAS: {
    id: 'PANCREAS',
    label: 'Pancreas',
    category: 'endocrine',
    description: 'Endocrine and exocrine gland in the transpyloric plane.',
    defaultColor: '#d97706',
    defaultOpacity: 0.88,
    glbPath: '/models/pancreas.glb',
    position: [0.01, 0.255, 0.00],
    scale: [0.165, 0.165, 0.165],
    rotation: [0, 0, 0],
    layer: 'organs'
  },

  LARGE_INTESTINE: {
    id: 'LARGE_INTESTINE',
    label: 'Large Intestine',
    category: 'digestive',
    description: 'Colon framing the abdominal cavity for water absorption.',
    defaultColor: '#b45309',
    defaultOpacity: 0.80,
    glbPath: '/models/large_intestine.glb',
    position: [0.00, 0.135, 0.00],
    scale: [0.175, 0.175, 0.175],
    rotation: [0, 0, 0],
    layer: 'digestive'
  },

  SMALL_INTESTINE: {
    id: 'SMALL_INTESTINE',
    label: 'Small Intestine',
    category: 'digestive',
    description: 'Central abdominal loops responsible for nutrient absorption.',
    defaultColor: '#ca8a04',
    defaultOpacity: 0.78,
    glbPath: '/models/small_intestine.glb',
    position: [0.00, 0.175, 0.015],
    scale: [0.155, 0.155, 0.155],
    rotation: [0, 0, 0],
    layer: 'digestive'
  },

  // ── URINARY ───────────────────────────────────────────────────────────────
  KIDNEY_LEFT: {
    id: 'KIDNEY_LEFT',
    label: 'Left Kidney',
    category: 'urinary',
    description: 'Left retroperitoneal filtration organ at T12-L3.',
    defaultColor: '#6d28d9',
    defaultOpacity: 0.90,
    glbPath: '/models/kidney_left.glb',
    position: [0.075, 0.225, -0.055],
    scale: [0.155, 0.155, 0.155],
    rotation: [0, 0, 0],
    layer: 'organs'
  },

  KIDNEY_RIGHT: {
    id: 'KIDNEY_RIGHT',
    label: 'Right Kidney',
    category: 'urinary',
    description: 'Right retroperitoneal filtration organ, inferior to the liver.',
    defaultColor: '#6d28d9',
    defaultOpacity: 0.90,
    glbPath: '/models/kidney_right.glb',
    position: [-0.075, 0.210, -0.055],
    scale: [0.155, 0.155, 0.155],
    rotation: [0, 0, 0],
    layer: 'organs'
  },

  URETER_LEFT: {
    id: 'URETER_LEFT',
    label: 'Left Ureter',
    category: 'urinary',
    description: 'Left ureterial duct descending from kidney to bladder.',
    defaultColor: '#8b5cf6',
    defaultOpacity: 0.65,
    glbPath: '/models/ureter_left.glb',
    position: [0.065, 0.145, -0.04],
    scale: [0.095, 0.095, 0.095],
    rotation: [0, 0, 0],
    layer: 'urinary'
  },

  URETER_RIGHT: {
    id: 'URETER_RIGHT',
    label: 'Right Ureter',
    category: 'urinary',
    description: 'Right ureterial duct descending from kidney to bladder.',
    defaultColor: '#8b5cf6',
    defaultOpacity: 0.65,
    glbPath: '/models/ureter_right.glb',
    position: [-0.065, 0.135, -0.04],
    scale: [0.095, 0.095, 0.095],
    rotation: [0, 0, 0],
    layer: 'urinary'
  },

  URINARY_BLADDER: {
    id: 'URINARY_BLADDER',
    label: 'Urinary Bladder',
    category: 'urinary',
    description: 'Detrusor muscle sac for urine storage in the pelvic floor.',
    defaultColor: '#a78bfa',
    defaultOpacity: 0.72,
    glbPath: '/models/urinary_bladder.glb',
    position: [0.00, 0.065, 0.015],
    scale: [0.105, 0.105, 0.105],
    rotation: [0, 0, 0],
    layer: 'urinary'
  },

  // ── REPRODUCTIVE ──────────────────────────────────────────────────────────
  BREAST_LEFT: {
    id: 'BREAST_LEFT',
    label: 'Left Breast',
    category: 'reproductive',
    description: 'Left anterior mammary glandular tissue over pectoralis major.',
    defaultColor: '#f472b6',
    defaultOpacity: 0.75,
    glbPath: null, // procedural geometry (sex-conditional)
    position: [0.09, 0.39, 0.08],
    scale: [0.20, 0.20, 0.16],
    rotation: [0, 0, 0],
    layer: 'organs'
  },

  BREAST_RIGHT: {
    id: 'BREAST_RIGHT',
    label: 'Right Breast',
    category: 'reproductive',
    description: 'Right anterior mammary glandular tissue over pectoralis major.',
    defaultColor: '#f472b6',
    defaultOpacity: 0.75,
    glbPath: null, // procedural geometry (sex-conditional)
    position: [-0.09, 0.39, 0.08],
    scale: [0.20, 0.20, 0.16],
    rotation: [0, 0, 0],
    layer: 'organs'
  }
};
