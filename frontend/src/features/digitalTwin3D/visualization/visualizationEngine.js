import { getSeverityTier } from '../data/visualizationRules';

/**
 * Normalizes any numerical or string percentage into 0.0 - 1.0 interval safely
 */
export function normalizePercentage(value) {
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.max(0, Math.min(100, num)) / 100;
}

/**
 * Computes visualization parameters for a given anatomical structure & percentage
 */
export function computeVisualizationState(anatomyId, percentage, options = {}) {
  const pct = Math.max(0, Math.min(100, Number(percentage) || 0));
  const tier = getSeverityTier(pct);
  const normalizedIntensity = pct / 100;

  // Cloned material visual properties
  const opacity = pct > 0 ? Math.min(0.95, 0.4 + normalizedIntensity * 0.5) : 0.0;
  const emissiveIntensity = tier.emissiveIntensity;
  const pulseSpeed = pct > 60 ? 2.5 : pct > 20 ? 1.5 : 0.8;

  return {
    anatomyId,
    percentage: pct,
    normalizedIntensity,
    severityLevel: tier.level,
    severityLabel: tier.label,
    hexColor: tier.hexColor,
    emissiveColor: tier.emissiveColor,
    emissiveIntensity,
    opacity,
    pulseSpeed,
    badgeClass: tier.badgeClass,
    textColor: tier.textColor,
    icon: tier.icon,
    pattern: tier.pattern,
    subregion: options.subregion || null,
    position: options.position || null,
    radius: options.radius || null
  };
}
