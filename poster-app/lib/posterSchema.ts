/**
 * posterSchema.ts — Zod Validation Schemas
 *
 * All AI-facing schemas are written in English for reliability.
 * UI copy may be in Bangla/English per team preference.
 */

import { z } from 'zod';

export const IconBadgeSchema = z.object({
  icon: z.string().default('shield'),
  label: z.string().default(''),
});

export const LogoPositionSchema = z.enum([
  'top-left',
  'top-center',
  'top-right',
  'center',
  'bottom-left',
  'bottom-center',
  'bottom-right',
  'hidden',
]);

export const PosterFormSchema = z.object({
  // ── Size ──────────────────────────────────
  sizePreset: z.enum([
    'banner_small',
    'facebook_post',
    'instagram_square',
    'instagram_story',
    'poster_landscape',
    'poster_portrait_a4',
    'custom',
  ]),
  customWidthIn: z.number().positive().optional(),
  customHeightIn: z.number().positive().optional(),

  // ── Basic Info ────────────────────────────
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional().default(''),
  clubLogoPosition: LogoPositionSchema.default('top-center'),
  varsityLogoPosition: LogoPositionSchema.default('bottom-center'),

  // ── Body content ──────────────────────────
  bulletList: z.array(z.string()).default([]),

  // ── Table ─────────────────────────────────
  hasTable: z.boolean().default(false),
  tableHeaders: z.array(z.string()).default(['Column 1', 'Column 2']),
  tableRows: z.array(z.array(z.string())).default([['', '']]),

  // ── Icon Badges (Landscape only) ──────────
  hasIconBadges: z.boolean().default(false),
  iconBadges: z.array(IconBadgeSchema).default([]),

  // ── QR Code (Portrait only) ───────────────
  hasQrCode: z.boolean().default(false),
  qrUrl: z.string().optional().default(''),

  // ── Corner Watermarks (Landscape only) ────
  hasWatermark: z.boolean().default(true),
  watermarkLeft: z.string().default('SECURE'),
  watermarkRight: z.string().default('LEAD'),

  // ── Extra Badge ───────────────────────────
  hasExtraBadge: z.boolean().default(false),
  extraBadgeText: z.string().optional().default('REGISTRATION OPEN'),

  // ── Image Upload ──────────────────────────
  imageDataUrl: z.string().optional(),

  // ── Layout Control (Drag-and-Drop) ────────
  sectionOrder: z.array(z.enum(['content', 'bullets', 'table', 'badges', 'qrcode', 'image']))
    .default(['content', 'bullets', 'table', 'badges', 'qrcode', 'image']),
  bulletColumns: z.number().int().min(1).max(3).default(1),
  logoLayout: z.enum(['split', 'side_by_side']).default('split'),

  // ── AI Assist (form-side only, not sent to generate-poster) ──
  quickNotes: z.string().optional().default(''),
});

export type PosterFormData = z.infer<typeof PosterFormSchema>;

// ── AI Content Assist Response Shape ──────────────────────────────
// Groq must return this exact structure (enforced by Zod after parsing)
export const AIContentSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  body: z.array(z.string()),
  suggestedTable: z.boolean(),
  tableData: z
    .object({
      headers: z.array(z.string()),
      rows: z.array(z.array(z.string())),
    })
    .optional(),
});

export type AIContent = z.infer<typeof AIContentSchema>;
