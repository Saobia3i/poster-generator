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
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
        Corner Watermark Words
      </label>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Small decorative words in bottom-left and bottom-right corners.
        Default: SECURE / LEAD
      </p>
      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="watermark-left" className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide block mb-1">
            Left corner
          </label>
          <input
            id="watermark-left"
            type="text"
            value={left}
            onChange={(e) => onLeftChange(e.target.value.toUpperCase())}
            placeholder="SECURE"
            maxLength={12}
            className="w-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="watermark-right" className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide block mb-1">
            Right corner
          </label>
          <input
            id="watermark-right"
            type="text"
            value={right}
            onChange={(e) => onRightChange(e.target.value.toUpperCase())}
            placeholder="LEAD"
            maxLength={12}
            className="w-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
          />
        </div>
      </div>
    </div>
  );
}
