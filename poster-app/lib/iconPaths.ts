/**
 * iconPaths.ts — SVG Path Data for Satori Icon Rendering
 *
 * Lucide-compatible SVG paths used in the icon-badge row (Landscape variant).
 * Each entry is an array of path strings for a 24×24 viewBox.
 *
 * To add more icons:
 *  1. Find the icon at lucide.dev
 *  2. Copy the SVG path data (d attribute)
 *  3. Add an entry here with a lowercase kebab-case key
 *
 * The form UI uses lucide-react for visual selection.
 * The layout engine uses these raw paths for satori SVG rendering.
 */

export const ICON_PATHS: Record<string, string[]> = {
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  'shield-check': [
    'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    'M9 12l2 2 4-4',
  ],
  lock: [
    'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z',
    'M7 11V7a5 5 0 0 1 10 0v4',
  ],
  wifi: [
    'M5 12.55a11 11 0 0 1 14.08 0',
    'M1.42 9a16 16 0 0 1 21.16 0',
    'M8.53 16.11a6 6 0 0 1 6.95 0',
    'M12 20h.01',
  ],
  code: ['M16 18l6-6-6-6', 'M8 6l-6 6 6 6'],
  'code-2': [
    'M4 17l3-3-3-3',
    'M13 21H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v2',
    'M15 14l5-5-5-5',
    'M15 14h7',
    'M20 9v10a2 2 0 0 1-2 2H9',
  ],
  globe: [
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
    'M2 12h20',
    'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  ],
  users: [
    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2',
    'M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0',
    'M23 21v-2a4 4 0 0 0-3-3.87',
    'M16 3.13a4 4 0 0 1 0 7.75',
  ],
  star: [
    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  ],
  zap: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'],
  award: [
    'M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z',
    'M8.21 13.89L7 23l5-3 5 3-1.21-9.12',
  ],
  target: [
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
    'M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z',
    'M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  ],
  cpu: [
    'M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z',
    'M9 9h6v6H9z',
    'M9 1v3',
    'M15 1v3',
    'M9 20v3',
    'M15 20v3',
    'M20 9h3',
    'M20 14h3',
    'M1 9h3',
    'M1 14h3',
  ],
  database: [
    'M12 2C6.5 2 2 4.2 2 7v10c0 2.8 4.5 5 10 5s10-2.2 10-5V7c0-2.8-4.5-5-10-5z',
    'M2 7c0 2.8 4.5 5 10 5s10-2.2 10-5',
    'M2 12c0 2.8 4.5 5 10 5s10-2.2 10-5',
  ],
  terminal: ['M4 17l6-6-6-6', 'M12 19h8'],
  search: [
    'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
    'M21 21l-4.35-4.35',
  ],
  mail: [
    'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z',
    'M22 6l-10 7L2 6',
  ],
  calendar: [
    'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z',
    'M16 2v4',
    'M8 2v4',
    'M3 10h18',
  ],
  brain: [
    'M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588 4 4 0 0 0 7.967 1.979 4 4 0 0 0 7.8-3.254 4 4 0 0 0 .556-6.588 4 4 0 0 0-2.526-5.77A3 3 0 0 0 12 5',
  ],
  'network': [
    'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18',
  ],
  'map-pin': [
    'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z',
    'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  ],
  'book-open': [
    'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z',
    'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  ],
  presentation: [
    'M2 3h20',
    'M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3',
    'M7 21l5-5 5 5',
  ],
};

/** List of available icon keys for the form icon picker */
export const AVAILABLE_ICONS = Object.keys(ICON_PATHS) as (keyof typeof ICON_PATHS)[];

/** Fallback icon if requested key not found */
export const FALLBACK_ICON = 'shield';
