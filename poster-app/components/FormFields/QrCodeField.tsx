'use client';

import React from 'react';
import { QrCode } from 'lucide-react';

interface QrCodeFieldProps {
  url: string;
  onChange: (url: string) => void;
}

export default function QrCodeField({ url, onChange }: QrCodeFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-0.5">
        <QrCode size={15} className="text-purple-600 dark:text-purple-400" />
        <label htmlFor="field-qr-url" className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          QR Code URL
        </label>
      </div>
      <input
        id="field-qr-url"
        type="url"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com/register"
        className="w-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
      />
      {url && !url.startsWith('http') && (
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">⚠ Include https:// for a valid QR code</p>
      )}
    </div>
  );
}
