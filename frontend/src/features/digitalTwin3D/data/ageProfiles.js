export const AGE_PROFILES = [
  {
    id: "<18",
    label: "Pediatric / Adolescent (<18)",
    description: "Pediatric anatomical profile with developmental physiological parameters.",
    assetStatus: "pending_pediatric_asset",
    bodyScale: [0.85, 0.85, 0.85],
    metabolicModifier: "Pediatric High Metabolism"
  },
  {
    id: "18-40",
    label: "Young Adult (18–40)",
    description: "Baseline young adult anatomical morphology with standard organ topology.",
    assetStatus: "active",
    bodyScale: [1.0, 1.0, 1.0],
    metabolicModifier: "Standard Baseline"
  },
  {
    id: "40-60",
    label: "Middle Adult (40–60)",
    description: "Adult anatomy with mid-life metabolic and vascular baseline considerations.",
    assetStatus: "active",
    bodyScale: [1.0, 1.0, 1.0],
    metabolicModifier: "Mid-Life Baseline"
  },
  {
    id: "60+",
    label: "Older Adult (60+)",
    description: "Older adult anatomy with age-specific structural and parenchymal visualization metadata.",
    assetStatus: "active",
    bodyScale: [0.98, 0.98, 0.98],
    metabolicModifier: "Geriatric Structural Metadata"
  }
];
