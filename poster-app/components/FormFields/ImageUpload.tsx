'use client';

import React, { useRef } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import type { PosterFormData } from '@/lib/posterSchema';

type ImageFrame = 'none' | 'circle' | 'square' | 'rectangle';
type ImagePosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';
type ImageSize = 'small' | 'medium' | 'large';

interface ImageUploadProps {
  imageDataUrl?: string;
  imageFrame?: ImageFrame;
  imagePosition?: ImagePosition;
  imageSize?: ImageSize;
  onChange: (dataUrl: string | undefined) => void;
  onFrameChange: (frame: ImageFrame) => void;
  onPositionChange: (pos: ImagePosition) => void;
  onSizeChange: (size: ImageSize) => void;
}

const POSITION_GRID: ImagePosition[][] = [
  ['top-left',    'top-center',    'top-right'],
  ['center-left', 'center',        'center-right'],
  ['bottom-left', 'bottom-center', 'bottom-right'],
];

const POSITION_LABELS: Record<ImagePosition, string> = {
  'top-left':      'Top Left',
  'top-center':    'Top Center',
  'top-right':     'Top Right',
  'center-left':   'Center Left',
  'center':        'Center',
  'center-right':  'Center Right',
  'bottom-left':   'Bottom Left',
  'bottom-center': 'Bottom Center',
  'bottom-right':  'Bottom Right',
};

const FRAME_OPTIONS: { value: ImageFrame; label: string; preview: React.ReactNode }[] = [
  {
    value: 'none',
    label: 'None',
    preview: <div className="w-5 h-5 bg-white/10 border border-white/20 rounded-sm" />,
  },
  {
    value: 'circle',
    label: 'Circle',
    preview: <div className="w-5 h-5 bg-white/10 border border-white/20 rounded-full" />,
  },
  {
    value: 'square',
    label: 'Square',
    preview: <div className="w-5 h-5 bg-white/10 border border-white/20 rounded-none" />,
  },
  {
    value: 'rectangle',
    label: 'Wide',
    preview: <div className="w-7 h-4 bg-white/10 border border-white/20 rounded-sm" />,
  },
];

const SIZE_OPTIONS: { value: ImageSize; label: string }[] = [
  { value: 'small',  label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large',  label: 'L' },
];

export default function ImageUpload({
  imageDataUrl,
  imageFrame = 'none',
  imagePosition = 'center-right',
  imageSize = 'medium',
  onChange,
  onFrameChange,
  onPositionChange,
  onSizeChange,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // Frame border radius for the preview swatch
  const framePreviewRadius = (frame: ImageFrame) => {
    if (frame === 'circle') return '50%';
    if (frame === 'square') return '0px';
    return '4px';
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <ImageIcon size={13} className="text-white/40" />
        <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
          Optional Image
        </label>
      </div>

      {/* Drop zone / preview */}
      {imageDataUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-white/10 group">
          <img
            src={imageDataUrl}
            alt="Uploaded"
            className="w-full h-28 object-cover"
          />
          {/* Frame preview overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
            <div
              style={{
                width: 56,
                height: imageFrame === 'rectangle' ? 36 : 56,
                borderRadius: framePreviewRadius(imageFrame),
                border: '2px solid rgba(167,139,250,0.9)',
                backgroundColor: 'rgba(0,0,0,0.3)',
              }}
            />
          </div>
          <button
            type="button"
            id="btn-remove-image"
            onClick={() => onChange(undefined)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500/80 transition opacity-0 group-hover:opacity-100"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border border-dashed border-white/15 hover:border-purple-500/40 hover:bg-purple-500/5 cursor-pointer transition group"
        >
          <Upload size={18} className="text-white/20 group-hover:text-purple-400 transition" />
          <p className="text-xs text-white/30 group-hover:text-white/50 transition text-center">
            Click or drag an image here
          </p>
          <p className="text-[10px] text-white/20">PNG, JPG, WebP</p>
        </div>
      )}

      <input
        id="field-image-upload"
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* ── Frame Shape ─────────────────────────────────────────── */}
      {imageDataUrl && (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
              Frame Shape
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {FRAME_OPTIONS.map(({ value, label, preview }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onFrameChange(value)}
                  className={`flex flex-col items-center gap-1.5 py-2 rounded-xl border transition ${
                    imageFrame === value
                      ? 'border-purple-500/70 bg-purple-500/15 shadow-sm shadow-purple-900/30'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {preview}
                  <span
                    className={`text-[9px] font-semibold ${
                      imageFrame === value ? 'text-purple-300' : 'text-white/40'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Image Size ─────────────────────────────────────── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
              Image Size
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {SIZE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSizeChange(value)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition ${
                    imageSize === value
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                      : 'bg-white/5 hover:bg-white/10 text-white/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Position Grid ──────────────────────────────────── */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                Position on Poster
              </label>
              <span className="text-[9px] text-white/25">
                {POSITION_LABELS[imagePosition]}
              </span>
            </div>
            <div
              className="grid gap-1 p-1.5 rounded-xl border border-white/10 bg-white/[0.03]"
              style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
            >
              {POSITION_GRID.map((row, ri) =>
                row.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    title={POSITION_LABELS[pos]}
                    onClick={() => onPositionChange(pos)}
                    className={`h-8 rounded-lg transition flex items-center justify-center ${
                      imagePosition === pos
                        ? 'bg-purple-500/40 border border-purple-500/70 shadow-sm shadow-purple-900/30'
                        : 'bg-white/5 hover:bg-white/12 border border-transparent hover:border-white/15'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full transition ${
                        imagePosition === pos ? 'bg-purple-300 scale-125' : 'bg-white/25'
                      }`}
                    />
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
