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
        <QrCode size={13} className="text-purple-400" />
        <label htmlFor="field-qr-url" className="text-xs font-semibold text-white/50 uppercase tracking-widest">
          QR Code URL
        </label>
      </div>
      <input
        id="field-qr-url"
        type="url"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com/register"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition"
      />
      {url && !url.startsWith('http') && (
        <p className="text-[10px] text-yellow-400/70">⚠ Include https:// for a valid QR code</p>
      )}
    </div>
  );
}
