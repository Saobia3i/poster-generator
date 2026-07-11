# context.md — Poster Generator Project

> Reference this file throughout development. It holds the fixed facts about this project that should never drift — tech decisions, design system values, and conventions. The full build spec lives in `poster-generator-build-prompt.md`; this file is the always-true summary to check against when making any change.

## Project Summary
Internal tool for a club's graphics team to generate posters in fixed sizes without needing a designer for every single poster. Background, fonts, colors, and grid are locked; only content (text, tables, icons, QR codes, images) varies per poster.

## Who This Is For
Small graphics team, mix of technical and non-technical members. The form-based UI must be usable by someone with zero design or coding background. Any AI-assist feature is optional enhancement, never a blocker — the tool must always work fully manually.

## Tech Stack (locked — do not introduce alternatives without discussion)
- Next.js 15, App Router, TypeScript
- Tailwind CSS — form/editor UI only, not the poster render itself
- `satori` + `@resvg/resvg-js` (or `@vercel/og`) — server-side JSX → SVG → PNG poster rendering. No Puppeteer, no headless browser.
- Zod — validation for form payloads and AI response shapes
- Groq (`llama-3.3-70b` or current preferred model) — AI content assistant, called server-side only
- Pinecone — RAG corpus of past poster copy, for style-consistency in AI-generated text
- `qrcode` npm package — server-side QR generation for the Portrait variant
- No database required initially — poster history stored as `posters.json`

## Architecture Decision Log
- **AI content assist lives inside Next.js, not a separate Python service.** Groq and Pinecone both have full Node SDK support; a separate FastAPI microservice would add deployment/auth overhead with no benefit at this scale. Revisit only if this grows into heavy batch processing or model fine-tuning.
- **satori over Puppeteer/html-to-image.** Server-side, no browser dependency, faster cold starts, simpler deploy on Vercel.
- **Size Preset determines Layout Variant, not the other way around.** Landscape and Portrait posters are structurally different layouts, not the same layout scaled — never try to make one JSX template serve both.

## Fixed Size Presets
| Preset | Dimensions | Layout Variant |
|---|---|---|
| `banner_small` | 5in x 2in | Banner (minimal) |
| `poster_landscape` | 8in x 5in | Landscape Info Poster |
| `poster_portrait_a4` | A4 (8.27in x 11.69in) | Portrait Announcement/QR Poster |
| `custom` | user-defined inches | defaults to Landscape unless specified |

All rendered at 300 DPI. Conversion: `px = inches * 300`.

## Fixed Design Tokens
Defined once in `lib/theme.ts`, imported everywhere, never hardcoded elsewhere. Values below extracted via pixel sampling from the actual reference poster (real measurement, not visual approximation):
- `COLORS.headlineGradientStart` = `#4C3782` (deep navy-purple, left edge)
- `COLORS.headlineGradientEnd` = `#4B357F` (near-identical to start — see note below)
- `COLORS.logoIconColor` = `#35468B` (AUSTCAIC hexagon mark)
- `COLORS.wordmarkText` = `#1E274D` (AUSTCAIC wordmark, darkest text)
- `COLORS.headingText` = `#3D2A5A`
- `COLORS.bodyText` = `#3B2D56`
- `COLORS.subtitleText` = `#686579` (muted secondary tone)
- `COLORS.accentLine` = `#524A98` (icon stroke color)
- `COLORS.watermarkText` = `#5F5878`
- `COLORS.backgroundBase` = `#F7F4FA`
- `COLORS.patternLine` = `#71677A` (circuit-board overlay, low opacity)
- Background pattern: subtle navy circuit-board/topographic texture at ~8-12% opacity, single source file in `/public/templates/bg-pattern.svg`, center-cropped (never stretched) per aspect ratio
- Headline font: heavy condensed bold sans (Anton/Bebas Neue/Oswald Bold family — confirm exact from brand kit)
- Body font: geometric sans (Poppins/Montserrat family — confirm exact from brand kit)

**Note on gradient:** pixel sampling found the headline "gradient" nearly flat — JPEG compression likely flattened a more dramatic shift from the original design. These values are a safe starting point; re-sample from the original Figma/vector file if it becomes available for a more accurate gradient.

## Grid & Spacing Rule (non-negotiable)
Single base unit: `spacing(multiplier, posterWidthPx) = round((posterWidthPx / 150) * multiplier)`. Every margin, padding, and gap in the codebase must be expressed through this function — no arbitrary pixel values. Related elements (e.g. both logos, or a bullet list + icon row that should share a bottom edge) must be children of one flex/grid container so alignment is structural, never matched by hand-picked coordinates. This was the specific bug in our original manual poster designs — do not reintroduce it.

## Layout Variants
1. **Landscape Info Poster** — club logo top-left / varsity logo top-right (shared vertical center), gradient headline + subtitle + bullet list left-aligned to one margin, icon-badge row + bullet list sharing one bottom baseline, optional corner watermark words.
2. **Portrait Announcement/QR Poster** — logo, headline, QR code, bullet list all centered on one shared vertical axis, varsity logo small bottom-left.
3. **Banner** — logo + short headline + one-line tag only. Table, icon-row, and QR fields hidden in the form when this size is selected.

## Dynamic Elements & Where They're Valid
| Element | Landscape | Portrait | Banner |
|---|---|---|---|
| Title | ✅ | ✅ | ✅ |
| Subtitle | ✅ | ✅ | optional short tag only |
| Bullet list | ✅ | ✅ | ❌ |
| Table | ✅ | ✅ | ❌ |
| Icon-badge row | ✅ | ❌ | ❌ |
| QR code | ❌ | ✅ | ❌ |
| Image upload | ✅ | ✅ | ❌ |
| Corner watermark words | ✅ | ❌ | ❌ |

## Logo Auto-Scale Tiers
```
minimal (no table, short body) → 100% scale
medium (short table OR long body) → 85% scale
dense (table with 5+ rows) → 70% scale, hard floor — never go smaller
```
Anchor point (e.g. top-left corner) never moves; only scale transforms from that fixed anchor.

## File/Folder Structure
```
/app
  /generate                    — form + live preview page
  /api/generate-poster/route.ts
  /api/ai-content-assist/route.ts
/components
  PosterPreview.tsx
  FormFields/
  TableBuilder.tsx
  IconBadgeBuilder.tsx
/lib
  theme.ts          — fixed colors, fonts, spacing function, size presets
  layoutEngine.tsx   — one render function per layout variant
  logoScale.ts       — content-tier logo scaling logic
/public/templates    — background pattern, logo assets
posters.json          — generated poster history log
```

## Conventions
- All AI-facing text (system prompts, Zod schemas) written in English for reliability; UI copy can be Bangla/English mixed per team preference.
- Every new layout variant must reuse `theme.ts` and `spacing()` — no per-variant color or spacing constants.
- AI content assist is always optional and editable — never auto-submits without team member review.
- Reference posters (landscape "Hands on Weekends" poster, portrait QR poster) are the ground truth for spacing/proportion — when in doubt, match those, not this document's approximations.

## Resolved Defaults (as of latest build decision)
- **Fonts locked:** Headline = Oswald Bold, Body = Poppins (both Google Fonts — load via `next/font/google`, no separate license/hosting needed).
- **Background pattern:** Provided as an actual texture asset (topographic contour-line pattern, tileable, sampled at 688x192px source) — save to `/public/templates/bg-pattern.png` (or convert to SVG if a vector version is needed for crisper scaling at large poster sizes). This is the real pattern used across all existing posters, not a placeholder — every Layout Variant (Landscape, Portrait, Banner) must use this same source file, center-cropped/tiled per aspect ratio, never a different or regenerated pattern.
- **Corner watermark pair:** Defaults to `"SECURE"` / `"LEAD"`, exposed as an editable field in the form (not hardcoded — team can override per poster).
- **RAG corpus:** `/api/ai-content-assist` endpoint built and functional against Pinecone, but launches with an empty/unseeded index. AI content assist will work (Groq generation still runs) but without style-reference examples until the corpus is seeded — seed ~20-30 past poster captions when ready, no code change needed after that, just data.

## Still Open
- [ ] Confirm extracted hex codes against the original brand kit / Figma file if it becomes available, especially the headline gradient (sampled nearly flat due to JPEG compression — may have been more dramatic in the source design).