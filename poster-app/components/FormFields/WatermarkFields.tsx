'use client';

import React from 'react';

interface WatermarkFieldsProps {
  left: string;
  right: string;
  onLeftChange: (v: string) => void;
  onRightChange: (v: string) => void;
}

export default function WatermarkFields({
  left,
  right,
  onLeftChange,
  onRightChange,
}: WatermarkFieldsProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
        Corner Watermark Words
      </label>
      <p className="text-[10px] text-white/25">
        Small decorative words in bottom-left and bottom-right corners.
        Default: SECURE / LEAD
      </p>
      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="watermark-left" className="text-[10px] text-white/30 uppercase tracking-wide block mb-1">
            Left corner
          </label>
          <input
            id="watermark-left"
            type="text"
            value={left}
            onChange={(e) => onLeftChange(e.target.value.toUpperCase())}
            placeholder="SECURE"
            maxLength={12}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white uppercase tracking-widest placeholder-white/20 focus:outline-none focus:border-purple-500 transition"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="watermark-right" className="text-[10px] text-white/30 uppercase tracking-wide block mb-1">
            Right corner
          </label>
          <input
            id="watermark-right"
            type="text"
            value={right}
            onChange={(e) => onRightChange(e.target.value.toUpperCase())}
            placeholder="LEAD"
            maxLength={12}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white uppercase tracking-widest placeholder-white/20 focus:outline-none focus:border-purple-500 transition"
          />
        </div>
      </div>
    </div>
  );
}
