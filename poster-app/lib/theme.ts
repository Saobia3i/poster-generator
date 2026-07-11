/**
 * theme.ts — AUSTCAIC Poster Generator Design System
 *
 * This file is the SINGLE SOURCE OF TRUTH for all fixed design values.
 * Non-engineer teammates: edit colors, fonts, sizes, and spacing here.
 * Never hardcode these values anywhere else in the codebase.
 *
 * To update the design system:
 *   - Colors → COLORS object below
 *   - Fonts  → FONTS object below (also update fontLoader.ts)
 *   - Sizes  → SIZE_PRESETS object below
 *   - Spacing → spacing() function multipliers in layoutEngine.tsx
 */

// ─────────────────────────────────────────────
// SIZE PRESETS
// All dimensions at 300 DPI for print quality.
// Conversion: px = inches × 300
// ─────────────────────────────────────────────
export const SIZE_PRESETS = {
  banner_small: {
    name: '5×2 Banner',
    widthIn: 5,
    heightIn: 2,
    widthPx: 1500,
    heightPx: 600,
  },
  facebook_post: {
    name: 'Facebook Post (1.91:1)',
    widthIn: 4,
    heightIn: 2.1,
    widthPx: 1200,
    heightPx: 630,
  },
  instagram_square: {
    name: 'Instagram Square (1:1)',
    widthIn: 3.6,
    heightIn: 3.6,
    widthPx: 1080,
    heightPx: 1080,
  },
  instagram_story: {
    name: 'Instagram Story (9:16)',
    widthIn: 3.6,
    heightIn: 6.4,
    widthPx: 1080,
    heightPx: 1920,
  },
  poster_landscape: {
    name: '5x8 Poster',
    widthIn: 5,
    heightIn: 8,
    widthPx: 1500,
    heightPx: 2400,
  },
  poster_portrait_a4: {
    name: 'A4 Portrait',
    widthIn: 8.27,
    heightIn: 11.69,
    widthPx: 2481,
    heightPx: 3508,
  },
  custom: {
    name: 'Custom',
    widthIn: 0,
    heightIn: 0,
    widthPx: 0,
    heightPx: 0,
  },
} as const;

export type SizePresetKey = keyof typeof SIZE_PRESETS;

// ─────────────────────────────────────────────
// COLOR PALETTE
// Extracted via pixel sampling from real reference posters.
// NOTE: headlineGradient is nearly flat due to JPEG compression —
//       update from original Figma/vector file when available.
// ─────────────────────────────────────────────
export const COLORS = {
  headlineGradientStart: '#4C3782', // deep navy-purple, headline left edge
  headlineGradientEnd: '#7B5EA7',   // widened for visual interest (sampled: #4B357F, nearly flat due to JPEG)
  logoIconColor: '#35468B',         // AUSTCAIC hexagon mark
  wordmarkText: '#1E274D',          // AUSTCAIC wordmark — darkest text on poster
  headingText: '#3D2A5A',           // e.g. "WEEKLY CLASSES ON"
  bodyText: '#3B2D56',              // bullet list text
  subtitleText: '#686579',          // muted secondary tone, intentionally lighter
  accentLine: '#524A98',            // icon stroke color (shield/lock icons)
  watermarkText: '#5F5878',         // corner "SECURE" / "LEAD" words
  backgroundBase: '#F7F4FA',        // clean off-white/lavender background
  patternLine: '#71677A',           // topographic overlay lines (used at low opacity)
  tableHeader: '#4C3782',           // table header row background
  tableRowAlt: 'rgba(76,55,130,0.06)', // alternating table row tint
  tableBorder: 'rgba(82,74,152,0.25)', // table cell border
  badgeBg: 'rgba(82,74,152,0.15)',  // icon badge background tint
  white: '#FFFFFF',
} as const;

// ─────────────────────────────────────────────
// FONTS
// Fixed families — never expose as editable in the form UI.
// satori loads these as ArrayBuffer from /public/fonts/ (see fontLoader.ts)
// next/font/google is used for the form UI only.
// ─────────────────────────────────────────────
export const FONTS = {
  headline: 'Oswald',   // heavy condensed bold sans — matches brand reference
  body: 'Poppins',      // geometric sans — matches brand reference
} as const;

// ─────────────────────────────────────────────
// LAYOUT VARIANTS
// Size Preset → Layout Variant (never the other way around)
// ─────────────────────────────────────────────
export const PRESET_TO_VARIANT = {
  banner_small: 'banner',
  facebook_post: 'landscape',
  instagram_square: 'portrait',
  instagram_story: 'portrait',
  poster_landscape: 'portrait',
  poster_portrait_a4: 'portrait',
  custom: 'landscape',
} as const;

export type LayoutVariant = 'landscape' | 'portrait' | 'banner';

export const BACKGROUND_TEMPLATES = {
  banner_small: 'public/templates/bg-5by2.png',
  facebook_post: 'public/templates/bg-pattern.png',
  instagram_square: 'public/templates/bg-pattern.png',
  instagram_story: 'public/templates/bg-pattern.png',
  poster_landscape: 'public/templates/bg-5by8.png',
  poster_portrait_a4: 'public/templates/bg-a4.jpg',
  custom: 'public/templates/bg-pattern.png',
} as const satisfies Record<SizePresetKey, string>;

// Which form fields are available per layout variant
// Drives field visibility in the form UI
export const VARIANT_FEATURES = {
  landscape: {
    subtitle: true,
    bulletList: true,
    table: true,
    iconBadges: true,
    qrCode: false,
    imageUpload: true,
    watermarkWords: true,
    extraBadge: true,
  },
  portrait: {
    subtitle: true,
    bulletList: true,
    table: true,
    iconBadges: false,
    qrCode: true,
    imageUpload: true,
    watermarkWords: false,
    extraBadge: true,
  },
  banner: {
    subtitle: true, // short tag line only
    bulletList: false,
    table: false,
    iconBadges: false,
    qrCode: false,
    imageUpload: false,
    watermarkWords: false,
    extraBadge: false,
  },
} as const;

// ─────────────────────────────────────────────
// SPACING SYSTEM
//
// ALL margins, paddings, and gaps MUST use this function.
// Never use arbitrary pixel values in layoutEngine.tsx.
//
// Base unit = posterWidthPx / 150
// This scales spacing proportionally with poster dimensions,
// so the same multipliers look correct on both Banner and A4.
//
// Usage:
//   spacing(2, width)  → small gap
//   spacing(6, width)  → section gap
//   spacing(10, width) → outer margin
//   spacing(12, width) → portrait outer margin
// ─────────────────────────────────────────────
export const spacing = (multiplier: number, posterWidthPx: number): number =>
  Math.round((posterWidthPx / 150) * multiplier);

// Safe margin multipliers — nothing renders inside this zone (prevents print edge-cropping)
export const SAFE_MARGINS = {
  landscape: { x: 10, y: 10 },
  portrait: { x: 12, y: 14 }, // slightly larger for A4 print bleed
  banner: { x: 10, y: 10 },
} as const;

// Background pattern tile scale factor (relative to poster width)
// At 20% of poster width, the pattern tiles with good visual density
export const PATTERN_TILE_SCALE = 0.25;

// Pattern opacity applied in layout engine
export const PATTERN_OPACITY = 0.10;
