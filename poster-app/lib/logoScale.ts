/**
 * logoScale.ts — Content Density Tier Logic
 *
 * Both logos scale down from their fixed anchor position
 * when poster content becomes dense. The anchor point never moves —
 * only the scale transform changes.
 *
 * Hard floor: 0.7 (70%) — logos never render smaller than this.
 * If content exceeds dense capacity, shrink table font/row-height first.
 */

export type ContentTier = 'minimal' | 'medium' | 'dense';

/**
 * Determines content density tier based on form inputs.
 * Called by layoutEngine.tsx and the form UI for density warnings.
 */
export function getContentTier(
  hasTable: boolean,
  tableRows: number,
  bodyLength: number
): ContentTier {
  if (hasTable && tableRows >= 5) return 'dense';
  if (hasTable && tableRows > 0) return 'medium';
  if (bodyLength > 400) return 'medium';
  return 'minimal';
}

/** Scale multipliers per tier. Never go below 'dense' (0.7). */
export const LOGO_SCALE: Record<ContentTier, number> = {
  minimal: 1.0,
  medium: 0.85,
  dense: 0.7, // hard floor — content pushes table font size down before touching this
};

export function getLogoScale(tier: ContentTier): number {
  return LOGO_SCALE[tier];
}

/** Human-readable warning message shown in the form UI when logos shrink */
export function getDensityWarning(tier: ContentTier): string | null {
  if (tier === 'dense') return 'Logo resized to 70% due to table size. Add fewer rows to restore full size.';
  if (tier === 'medium') return 'Logo resized to 85% to accommodate content.';
  return null;
}
