'use client';

/**
 * PosterPreview.tsx — CSS-Based Live Preview
 *
 * This component renders an approximate visual preview of the poster
 * using CSS/React (not satori). This gives instant feedback on field changes
 * without any API calls — the preview updates as the user types.
 *
 * The final exported PNG (via /api/generate-poster) uses satori and is
 * pixel-perfect. This preview is a fast visual approximation.
 *
 * Preview dimensions are scaled to fit the preview panel while maintaining
 * the exact poster aspect ratio.
 */

import React, { useMemo, useRef, useState } from 'react';
import { BACKGROUND_TEMPLATES, COLORS, SIZE_PRESETS, PRESET_TO_VARIANT, VARIANT_FEATURES, spacing } from '@/lib/theme';
import { getContentTier, getDensityWarning } from '@/lib/logoScale';
import type { PosterFormData } from '@/lib/posterSchema';
import type { IconBadge } from '@/lib/layoutEngine';

const PREVIEW_MAX_WIDTH = 620;
const PREVIEW_MAX_HEIGHT = 720;

interface PosterPreviewProps {
  formData: PosterFormData;
  onDensityWarning?: (warning: string | null) => void;
}

export default function PosterPreview({ formData, onDensityWarning }: PosterPreviewProps) {
  const { sizePreset, customWidthIn, customHeightIn } = formData;
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableSize, setAvailableSize] = useState({ width: PREVIEW_MAX_WIDTH, height: PREVIEW_MAX_HEIGHT });

  // Resolve dimensions
  const { widthPx, heightPx } = useMemo(() => {
    if (sizePreset === 'custom') {
      return {
        widthPx: Math.max(1, Math.round((customWidthIn ?? 8) * 300)),
        heightPx: Math.max(1, Math.round((customHeightIn ?? 5) * 300)),
      };
    }
    return SIZE_PRESETS[sizePreset];
  }, [sizePreset, customWidthIn, customHeightIn]);

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      setAvailableSize({
        width: Math.max(260, rect.width),
        height: Math.max(320, rect.height - 34),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const scale = Math.min(
    availableSize.width / widthPx,
    availableSize.height / heightPx,
    1
  );
  const previewW = Math.round(widthPx * scale);
  const previewH = Math.round(heightPx * scale);

  const variant = PRESET_TO_VARIANT[sizePreset];
  const features = VARIANT_FEATURES[variant];

  // Content density
  const bodyLength = formData.bulletList.join(' ').length;
  const contentTier = getContentTier(formData.hasTable, formData.tableRows.length, bodyLength);
  const logoScale = contentTier === 'dense' ? 0.7 : contentTier === 'medium' ? 0.85 : 1.0;

  // Emit density warning to parent
  React.useEffect(() => {
    onDensityWarning?.(getDensityWarning(contentTier));
  }, [contentTier, onDensityWarning]);

  // Spacing helpers (scaled for preview)
  const sp = (m: number) => spacing(m, widthPx) * scale;

  // Font sizes (scaled)
  const headlinePx = sp(10);
  const subtitlePx = sp(3.5);
  const bodyPx = sp(3);
  const watermarkPx = sp(3.5);
  const iconSizePx = sp(7);
  const badgeLabelPx = sp(2.2);

  const mx = sp(10);
  const my = sizePreset === 'poster_portrait_a4' ? sp(14) : sp(10);
  const logoContainerH = sp(14);
  const clubLogoH = logoContainerH * logoScale;
  const varsityLogoH = logoContainerH * 0.85 * logoScale;

  return (
    <div ref={containerRef} className="flex h-full w-full flex-col items-center justify-center gap-3">
      {/* Scaled poster canvas */}
      <div
        className="relative overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10"
        style={{
          width: previewW,
          height: previewH,
          backgroundColor: COLORS.backgroundBase,
          borderRadius: sp(2),
        }}
      >
        {/* Background pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(/${BACKGROUND_TEMPLATES[sizePreset].replace('public/', '')})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            padding: `${my}px ${mx}px`,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {variant === 'banner'
            ? <BannerLayout formData={formData} sp={sp} headlinePx={headlinePx} subtitlePx={subtitlePx} logoH={clubLogoH} varsityH={varsityLogoH} />
            : variant === 'portrait'
            ? <PortraitLayout formData={formData} sp={sp} headlinePx={headlinePx} subtitlePx={subtitlePx} bodyPx={bodyPx} logoH={clubLogoH} varsityH={varsityLogoH} iconSizePx={iconSizePx} features={features} />
            : <LandscapeLayout formData={formData} sp={sp} headlinePx={headlinePx} subtitlePx={subtitlePx} bodyPx={bodyPx} watermarkPx={watermarkPx} logoContainerH={logoContainerH} clubLogoH={clubLogoH} varsityLogoH={varsityLogoH} iconSizePx={iconSizePx} badgeLabelPx={badgeLabelPx} features={features} />
          }
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-3 text-[10px] text-white/30">
        <span>{widthPx} × {heightPx} px</span>
        <span>·</span>
        <span>300 DPI</span>
        <span>·</span>
        <span className="capitalize">{variant}</span>
        {contentTier !== 'minimal' && (
          <>
            <span>·</span>
            <span className={contentTier === 'dense' ? 'text-yellow-400/70' : 'text-blue-400/70'}>
              Logo {Math.round(logoScale * 100)}%
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Helper chunk function for preview
function previewChunkArray<T>(arr: T[], chunks: number): T[][] {
  const results: T[][] = Array.from({ length: Math.max(chunks, 1) }, () => []);
  arr.filter(Boolean).forEach((item, index) => {
    results[index % chunks].push(item);
  });
  return results;
}

// ── Landscape Layout Preview ───────────────────────────────────────

function LandscapeLayout({ formData, sp, headlinePx, subtitlePx, bodyPx, watermarkPx, logoContainerH, clubLogoH, varsityLogoH, iconSizePx, badgeLabelPx, features }: {
  formData: PosterFormData; sp: (m: number) => number;
  headlinePx: number; subtitlePx: number; bodyPx: number; watermarkPx: number;
  logoContainerH: number; clubLogoH: number; varsityLogoH: number;
  iconSizePx: number; badgeLabelPx: number;
  features: typeof VARIANT_FEATURES[keyof typeof VARIANT_FEATURES];
}) {
  type LogoKind = 'club' | 'varsity';
  type LogoSlot = 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';

  const getLogosForSlot = (slot: LogoSlot) => [
    formData.clubLogoPosition === slot ? 'club' : null,
    formData.varsityLogoPosition === slot ? 'varsity' : null,
  ].filter(Boolean) as LogoKind[];

  const renderLogoByKey = (key: LogoKind) => {
    return key === 'club' ? (
      <LogoBox h={clubLogoH} src="/templates/logo-austcaic.png" isRound={false} />
    ) : (
      <LogoBox h={varsityLogoH} src="/templates/logo-varsity.png" isRound={false} />
    );
  };

  const renderLogoGroup = (logos: LogoKind[]) => (
    <div
      style={{
        display: logos.length > 0 ? 'flex' : 'none',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sp(3),
        flexShrink: 0,
      }}
    >
      {logos.map((logo, index) => (
        <React.Fragment key={logo}>
          {index > 0 && (
            <div
              style={{
                width: sp(0.35),
                height: sp(8.5),
                backgroundColor: COLORS.accentLine,
                opacity: 0.45,
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ display: 'flex', alignItems: 'center' }}>{renderLogoByKey(logo)}</div>
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
    if (formData.logoLayout === 'side_by_side') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', height: logoContainerH, gap: sp(3), flexShrink: 0 }}>
          <LogoBox h={clubLogoH} src="/templates/logo-austcaic.png" isRound={false} />
          <div style={{ width: sp(0.35), height: sp(8.5), backgroundColor: COLORS.accentLine, opacity: 0.45, flexShrink: 0 }} />
          <LogoBox h={varsityLogoH} src="/templates/logo-varsity.png" isRound={false} />
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

  const tableIndex = formData.sectionOrder.indexOf('table');
  const bulletsIndex = formData.sectionOrder.indexOf('bullets');
  const contentIndex = formData.sectionOrder.indexOf('content');
  const isTableFirst = tableIndex !== -1 && (tableIndex < bulletsIndex || tableIndex < contentIndex);

  const renderTextStack = () => {
    const relevantSections = formData.sectionOrder.filter(s => ['content', 'bullets', 'badges'].includes(s));
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: sp(4) }}>
        {relevantSections.map((section) => {
          if (section === 'content') {
            return (
              <div key="content" style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                {formData.hasExtraBadge && formData.extraBadgeText && (
                  <BadgePill text={formData.extraBadgeText} sp={sp} />
                )}
                <GradientText text={formData.title || 'POSTER TITLE'} fontSize={headlinePx} />
                {formData.subtitle && (
                  <div style={{ fontSize: subtitlePx, color: COLORS.subtitleText, marginTop: sp(2), fontFamily: 'sans-serif' }}>
                    {formData.subtitle}
                  </div>
                )}
              </div>
            );
          }

          if (section === 'bullets' && formData.bulletList.length > 0) {
            const cols = formData.bulletColumns || 1;
            const bulletSlices = previewChunkArray(formData.bulletList, cols);

            return (
              <div key="bullets" style={{ display: 'flex', flexDirection: 'row', gap: sp(4), width: '100%', flexShrink: 0 }}>
                {bulletSlices.map((colItems, cIdx) => (
                  <div key={cIdx} style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: sp(2) }}>
                    {colItems.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: sp(2.5) }}>
                        <div style={{ width: sp(1.2), height: sp(1.2), borderRadius: '50%', backgroundColor: COLORS.accentLine, flexShrink: 0 }} />
                        <span style={{ fontSize: bodyPx, color: COLORS.bodyText, fontWeight: 600, fontFamily: 'sans-serif', letterSpacing: '0.02em' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          }

          if (section === 'badges' && features.iconBadges && formData.hasIconBadges && formData.iconBadges.length > 0) {
            return (
              <div key="badges" style={{ display: 'flex', flexWrap: 'wrap', gap: sp(3), alignItems: 'center', flexShrink: 0 }}>
                {formData.iconBadges.map((badge, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: sp(1.5) }}>
                    <div style={{ width: iconSizePx, height: iconSizePx, borderRadius: '50%', border: `${sp(0.5)}px solid ${COLORS.accentLine}`, backgroundColor: COLORS.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: iconSizePx * 0.5, color: COLORS.accentLine }}>◆</span>
                    </div>
                    <span style={{ fontSize: badgeLabelPx, color: COLORS.bodyText, textAlign: 'center', fontFamily: 'sans-serif', fontWeight: 600 }}>{badge.label || 'LABEL'}</span>
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
    if (!formData.hasTable || formData.tableHeaders.length === 0) return null;
    return (
      <div style={{ flex: 0.45, display: 'flex', alignItems: 'center' }}>
        <PreviewTable headers={formData.tableHeaders} rows={formData.tableRows} sp={sp} />
      </div>
    );
  };

  return (
    <>
      {renderTopBrandHeader()}

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: sp(4) }}>
        <div style={{ flex: 1, display: 'flex', gap: sp(6), flexDirection: 'row' }}>
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
      {formData.logoLayout === 'split' && (
        <div style={{ marginTop: sp(4), flexShrink: 0 }}>
          {renderLogoBand('bottom')}
        </div>
      )}

      {/* Watermarks */}
      {formData.hasWatermark && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: sp(3), flexShrink: 0 }}>
          <span style={{ fontSize: watermarkPx, color: COLORS.watermarkText, opacity: 0.7, letterSpacing: sp(1), fontFamily: 'sans-serif', fontWeight: 600 }}>{(formData.watermarkLeft || 'SECURE').toUpperCase()}</span>
          <span style={{ fontSize: watermarkPx, color: COLORS.watermarkText, opacity: 0.7, letterSpacing: sp(1), fontFamily: 'sans-serif', fontWeight: 600 }}>{(formData.watermarkRight || 'LEAD').toUpperCase()}</span>
        </div>
      )}
    </>
  );
}

// ── Portrait Layout Preview ────────────────────────────────────────

function PortraitLayout({ formData, sp, headlinePx, subtitlePx, bodyPx, logoH, varsityH, iconSizePx, features }: {
  formData: PosterFormData; sp: (m: number) => number;
  headlinePx: number; subtitlePx: number; bodyPx: number;
  logoH: number; varsityH: number; iconSizePx: number;
  features: typeof VARIANT_FEATURES[keyof typeof VARIANT_FEATURES];
}) {
  const brandLogoH = Math.max(logoH, sp(18));
  const brandVarsityH = Math.max(varsityH, sp(20));

  type LogoKind = 'club' | 'varsity';
  type LogoSlot = 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';

  const getLogosForSlot = (slot: LogoSlot) => [
    formData.clubLogoPosition === slot ? 'club' : null,
    formData.varsityLogoPosition === slot ? 'varsity' : null,
  ].filter(Boolean) as LogoKind[];

  const renderLogoByKey = (key: LogoKind) => {
    return key === 'club' ? (
      <LogoBox h={brandLogoH} src="/templates/logo-austcaic.png" isRound={false} />
    ) : (
      <LogoBox h={brandVarsityH} src="/templates/logo-varsity.png" isRound={false} />
    );
  };

  const renderLogoGroup = (logos: LogoKind[]) => (
    <div
      style={{
        display: logos.length > 0 ? 'flex' : 'none',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sp(4),
        flexShrink: 0,
      }}
    >
      {logos.map((logo, index) => (
        <React.Fragment key={logo}>
          {index > 0 && (
            <div
              style={{
                width: sp(0.35),
                height: sp(11),
                backgroundColor: COLORS.accentLine,
                opacity: 0.45,
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ display: 'flex', alignItems: 'center' }}>{renderLogoByKey(logo)}</div>
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
          minHeight: sp(22),
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
    if (formData.logoLayout === 'side_by_side') {
      return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: sp(4), height: sp(22), marginBottom: sp(3) }}>
          <LogoBox h={brandLogoH} src="/templates/logo-austcaic.png" isRound={false} />
          <div style={{ width: sp(0.35), height: sp(11), backgroundColor: COLORS.accentLine, opacity: 0.45, flexShrink: 0 }} />
          <LogoBox h={brandVarsityH} src="/templates/logo-varsity.png" isRound={false} />
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

  return (
    <>
      {/* Centered flex column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {renderTopBrandHeader()}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch', gap: sp(4), flex: 1 }}>
          {formData.sectionOrder.map((section) => {
            if (section === 'content') {
              return (
                <div key="content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch', flexShrink: 0 }}>
                  <GradientText text={formData.title || 'POSTER TITLE'} fontSize={headlinePx} align="center" />
                  {formData.subtitle && (
                    <div style={{ fontSize: subtitlePx, color: COLORS.subtitleText, marginTop: sp(2), fontFamily: 'sans-serif', textAlign: 'center' }}>{formData.subtitle}</div>
                  )}
                  {formData.hasExtraBadge && formData.extraBadgeText && (
                    <div style={{ marginTop: sp(3) }}>
                      <BadgePill text={formData.extraBadgeText} sp={sp} />
                    </div>
                  )}
                  <div style={{ height: sp(4) }} />
                  <div style={{ width: sp(20), height: sp(0.5), backgroundColor: COLORS.accentLine, opacity: 0.4 }} />
                </div>
              );
            }

            if (section === 'qrcode' && features.qrCode && formData.hasQrCode && formData.qrUrl) {
              return (
                <div key="qrcode" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: sp(35), height: sp(35), backgroundColor: '#fff', borderRadius: sp(2), display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${COLORS.tableBorder}` }}>
                    <span style={{ fontSize: sp(3), color: COLORS.bodyText, fontFamily: 'sans-serif' }}>QR</span>
                  </div>
                  <span style={{ fontSize: sp(2.2), color: COLORS.subtitleText, marginTop: sp(2), fontFamily: 'sans-serif' }}>{formData.qrUrl}</span>
                </div>
              );
            }

            if (section === 'table' && formData.hasTable && formData.tableHeaders.length > 0) {
              return (
                <div key="table" style={{ width: '100%', flexShrink: 0 }}>
                  <PreviewTable headers={formData.tableHeaders} rows={formData.tableRows} sp={sp} />
                </div>
              );
            }

            if (section === 'bullets' && formData.bulletList.length > 0) {
              const cols = formData.bulletColumns || 1;
              const bulletSlices = previewChunkArray(formData.bulletList, cols);

              return (
                <div
                  key="bullets"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: sp(4),
                    alignSelf: 'stretch',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {bulletSlices.map((colItems, cIdx) => (
                    <div key={cIdx} style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: sp(2), alignItems: cols === 1 ? 'center' : 'flex-start' }}>
                      {colItems.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: sp(2.5) }}>
                          <div style={{ width: sp(1.2), height: sp(1.2), borderRadius: '50%', backgroundColor: COLORS.accentLine, flexShrink: 0 }} />
                          <span style={{ fontSize: bodyPx, color: COLORS.bodyText, fontWeight: 600, fontFamily: 'sans-serif' }}>{item}</span>
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
        {formData.logoLayout === 'split' && (
          <div style={{ display: 'flex', width: '100%', flexDirection: 'column', flexShrink: 0, marginTop: sp(4) }}>
            {renderLogoBand('bottom')}
          </div>
        )}
      </div>
    </>
  );
}

// ── Banner Layout Preview ──────────────────────────────────────────

function BannerLayout({ formData, sp, headlinePx, subtitlePx, logoH, varsityH }: {
  formData: PosterFormData; sp: (m: number) => number;
  headlinePx: number; subtitlePx: number; logoH: number; varsityH: number;
}) {
  // Use much smaller sizes (6.5 / 7.5 relative to width)
  const brandLogoH = sp(6.5);
  const brandVarsityH = sp(7.5);

  const renderLogos = () => {
    if (formData.logoLayout === 'side_by_side') {
      return (
        <div style={{ width: '100%', height: sp(10), display: 'flex', justifyContent: 'center', alignItems: 'center', gap: sp(2.5), flexShrink: 0 }}>
          <LogoBox h={brandLogoH} src="/templates/logo-austcaic.png" isRound={false} />
          <div style={{ width: sp(0.25), height: sp(4.5), backgroundColor: COLORS.accentLine, opacity: 0.45, flexShrink: 0 }} />
          <LogoBox h={brandVarsityH} src="/templates/logo-varsity.png" isRound={false} />
        </div>
      );
    }

    return (
      <div style={{ width: '100%', height: sp(10), display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <LogoBox h={brandLogoH} src="/templates/logo-austcaic.png" isRound={false} />
        <LogoBox h={brandVarsityH} src="/templates/logo-varsity.png" isRound={false} />
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Logos Row — Absolute positioned at the top */}
      <div
        style={{
          position: 'absolute',
          top: sp(3.5),
          left: 0,
          right: 0,
          display: 'flex',
          zIndex: 10,
        }}
      >
        {renderLogos()}
      </div>

      {/* Text Area — Centered vertically across full container height */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          paddingLeft: sp(8),
          paddingRight: sp(8),
          paddingTop: sp(12), // safety pad below logos
          paddingBottom: sp(12), // symmetric padding for true vertical center alignment
          boxSizing: 'border-box',
        }}
      >
        <GradientText text={formData.title || 'POSTER TITLE'} fontSize={sp(6.0)} align="center" />
        {formData.subtitle && (
          <div style={{ fontSize: sp(2.5), color: COLORS.subtitleText, marginTop: sp(1.5), fontFamily: 'sans-serif', textAlign: 'center' }}>
            {formData.subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────

function GradientText({ text, fontSize, align = 'left' }: { text: string; fontSize: number; align?: string }) {
  return (
    <div style={{
      fontFamily: 'sans-serif',
      fontWeight: 900,
      fontSize,
      lineHeight: 1.05,
      background: `linear-gradient(90deg, ${COLORS.headlineGradientStart}, ${COLORS.headlineGradientEnd})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textAlign: align as React.CSSProperties['textAlign'],
      letterSpacing: '-0.02em',
    }}>
      {text.toUpperCase()}
    </div>
  );
}

function LogoBox({ h, src, isRound }: { h: number; src: string; isRound: boolean }) {
  return (
    <img
      src={src}
      alt="Logo"
      style={{
        height: h,
        width: 'auto',
        maxHeight: h,
        borderRadius: isRound ? '50%' : '0px',
        objectFit: 'contain',
        flexShrink: 0,
      }}
    />
  );
}

function BadgePill({ text, sp }: { text: string; sp: (m: number) => number }) {
  return (
    <div style={{
      alignSelf: 'flex-start',
      backgroundColor: COLORS.accentLine,
      borderRadius: sp(2),
      paddingLeft: sp(4), paddingRight: sp(4),
      paddingTop: sp(1.5), paddingBottom: sp(1.5),
      marginBottom: sp(3),
    }}>
      <span style={{ fontFamily: 'sans-serif', fontWeight: 600, fontSize: sp(2.5), color: '#fff', letterSpacing: sp(0.5) }}>
        {text.toUpperCase()}
      </span>
    </div>
  );
}

function PreviewTable({ headers, rows, sp }: { headers: string[]; rows: string[][]; sp: (m: number) => number }) {
  const cellPad = `${sp(2)}px ${sp(2.5)}px`;
  const fontSize = sp(2.8);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', border: `1px solid ${COLORS.tableBorder}`, borderRadius: sp(1.5), overflow: 'hidden', width: '100%' }}>
      <div style={{ display: 'flex', backgroundColor: COLORS.tableHeader }}>
        {headers.map((h, i) => (
          <div key={i} style={{ flex: 1, padding: cellPad, borderRight: i < headers.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
            <span style={{ color: '#fff', fontWeight: 600, fontSize, fontFamily: 'sans-serif' }}>{h}</span>
          </div>
        ))}
      </div>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', backgroundColor: ri % 2 === 0 ? COLORS.tableRowAlt : 'transparent', borderTop: `1px solid ${COLORS.tableBorder}` }}>
          {row.map((cell, ci) => (
            <div key={ci} style={{ flex: 1, padding: cellPad, borderRight: ci < headers.length - 1 ? `1px solid ${COLORS.tableBorder}` : 'none' }}>
              <span style={{ color: COLORS.bodyText, fontSize, fontFamily: 'sans-serif' }}>{cell || '—'}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
