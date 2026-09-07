export const SEVERITY_TIERS = [
  {
    level: "normal",
    label: "Normal",
    range: [0, 0],
    hexColor: "#10b981",
    emissiveColor: "#059669",
    emissiveIntensity: 0.0,
    textColor: "text-emerald-400",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
    pattern: "solid",
    icon: "ShieldCheck"
  },
  {
    level: "low",
    label: "Low",
    range: [1, 20],
    hexColor: "#eab308",
    emissiveColor: "#ca8a04",
    emissiveIntensity: 0.4,
    textColor: "text-yellow-400",
    badgeClass: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
    pattern: "dots",
    icon: "AlertCircle"
  },
  {
    level: "mild",
    label: "Mild",
    range: [21, 40],
    hexColor: "#f59e0b",
    emissiveColor: "#d97706",
    emissiveIntensity: 0.55,
    textColor: "text-amber-400",
    badgeClass: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
    pattern: "diagonal",
    icon: "AlertTriangle"
  },
  {
    level: "moderate",
    label: "Moderate",
    range: [41, 60],
    hexColor: "#f97316",
    emissiveColor: "#ea580c",
    emissiveIntensity: 0.75,
    textColor: "text-orange-400",
    badgeClass: "bg-orange-500/20 text-orange-300 border border-orange-500/40",
    pattern: "grid",
    icon: "Activity"
  },
  {
    level: "high",
    label: "High",
    range: [61, 80],
    hexColor: "#ef4444",
    emissiveColor: "#dc2626",
    emissiveIntensity: 0.95,
    textColor: "text-red-400",
    badgeClass: "bg-red-500/20 text-red-300 border border-red-500/40",
    pattern: "crosshatch",
    icon: "Flame"
  },
  {
    level: "very_high",
    label: "Very High",
    range: [81, 100],
    hexColor: "#b91c1c",
    emissiveColor: "#991b1b",
    emissiveIntensity: 1.25,
    textColor: "text-rose-400",
    badgeClass: "bg-rose-700/30 text-rose-300 border border-rose-600/50",
    pattern: "dense",
    icon: "AlertOctagon"
  }
];

export function getSeverityTier(percentage) {
  const pct = Math.max(0, Math.min(100, Number(percentage) || 0));
  for (const tier of SEVERITY_TIERS) {
    const [min, max] = tier.range;
    if (pct >= min && pct <= max) {
      return tier;
    }
  }
  return SEVERITY_TIERS[SEVERITY_TIERS.length - 1];
}
