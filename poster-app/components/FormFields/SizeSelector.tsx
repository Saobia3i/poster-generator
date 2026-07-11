'use client';

import React from 'react';
import { SIZE_PRESETS, type SizePresetKey } from '@/lib/theme';

interface SizeSelectorProps {
  value: SizePresetKey;
  onChange: (key: SizePresetKey) => void;
  customWidthIn?: number;
  customHeightIn?: number;
  onCustomWidth: (v: number) => void;
  onCustomHeight: (v: number) => void;
}

export default function SizeSelector({
  value,
  onChange,
  customWidthIn,
  customHeightIn,
  onCustomWidth,
  onCustomHeight,
}: SizeSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
        Poster Size
      </label>

      {/* Size preset cards */}
      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(SIZE_PRESETS) as [SizePresetKey, typeof SIZE_PRESETS[SizePresetKey]][]).map(
          ([key, preset]) => {
            const isSelected = value === key;
            const aspectRatio =
              preset.widthPx > 0
                ? (preset.widthPx / preset.heightPx).toFixed(2)
                : null;

            return (
              <button
                type="button"
                key={key}
                id={`size-${key}`}
                onClick={() => onChange(key)}
                className={`rounded-xl p-3 text-left border transition-all duration-200 ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {/* Aspect ratio preview rectangle */}
                  <div className="flex items-center justify-center w-8 h-6 flex-shrink-0">
                    <AspectRect presetKey={key} selected={isSelected} />
                  </div>
                  <span
                    className={`text-xs font-semibold ${isSelected ? 'text-purple-300' : 'text-white/70'}`}
                  >
                    {preset.name}
                  </span>
                </div>
                {preset.widthPx > 0 && (
                  <p className="text-[10px] text-white/30 font-mono">
                    {preset.widthPx} × {preset.heightPx}px
                  </p>
                )}
              </button>
            );
          }
        )}
      </div>

      {/* Custom size inputs */}
      {value === 'custom' && (
        <div className="flex gap-3 mt-1">
          <div className="flex-1">
            <label className="text-[10px] text-white/40 uppercase tracking-wide block mb-1">
              Width (inches)
            </label>
            <input
              id="custom-width"
              type="number"
              min={1}
              max={48}
              step={0.1}
              value={customWidthIn ?? ''}
              onChange={(e) => onCustomWidth(parseFloat(e.target.value))}
              placeholder="e.g. 8"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-white/40 uppercase tracking-wide block mb-1">
              Height (inches)
            </label>
            <input
              id="custom-height"
              type="number"
              min={1}
              max={48}
              step={0.1}
              value={customHeightIn ?? ''}
              onChange={(e) => onCustomHeight(parseFloat(e.target.value))}
              placeholder="e.g. 5"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition"
            />
          </div>
          <div className="flex items-end pb-2">
            <span className="text-[10px] text-white/30">= {((customWidthIn ?? 0) * 300) | 0} × {((customHeightIn ?? 0) * 300) | 0} px @ 300 DPI</span>
          </div>
        </div>
      )}
    </div>
  );
}

/** Small visual representation of the poster aspect ratio */
function AspectRect({ presetKey, selected }: { presetKey: SizePresetKey; selected: boolean }) {
  const color = selected ? '#a78bfa' : '#ffffff40';
  const rects: Record<SizePresetKey, { w: number; h: number }> = {
    banner_small:      { w: 28, h: 11 },
    facebook_post:     { w: 23, h: 12 },
    instagram_square:  { w: 16, h: 16 },
    instagram_story:   { w: 10, h: 18 },
    poster_landscape:  { w: 15, h: 24 },
    poster_portrait_a4:{ w: 15, h: 21 },
    custom:            { w: 18, h: 18 },
  };
  const r = rects[presetKey];
  return (
    <svg width={r.w} height={r.h} viewBox={`0 0 ${r.w} ${r.h}`}>
      <rect x={0.5} y={0.5} width={r.w - 1} height={r.h - 1} rx={1}
        fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}
