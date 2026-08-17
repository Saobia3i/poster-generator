/**
 * layoutEngine.tsx — Satori JSX Layout Variants
 *
 * Exports one render function per Layout Variant:
 *   renderLandscapeInfoPoster()
 *   renderPortraitQrPoster()
 *   renderBanner()
 *
 * ALL layout rules:
 * - Every spacing value uses spacing() — ZERO arbitrary px numbers
 * - Related elements share ONE flex container (no manually matched coordinates)
 * - Background pattern is tiled, never stretched
 * - Table renders as flex divs (satori has no <table> support)
 * - Brand rule: logos live in one restrained header bar above the title.
 *   They should never sit in the poster body, compete with the headline, or drift to the footer.
 *
 * To add a new layout variant:
 *   1. Add a render function here
 *   2. Add an entry to PRESET_TO_VARIANT in theme.ts
 *   3. Add features to VARIANT_FEATURES in theme.ts
 */

import React from 'react';
import { COLORS, FONTS, spacing, SAFE_MARGINS } from './theme';
import { ContentTier, LOGO_SCALE } from './logoScale';
import { ICON_PATHS, FALLBACK_ICON } from './iconPaths';
import { icons } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface IconBadge {
  icon: string;
  label: string;
  x: number;
  y: number;
  size: 'small' | 'medium' | 'large';
}

export interface PosterAssets {
  clubLogoDataUrl: string | null;
  varsityLogoDataUrl: string | null;
  patternDataUrl: string | null;
  qrDataUrl?: string | null;
  uploadedImageDataUrl?: string | null;
  partnerLogoDataUrl?: string | null;
}

export interface LayoutData {
  title: string;
  subtitle?: string;
  clubLogoPosition: 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'hidden';
  varsityLogoPosition: 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'hidden';
  hasPartnerLogo?: boolean;
  partnerLogoDataUrl?: string;
  partnerLogoPosition?: 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'hidden';
  bulletList: string[];
  bulletIcons: (string | null)[];
  hasTable: boolean;
  tableHeaders: string[];
  tableRows: string[][];
  hasIconBadges: boolean;
  iconBadges: IconBadge[];
  hasQrCode: boolean;
  qrUrl: string;
  hasWatermark: boolean;
  watermarkLeft: string;
  watermarkRight: string;
  hasExtraBadge: boolean;
  extraBadgeText?: string;
  contentTier: ContentTier;
  widthPx: number;
  heightPx: number;
  sectionOrder: ('content' | 'bullets' | 'table' | 'badges' | 'qrcode' | 'image')[];
  bulletColumns: number;
  bulletAlignment: 'left' | 'center' | 'right';
  logoLayout: 'split' | 'side_by_side';
  // Image frame
  imageFrame?: 'none' | 'circle' | 'square' | 'rectangle';
  imagePosition?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  imageSize?: 'small' | 'medium' | 'large';
}

// ─────────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────────

/** Renders the tiled background pattern */
function BackgroundPattern({
  patternDataUrl,
  widthPx,
}: {
  patternDataUrl: string | null;
  widthPx: number;
}) {
  if (!patternDataUrl) return null;
  // Tile size: PATTERN_TILE_SCALE × posterWidth, preserving pattern aspect ratio (688:192 ≈ 3.58:1)

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${patternDataUrl})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
      }}
    />
  );
}

/** Renders an SVG icon from our ICON_PATHS registry */
function SatoriIcon({
  name,
  size,
  color,
}: {
  name: string;
  size: number;
  color: string;
}) {
  const lucideIcons = icons as unknown as Record<string, unknown>;
  const lucideNode = lucideIcons[name] ?? lucideIcons[toPascalCase(name)];
  if (lucideNode) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {(lucideNode as unknown as [string, Record<string, string>][]).map(([tag, attrs], i) =>
          React.createElement(tag, { ...attrs, key: i })
        )}
      </svg>
    );
  }
  const paths = ICON_PATHS[name] || ICON_PATHS[FALLBACK_ICON];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

function toPascalCase(value: string) {
  return value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function AbsoluteIconLayer({ badges, widthPx, heightPx }: { badges: IconBadge[]; widthPx: number; heightPx: number }) {
  const sizeFor = { small: 0.045, medium: 0.07, large: 0.1 } as const;
  return (
    <>
      {badges.map((badge, index) => {
        const iconSize = Math.round(widthPx * sizeFor[badge.size]);
        // Keep icon artwork and its optional label inside the safe print area
        // at every aspect ratio, even when the user enters 0 or 100.
        const xMargin = Math.max(6, (iconSize / widthPx) * 70);
        const yMargin = Math.max(6, (iconSize / heightPx) * 70);
        const x = Math.min(100 - xMargin, Math.max(xMargin, badge.x));
        const y = Math.min(100 - yMargin, Math.max(yMargin, badge.y));
        return <div key={index} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 20 }}>
          <SatoriIcon name={badge.icon} size={iconSize} color={COLORS.accentLine} />
          {badge.label && <span style={{ fontFamily: FONTS.body, fontSize: Math.max(12, Math.round(iconSize * 0.28)), color: COLORS.bodyText }}>{badge.label.toUpperCase()}</span>}
        </div>;
      })}
    </>
  );
}

/** Shared Lucide-compatible icon row used by every poster variant. */
function IconBadgeRow({
  badges,
  widthPx,
  compact = false,
}: {
  badges: IconBadge[];
  widthPx: number;
  compact?: boolean;
}) {
  const iconSize = spacing(compact ? 5 : 8, widthPx);
  const labelSize = spacing(compact ? 1.6 : 2.1, widthPx);

  return (
    <div
      style={{
        display: 'none',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing(compact ? 2 : 3, widthPx),
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      {badges.map((badge, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(compact ? 0.7 : 1.3, widthPx) }}>
          <div
            style={{
              width: iconSize,
              height: iconSize,
              borderRadius: '50%',
              border: `${spacing(0.4, widthPx)}px solid ${COLORS.accentLine}`,
              backgroundColor: COLORS.badgeBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SatoriIcon name={badge.icon} size={Math.round(iconSize * 0.55)} color={COLORS.accentLine} />
          </div>
          <span style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: labelSize, color: COLORS.bodyText, textAlign: 'center' }}>
            {badge.label.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Renders the uploaded image with the chosen frame shape and position.
 * Uses absolute positioning within the poster wrapper.
 */
function FramedImage({
  src,
  frame,
  position,
  size,
  widthPx,
  heightPx,
  mx,
  my,
}: {
  src: string;
  frame: 'none' | 'circle' | 'square' | 'rectangle';
  position: string;
  size: 'small' | 'medium' | 'large';
  widthPx: number;
  heightPx: number;
  mx: number;
  my: number;
}) {
  // Image dimensions based on size tier
  const sizeFactor = size === 'small' ? 0.18 : size === 'large' ? 0.32 : 0.25;
  const imgW = Math.round(widthPx * sizeFactor);
  const imgH = frame === 'rectangle' ? Math.round(imgW * 0.65) : imgW;
  const borderRadius = frame === 'circle' ? '50%' : frame === 'square' ? '0px' : spacing(2, widthPx);
  const borderWidth = spacing(0.5, widthPx);

  // Position mapping to absolute coords
  const posMap: Record<string, { top?: number; bottom?: number; left?: number; right?: number }> = {
    'top-left':      { top: my, left: mx },
    'top-center':    { top: my, left: Math.round((widthPx - imgW) / 2) },
    'top-right':     { top: my, right: mx },
    'center-left':   { top: Math.round((heightPx - imgH) / 2), left: mx },
    'center':        { top: Math.round((heightPx - imgH) / 2), left: Math.round((widthPx - imgW) / 2) },
    'center-right':  { top: Math.round((heightPx - imgH) / 2), right: mx },
    'bottom-left':   { bottom: my, left: mx },
    'bottom-center': { bottom: my, left: Math.round((widthPx - imgW) / 2) },
    'bottom-right':  { bottom: my, right: mx },
  };

  const coords = posMap[position] ?? posMap['center-right'];

  return (
    <div
      style={{
        position: 'absolute',
        width: imgW,
        height: imgH,
        ...coords,
        borderRadius,
        border: `${borderWidth}px solid rgba(82,74,152,0.6)`,
        overflow: 'hidden',
        boxShadow: `0 ${spacing(2, widthPx)}px ${spacing(8, widthPx)}px rgba(0,0,0,0.35)`,
      }}
    >
      <img
        src={src}
        style={{
          width: imgW,
          height: imgH,
          objectFit: 'cover',
        }}
      />
    </div>
  );
}

/** Renders the table (as flex divs — satori has no native <table>) */
function PosterTable({
  headers,
  rows,
  widthPx,
  denseTier,
}: {
  headers: string[];
  rows: string[][];
  widthPx: number;
  denseTier: ContentTier;
}) {
  // Shrink cell font size first when content is dense (before touching logos)
  const baseFontSize = spacing(2.8, widthPx);
  const cellFontSize = denseTier === 'dense' ? Math.round(baseFontSize * 0.85) : baseFontSize;
  const cellPadX = spacing(2.5, widthPx);
  const cellPadY = denseTier === 'dense' ? spacing(1.5, widthPx) : spacing(2, widthPx);
  const colCount = Math.max(headers.length, 1);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: spacing(1.5, widthPx),
        overflow: 'hidden',
        border: `1px solid ${COLORS.tableBorder}`,
        width: '100%',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', flexDirection: 'row', backgroundColor: COLORS.tableHeader }}>
        {headers.map((header, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flex: 1,
              padding: `${cellPadY}px ${cellPadX}px`,
              borderRight: i < colCount - 1 ? `1px solid rgba(255,255,255,0.2)` : 'none',
            }}
          >
            <span
              style={{
                fontFamily: FONTS.body,
                fontWeight: 600,
                fontSize: cellFontSize,
                color: COLORS.white,
              }}
            >
              {header}
            </span>
          </div>
        ))}
      </div>

      {/* Data rows */}
      {rows.map((row, rIdx) => (
        <div
          key={rIdx}
          style={{
            display: 'flex',
            flexDirection: 'row',
            backgroundColor:
              rIdx % 2 === 0 ? COLORS.tableRowAlt : 'transparent',
            borderTop: `1px solid ${COLORS.tableBorder}`,
          }}
        >
          {row.map((cell, cIdx) => (
            <div
              key={cIdx}
              style={{
                display: 'flex',
                flex: 1,
                padding: `${cellPadY}px ${cellPadX}px`,
                borderRight:
                  cIdx < colCount - 1 ? `1px solid ${COLORS.tableBorder}` : 'none',
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.body,
                  fontWeight: 400,
                  fontSize: cellFontSize,
                  color: COLORS.bodyText,
                }}
              >
                {cell}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Extra badge pill (e.g. "REGISTRATION OPEN") */
function ExtraBadge({ text, widthPx }: { text: string; widthPx: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignSelf: 'flex-start',
        backgroundColor: COLORS.accentLine,
        borderRadius: spacing(2, widthPx),
        paddingLeft: spacing(4, widthPx),
        paddingRight: spacing(4, widthPx),
        paddingTop: spacing(1.5, widthPx),
        paddingBottom: spacing(1.5, widthPx),
        marginBottom: spacing(3, widthPx),
      }}
    >
      <span
        style={{
          fontFamily: FONTS.body,
          fontWeight: 600,
          fontSize: spacing(2.5, widthPx),
          color: COLORS.white,
          letterSpacing: spacing(0.5, widthPx),
        }}
      >
        {text.toUpperCase()}
      </span>
    </div>
  );
}

function chunkArray<T>(arr: T[], chunks: number): T[][] {
  const results: T[][] = Array.from({ length: Math.max(chunks, 1) }, () => []);
  arr.filter(Boolean).forEach((item, index) => {
    results[index % chunks].push(item);
  });
  return results;
}

// ─────────────────────────────────────────────────────────────────
// VARIANT 1: LANDSCAPE INFO POSTER (8×5 in, 2400×1500 px)
//
// Layout:
//   [Club Logo ←]                    [→ Varsity Logo]   ← shared vertical center row
//
//   BIG GRADIENT HEADLINE                                ← left-aligned to marginX
//   Subtitle line                                        ← same left edge
//   [Extra badge if on]
//
//   [Bullet list]     [optional table fills right side]  ← flex row
//
//   [• item 1 ]     [icon] Label [icon] Label            ← bottom baseline row
//   [• item 2 ]
//
//   SECURE                                         LEAD  ← symmetric marginX/marginY
// ─────────────────────────────────────────────────────────────────

export function renderLandscapeInfoPoster(
  data: LayoutData,
  assets: PosterAssets
): React.ReactElement {
  const { widthPx: W, heightPx: H, contentTier } = data;
  const mx = spacing(SAFE_MARGINS.landscape.x, W);
  const my = spacing(SAFE_MARGINS.landscape.y, W);
  const logoScale = LOGO_SCALE[contentTier];

  // Typography scale
  const headlineFontSize = spacing(10, W);
  const subtitleFontSize = spacing(3.5, W);
  const bodyFontSize = spacing(3, W);
  const watermarkFontSize = spacing(3.5, W);
  const iconSize = spacing(7, W);
  const badgeLabelSize = spacing(2.2, W);

  // Logo sizes
  const logoContainerH = spacing(14, W);
  const clubLogoH = Math.round(logoContainerH * logoScale);
  const varsityLogoH = Math.round(logoContainerH * 0.85 * logoScale);
  const ICON_BADGES_PER_ROW = 3;

  const renderLogo = (type: 'club' | 'varsity' | 'partner') => {
    const isClub = type === 'club';
    const isVarsity = type === 'varsity';
    const src = isClub ? assets.clubLogoDataUrl : isVarsity ? assets.varsityLogoDataUrl : data.partnerLogoDataUrl;
    const logoH = isClub ? clubLogoH : isVarsity ? varsityLogoH : clubLogoH;
    const fallbackText = isClub ? 'AUSTCAIC' : isVarsity ? 'AUST' : 'PARTNER';

    return src ? (
      <img src={src} style={{ height: logoH, width: 'auto', objectFit: 'contain' }} />
    ) : (
      <div
        style={{
          height: logoH,
          width: logoH,
          backgroundColor: isClub ? COLORS.logoIconColor : COLORS.wordmarkText,
          borderRadius: isClub ? spacing(1, W) : '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: COLORS.white, fontFamily: FONTS.headline, fontWeight: 700, fontSize: spacing(isClub ? 3 : 2.5, W) }}>
          {fallbackText}
        </span>
      </div>
    );
  };

  type LogoKind = 'club' | 'varsity' | 'partner';
  type LogoSlot = 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';

  const getLogosForSlot = (slot: LogoSlot) => [
    data.clubLogoPosition === slot ? 'club' : null,
    data.varsityLogoPosition === slot ? 'varsity' : null,
    data.hasPartnerLogo && data.partnerLogoPosition === slot ? 'partner' : null,
  ].filter(Boolean) as LogoKind[];

  const renderLogoGroup = (logos: LogoKind[]) => (
    <div
      style={{
        display: logos.length > 0 ? 'flex' : 'none',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing(3, W),
        flexShrink: 0,
      }}
    >
      {logos.map((logo, index) => (
        <React.Fragment key={logo}>
          {index > 0 && (
            <div
              style={{
                width: spacing(0.35, W),
                height: spacing(8.5, W),
                backgroundColor: COLORS.accentLine,
                opacity: 0.45,
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ display: 'flex', alignItems: 'center' }}>{renderLogo(logo)}</div>
        </React.Fragment>
      ))}
    </div>
  );

  const renderLogoBand = (row: 'top' | 'bottom') => {
    const hasLogos = (['left', 'center', 'right'] as const).some(
      (slot) => getLogosForSlot(`${row}-${slot}` as LogoSlot).length > 0
    );
    if (!hasLogos) return null;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          height: logoContainerH,
          flexShrink: 0,
        }}
      >
        {(['left', 'center', 'right'] as const).map((slot) => (
          <div
            key={`${row}-${slot}`}
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: slot === 'left' ? 'flex-start' : slot === 'right' ? 'flex-end' : 'center',
            }}
          >
            {renderLogoGroup(getLogosForSlot(`${row}-${slot}` as LogoSlot))}
          </div>
        ))}
      </div>
    );
  };

  const renderTopBrandHeader = () => {
    if (data.logoLayout === 'side_by_side') {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            height: logoContainerH,
            gap: spacing(3, W),
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>{renderLogo('club')}</div>
          <div style={{ width: spacing(0.35, W), height: spacing(8.5, W), backgroundColor: COLORS.accentLine, opacity: 0.45, flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center' }}>{renderLogo('varsity')}</div>
        </div>
      );
    }

    // Split logo positions for top row
    return (
      <div style={{ display: 'flex', width: '100%', flexDirection: 'column', flexShrink: 0 }}>
        {renderLogoBand('top')}
        {renderLogoGroup(getLogosForSlot('center'))}
      </div>
    );
  };

  // Determine column swapping: Table vs Text columns
  const tableIndex = data.sectionOrder.indexOf('table');
  const bulletsIndex = data.sectionOrder.indexOf('bullets');
  const contentIndex = data.sectionOrder.indexOf('content');
  const isTableFirst = tableIndex !== -1 && (tableIndex < bulletsIndex || tableIndex < contentIndex);

  // Renders the stacked text elements according to sectionOrder
  const renderTextStack = () => {
    // Filter sections relevant to this text column
    const relevantSections = data.sectionOrder.filter(s => ['content', 'bullets', 'badges'].includes(s));
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: spacing(4, W) }}>
        {relevantSections.map((section) => {
          if (section === 'content') {
            return (
              <div key="content" style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                {data.hasExtraBadge && data.extraBadgeText && (
                  <ExtraBadge text={data.extraBadgeText} widthPx={W} />
                )}
                <div
                  style={{
                    fontFamily: FONTS.headline,
                    fontWeight: 700,
                    fontSize: headlineFontSize,
                    lineHeight: 1.05,
                    backgroundImage: `linear-gradient(90deg, ${COLORS.headlineGradientStart}, ${COLORS.headlineGradientEnd})`,
                    backgroundClip: 'text',
                    color: 'transparent',
                    letterSpacing: spacing(0.3, W),
                  }}
                >
                  {data.title.toUpperCase()}
                </div>
                {data.subtitle && (
                  <div
                    style={{
                      fontFamily: FONTS.body,
                      fontWeight: 400,
                      fontSize: subtitleFontSize,
                      color: COLORS.subtitleText,
                      marginTop: spacing(2, W),
                    }}
                  >
                    {data.subtitle}
                  </div>
                )}
              </div>
            );
          }

          if (section === 'bullets' && data.bulletList.length > 0) {
            const cols = data.bulletColumns || 1;
            const bulletSlices = chunkArray(data.bulletList, cols);

            return (
              <div
                key="bullets"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: spacing(4, W),
                  width: '100%',
                  justifyContent: data.bulletAlignment === 'left' ? 'flex-start' : data.bulletAlignment === 'right' ? 'flex-end' : 'center',
                  paddingLeft: spacing(6, W),
                  paddingRight: spacing(6, W),
                  boxSizing: 'border-box',
                  flexShrink: 0,
                }}
              >
                {bulletSlices.map((colItems, cIdx) => (
                  <div key={cIdx} style={{ display: 'flex', flexDirection: 'column', flex: cols > 1 ? 1 : undefined, gap: spacing(2, W), alignItems: data.bulletAlignment === 'left' ? 'flex-start' : data.bulletAlignment === 'right' ? 'flex-end' : 'center' }}>
                    {colItems.map((item, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing(2.5, W) }}>
                        {data.bulletIcons[i * cols + cIdx] ? (
                          <SatoriIcon name={data.bulletIcons[i * cols + cIdx] as string} size={Math.round(spacing(3.2, W))} color={COLORS.accentLine} />
                        ) : (
                          <div style={{ width: spacing(1.2, W), height: spacing(1.2, W), borderRadius: '50%', backgroundColor: COLORS.accentLine, flexShrink: 0 }} />
                        )}
                        <span
                          style={{
                            fontFamily: FONTS.body,
                            fontWeight: 600,
                            fontSize: bodyFontSize,
                            color: COLORS.bodyText,
                            letterSpacing: spacing(0.3, W),
                          }}
                        >
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          }

          if (section === 'badges' && data.hasIconBadges && data.iconBadges.length > 0) {
            return (
              <div
                key="badges"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: spacing(3, W),
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                {data.iconBadges.map((badge, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: spacing(1.5, W),
                    }}
                  >
                    <div
                      style={{
                        width: iconSize,
                        height: iconSize,
                        borderRadius: '50%',
                        border: `${spacing(0.5, W)}px solid ${COLORS.accentLine}`,
                        backgroundColor: COLORS.badgeBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SatoriIcon
                        name={badge.icon}
                        size={Math.round(iconSize * 0.55)}
                        color={COLORS.accentLine}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: FONTS.body,
                        fontWeight: 600,
                        fontSize: badgeLabelSize,
                        color: COLORS.bodyText,
                        textAlign: 'center',
                      }}
                    >
                      {badge.label.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  const renderTableBlock = () => {
    if (!data.hasTable || data.tableHeaders.length === 0) return null;
    return (
      <div
        style={{
          flex: 0.45,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <PosterTable
          headers={data.tableHeaders}
          rows={data.tableRows}
          widthPx={W}
          denseTier={contentTier}
        />
      </div>
    );
  };

  return (
    <div
      style={{
        width: W,
        height: H,
        backgroundColor: COLORS.backgroundBase,
        position: 'relative',
        display: 'flex',
        fontFamily: FONTS.body,
        overflow: 'hidden',
      }}
    >
      <BackgroundPattern patternDataUrl={assets.patternDataUrl} widthPx={W} />
      {data.hasIconBadges && <AbsoluteIconLayer badges={data.iconBadges} widthPx={W} heightPx={H} />}

      {/* Framed uploaded image — absolutely positioned overlay */}
      {assets.uploadedImageDataUrl && (
        <FramedImage
          src={assets.uploadedImageDataUrl}
          frame={data.imageFrame ?? 'none'}
          position={data.imagePosition ?? 'center-right'}
          size={data.imageSize ?? 'medium'}
          widthPx={W}
          heightPx={H}
          mx={mx}
          my={my}
        />
      )}

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          width: W,
          height: H,
          paddingLeft: mx,
          paddingRight: mx,
          paddingTop: my,
          paddingBottom: my,
          boxSizing: 'border-box',
        }}
      >
        {renderTopBrandHeader()}

        {/* Middle content area */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            marginTop: spacing(4, W),
          }}
        >
          <div style={{ display: 'flex', flex: 1, flexDirection: 'row', gap: spacing(6, W) }}>
            {isTableFirst ? (
              <>
                {renderTableBlock()}
                <div style={{ display: 'flex', flex: 0.55 }}>{renderTextStack()}</div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', flex: 0.55 }}>{renderTextStack()}</div>
                {renderTableBlock()}
              </>
            )}
          </div>
        </div>

        {/* Bottom branding (only if logoLayout === 'split') */}
        {data.logoLayout === 'split' && (
          <div style={{ marginTop: spacing(4, W), flexShrink: 0 }}>
            {renderLogoBand('bottom')}
          </div>
        )}

        {/* Watermarks */}
        {data.hasWatermark && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
              marginTop: spacing(3, W),
            }}
          >
            <span
              style={{
                fontFamily: FONTS.body,
                fontWeight: 600,
                fontSize: watermarkFontSize,
                color: COLORS.watermarkText,
                letterSpacing: spacing(1, W),
                opacity: 0.7,
              }}
            >
              {(data.watermarkLeft || 'SECURE').toUpperCase()}
            </span>
            <span
              style={{
                fontFamily: FONTS.body,
                fontWeight: 600,
                fontSize: watermarkFontSize,
                color: COLORS.watermarkText,
                letterSpacing: spacing(1, W),
                opacity: 0.7,
              }}
            >
              {(data.watermarkRight || 'LEAD').toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// VARIANT 2: PORTRAIT ANNOUNCEMENT / QR POSTER (A4, 2481×3508 px)
//
// Layout (single centered flex column — guaranteed center axis):
//   [Club Logo — centered]
//   BIG HEADLINE — centered
//   Subtitle — centered
//   [Extra badge — centered]
//   [QR Code — centered, if on]
//   [Table — centered, if on]
//   [Bullet list — centered, if on]
//   [Varsity Logo — small, bottom-left]
// ─────────────────────────────────────────────────────────────────

export function renderPortraitQrPoster(
  data: LayoutData,
  assets: PosterAssets
): React.ReactElement {
  const { widthPx: W, heightPx: H, contentTier } = data;
  const mx = spacing(SAFE_MARGINS.portrait.x, W);
  const my = spacing(SAFE_MARGINS.portrait.y, W);
  const logoScale = LOGO_SCALE[contentTier];

  const headlineFontSize = spacing(9, W);
  const subtitleFontSize = spacing(3.2, W);
  const bodyFontSize = spacing(2.8, W);
  const logoRowH = spacing(22, W);
  const headerLogoScale = Math.max(logoScale, 0.9);
  const clubLogoH = Math.round(spacing(18, W) * headerLogoScale);
  const varsityLogoH = Math.round(spacing(20, W) * headerLogoScale);
  const qrSize = spacing(35, W);

  type LogoKind = 'club' | 'varsity' | 'partner';
  type LogoSlot = 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';

  const getLogosForSlot = (slot: LogoSlot) => [
    data.clubLogoPosition === slot ? 'club' : null,
    data.varsityLogoPosition === slot ? 'varsity' : null,
    data.hasPartnerLogo && data.partnerLogoPosition === slot ? 'partner' : null,
  ].filter(Boolean) as LogoKind[];

  const renderLogo = (type: 'club' | 'varsity' | 'partner') => {
    const isClub = type === 'club';
    const isVarsity = type === 'varsity';
    const src = isClub ? assets.clubLogoDataUrl : isVarsity ? assets.varsityLogoDataUrl : data.partnerLogoDataUrl;
    const logoH = isClub ? clubLogoH : isVarsity ? varsityLogoH : clubLogoH;
    const fallbackText = isClub ? 'AUSTCAIC' : isVarsity ? 'AUST' : 'PARTNER';

    return src ? (
      <img src={src} style={{ height: logoH, width: 'auto', objectFit: 'contain' }} />
    ) : (
      <div
        style={{
          height: logoH,
          width: logoH,
          backgroundColor: isClub ? COLORS.logoIconColor : COLORS.wordmarkText,
          borderRadius: isClub ? spacing(2, W) : '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: COLORS.white, fontFamily: FONTS.headline, fontWeight: 700, fontSize: spacing(isClub ? 4 : 2.5, W) }}>
          {fallbackText}
        </span>
      </div>
    );
  };

  const renderLogoGroup = (logos: LogoKind[]) => (
    <div
      style={{
        display: logos.length > 0 ? 'flex' : 'none',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing(4, W),
        flexShrink: 0,
      }}
    >
      {logos.map((logo, index) => (
        <React.Fragment key={logo}>
          {index > 0 && (
            <div
              style={{
                width: spacing(0.35, W),
                height: spacing(11, W),
                backgroundColor: COLORS.accentLine,
                opacity: 0.45,
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ display: 'flex', alignItems: 'center' }}>{renderLogo(logo)}</div>
        </React.Fragment>
      ))}
    </div>
  );

  const renderLogoBand = (row: 'top' | 'bottom') => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        minHeight: logoRowH,
        flexShrink: 0,
      }}
    >
      {(['left', 'center', 'right'] as const).map((slot) => (
        <div
          key={`${row}-${slot}`}
          style={{
            display: 'flex',
            flex: 1,
            justifyContent: slot === 'left' ? 'flex-start' : slot === 'right' ? 'flex-end' : 'center',
          }}
        >
          {renderLogoGroup(getLogosForSlot(`${row}-${slot}` as LogoSlot))}
        </div>
      ))}
    </div>
  );

  // ── BRAND HEADER ROW: Handles Split vs Side-by-Side Logo Layout ──
  const renderTopBrandHeader = () => {
    if (data.logoLayout === 'side_by_side') {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: logoRowH,
            gap: spacing(4, W),
            flexShrink: 0,
            marginBottom: spacing(3, W),
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>{renderLogo('club')}</div>
          <div
            style={{
              width: spacing(0.35, W),
              height: spacing(11, W),
              backgroundColor: COLORS.accentLine,
              opacity: 0.45,
              flexShrink: 0,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center' }}>{renderLogo('varsity')}</div>
        </div>
      );
    }

    // Split logo positions
    return (
      <div style={{ display: 'flex', width: '100%', flexDirection: 'column', flexShrink: 0 }}>
        {renderLogoBand('top')}
        {renderLogoGroup(getLogosForSlot('center'))}
      </div>
    );
  };

  return (
    <div
      style={{
        width: W,
        height: H,
        backgroundColor: COLORS.backgroundBase,
        position: 'relative',
        display: 'flex',
        fontFamily: FONTS.body,
        overflow: 'hidden',
      }}
    >
      <BackgroundPattern patternDataUrl={assets.patternDataUrl} widthPx={W} />
      {data.hasIconBadges && <AbsoluteIconLayer badges={data.iconBadges} widthPx={W} heightPx={H} />}

      {/* Framed uploaded image — absolutely positioned overlay */}
      {assets.uploadedImageDataUrl && (
        <FramedImage
          src={assets.uploadedImageDataUrl}
          frame={data.imageFrame ?? 'none'}
          position={data.imagePosition ?? 'center-right'}
          size={data.imageSize ?? 'medium'}
          widthPx={W}
          heightPx={H}
          mx={mx}
          my={my}
        />
      )}

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: W,
          height: H,
          paddingLeft: mx,
          paddingRight: mx,
          paddingTop: my,
          paddingBottom: my,
          boxSizing: 'border-box',
        }}
      >
        {renderTopBrandHeader()}

        {/* Dynamic vertical stack */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch', gap: spacing(4, W), flex: 1 }}>
          {data.sectionOrder.map((section) => {
            if (section === 'content') {
              return (
                <div key="content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch', flexShrink: 0 }}>
                  <div
                    style={{
                      fontFamily: FONTS.headline,
                      fontWeight: 700,
                      fontSize: headlineFontSize,
                      lineHeight: 1.05,
                      backgroundImage: `linear-gradient(90deg, ${COLORS.headlineGradientStart}, ${COLORS.headlineGradientEnd})`,
                      backgroundClip: 'text',
                      color: 'transparent',
                      textAlign: 'center',
                      letterSpacing: spacing(0.3, W),
                    }}
                  >
                    {data.title.toUpperCase()}
                  </div>

                  {data.subtitle && (
                    <div
                      style={{
                        fontFamily: FONTS.body,
                        fontWeight: 400,
                        fontSize: subtitleFontSize,
                        color: COLORS.subtitleText,
                        textAlign: 'center',
                        marginTop: spacing(2, W),
                      }}
                    >
                      {data.subtitle}
                    </div>
                  )}

                  {data.hasExtraBadge && data.extraBadgeText && (
                    <div style={{ marginTop: spacing(3, W), display: 'flex' }}>
                      <ExtraBadge text={data.extraBadgeText} widthPx={W} />
                    </div>
                  )}

                  {/* Accent divider line */}
                  <div
                    style={{
                      width: spacing(20, W),
                      height: spacing(0.5, W),
                      backgroundColor: COLORS.accentLine,
                      opacity: 0.4,
                      marginTop: spacing(4, W),
                    }}
                  />
                </div>
              );
            }

            if (section === 'badges' && data.hasIconBadges && data.iconBadges.length > 0) {
              return (
                <div key="badges" style={{ display: 'flex', justifyContent: 'center', alignSelf: 'stretch', flexShrink: 0 }}>
                  <IconBadgeRow badges={data.iconBadges} widthPx={W} />
                </div>
              );
            }

            if (section === 'qrcode' && data.hasQrCode && assets.qrDataUrl) {
              return (
                <div key="qrcode" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div
                    style={{
                      width: qrSize,
                      height: qrSize,
                      padding: spacing(3, W),
                      backgroundColor: COLORS.white,
                      borderRadius: spacing(2, W),
                      border: `${spacing(0.5, W)}px solid ${COLORS.tableBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={assets.qrDataUrl}
                      style={{ width: qrSize - spacing(6, W), height: qrSize - spacing(6, W), objectFit: 'contain' }}
                    />
                  </div>
                  {data.qrUrl && (
                    <span
                      style={{
                        fontFamily: FONTS.body,
                        fontSize: spacing(2.2, W),
                        color: COLORS.subtitleText,
                        textAlign: 'center',
                        marginTop: spacing(2, W),
                      }}
                    >
                      {data.qrUrl}
                    </span>
                  )}
                </div>
              );
            }

            if (section === 'table' && data.hasTable && data.tableHeaders.length > 0) {
              return (
                <div key="table" style={{ display: 'flex', width: '100%', flexShrink: 0 }}>
                  <PosterTable
                    headers={data.tableHeaders}
                    rows={data.tableRows}
                    widthPx={W}
                    denseTier={contentTier}
                  />
                </div>
              );
            }

            if (section === 'bullets' && data.bulletList.length > 0) {
              const cols = data.bulletColumns || 1;
              const bulletSlices = chunkArray(data.bulletList, cols);

              return (
                <div
                  key="bullets"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: spacing(4, W),
                    alignSelf: 'stretch',
                    justifyContent: data.bulletAlignment === 'left' ? 'flex-start' : data.bulletAlignment === 'right' ? 'flex-end' : 'center',
                    paddingLeft: spacing(6, W),
                    paddingRight: spacing(6, W),
                    boxSizing: 'border-box',
                    flexShrink: 0,
                  }}
                >
                  {bulletSlices.map((colItems, cIdx) => (
                    <div key={cIdx} style={{ display: 'flex', flexDirection: 'column', flex: cols > 1 ? 1 : undefined, gap: spacing(2, W), alignItems: data.bulletAlignment === 'left' ? 'flex-start' : data.bulletAlignment === 'right' ? 'flex-end' : 'center' }}>
                      {colItems.map((item, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing(2.5, W) }}>
                          {data.bulletIcons[i * cols + cIdx] ? (
                            <SatoriIcon name={data.bulletIcons[i * cols + cIdx] as string} size={Math.round(spacing(3.2, W))} color={COLORS.accentLine} />
                          ) : (
                            <div style={{ width: spacing(1.2, W), height: spacing(1.2, W), borderRadius: '50%', backgroundColor: COLORS.accentLine, flexShrink: 0 }} />
                          )}
                          <span
                            style={{
                              fontFamily: FONTS.body,
                              fontWeight: 600,
                              fontSize: bodyFontSize,
                              color: COLORS.bodyText,
                              textAlign: data.bulletAlignment || 'left',
                            }}
                          >
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Bottom branding (only if logoLayout === 'split') */}
        {data.logoLayout === 'split' && (
          <div style={{ display: 'flex', width: '100%', flexDirection: 'column', flexShrink: 0, marginTop: spacing(4, W) }}>
            {renderLogoBand('bottom')}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// VARIANT 3: BANNER (5×2 in, 1500×600 px)
//
// Minimal variant — very short, wide format.
// Logo left | Headline center | Tag right
// No table, no icon row, no QR — form hides these fields automatically.
// ─────────────────────────────────────────────────────────────────

export function renderBanner(
  data: LayoutData,
  assets: PosterAssets
): React.ReactElement {
  const { widthPx: W, heightPx: H } = data;
  const mx = spacing(SAFE_MARGINS.banner.x, W);
  const my = spacing(SAFE_MARGINS.banner.y, W);

  const headlineFontSize = spacing(6.0, W);
  const tagFontSize = spacing(2.5, W);
  const hasIconBadges = data.hasIconBadges && data.iconBadges.length > 0;
  const badgeIndex = data.sectionOrder.indexOf('badges');
  const contentIndex = data.sectionOrder.indexOf('content');
  const badgesAboveHeadline = hasIconBadges && badgeIndex < contentIndex;
  const badgesBelowHeadline = hasIconBadges && badgeIndex === contentIndex + 1;
  
  // Make logos significantly smaller as requested (reduced from spacing(12) / spacing(13.5))
  const logoH = spacing(6.5, W);
  const varsityLogoH = spacing(7.5, W);

  const renderLogo = (type: 'club' | 'varsity') => {
    const isClub = type === 'club';
    const src = isClub ? assets.clubLogoDataUrl : assets.varsityLogoDataUrl;
    const h = isClub ? logoH : varsityLogoH;
    const fallbackText = isClub ? 'AUSTCAIC' : 'AUST';

    return src ? (
      <img src={src} style={{ height: h, width: 'auto', objectFit: 'contain' }} />
    ) : (
      <div
        style={{
          height: h,
          width: h,
          backgroundColor: isClub ? COLORS.logoIconColor : COLORS.wordmarkText,
          borderRadius: isClub ? spacing(1, W) : '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: COLORS.white, fontFamily: FONTS.headline, fontWeight: 700, fontSize: spacing(isClub ? 2.5 : 2, W) }}>
          {fallbackText}
        </span>
      </div>
    );
  };

  const renderTopLogos = () => {
    if (data.logoLayout === 'side_by_side') {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: spacing(10, W),
            gap: spacing(2.5, W),
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>{renderLogo('club')}</div>
          <div
            style={{
              width: spacing(0.25, W),
              height: spacing(4.5, W),
              backgroundColor: COLORS.accentLine,
              opacity: 0.45,
              flexShrink: 0,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center' }}>{renderLogo('varsity')}</div>
        </div>
      );
    }

    // Split corners (Club left, Varsity right)
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          height: spacing(10, W),
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>{renderLogo('club')}</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>{renderLogo('varsity')}</div>
      </div>
    );
  };

  return (
    <div
      style={{
        width: W,
        height: H,
        backgroundColor: COLORS.backgroundBase,
        position: 'relative',
        display: 'flex',
        fontFamily: FONTS.body,
        overflow: 'hidden',
      }}
    >
      <BackgroundPattern patternDataUrl={assets.patternDataUrl} widthPx={W} />
      {data.hasIconBadges && <AbsoluteIconLayer badges={data.iconBadges} widthPx={W} heightPx={H} />}

      {/* Logos Row — Absolute positioned at the top */}
      <div
        style={{
          position: 'absolute',
          top: spacing(3.5, W),
          left: mx,
          right: mx,
          display: 'flex',
          zIndex: 10,
        }}
      >
        {renderTopLogos()}
      </div>

      {/* Text Area — Vertically and Horizontally centered across the full height/width */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: W,
          height: H,
          paddingLeft: spacing(8, W),
          paddingRight: spacing(8, W),
          paddingTop: spacing(12, W), // safety pad below logos
          paddingBottom: spacing(12, W), // symmetric pad for perfect center alignment
          boxSizing: 'border-box',
        }}
      >
        {badgesAboveHeadline && (
          <div style={{ display: 'flex', marginBottom: spacing(3, W), maxWidth: spacing(72, W) }}>
            <IconBadgeRow badges={data.iconBadges.slice(0, 4)} widthPx={W} compact />
          </div>
        )}
        <div
          style={{
            fontFamily: FONTS.headline,
            fontWeight: 700,
            fontSize: headlineFontSize,
            lineHeight: 1.05,
            backgroundImage: `linear-gradient(90deg, ${COLORS.headlineGradientStart}, ${COLORS.headlineGradientEnd})`,
            backgroundClip: 'text',
            color: 'transparent',
            letterSpacing: spacing(0.2, W),
            textAlign: 'center',
          }}
        >
          {data.title.toUpperCase()}
        </div>
        {badgesBelowHeadline && (
          <div style={{ display: 'flex', marginTop: spacing(3, W), maxWidth: spacing(72, W) }}>
            <IconBadgeRow badges={data.iconBadges.slice(0, 4)} widthPx={W} compact />
          </div>
        )}
        {data.subtitle && (
          <div
            style={{
              fontFamily: FONTS.body,
              fontWeight: 400,
              fontSize: tagFontSize,
              color: COLORS.subtitleText,
              marginTop: spacing(1.5, W),
              textAlign: 'center',
            }}
          >
            {data.subtitle}
          </div>
        )}
        {hasIconBadges && !badgesAboveHeadline && !badgesBelowHeadline && (
          <div style={{ display: 'flex', marginTop: spacing(3, W), maxWidth: spacing(72, W) }}>
            <IconBadgeRow badges={data.iconBadges.slice(0, 4)} widthPx={W} compact />
          </div>
        )}
      </div>
    </div>
  );
}
