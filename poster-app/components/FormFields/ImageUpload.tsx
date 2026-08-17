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
        <ImageIcon size={15} className="text-purple-600 dark:text-purple-400" />
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          Optional Image
        </label>
      </div>

      {/* Drop zone / preview */}
      {imageDataUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 group">
          <img
            src={imageDataUrl}
            alt="Uploaded"
            className="w-full h-28 object-cover"
          />
          {/* Frame preview overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
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
            aria-label="Remove uploaded image"
            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500/70 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 cursor-pointer transition group"
        >
          <Upload size={20} className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 transition text-center">
            Click or drag an image here
          </p>
          <p className="text-[10px] text-slate-400">PNG, JPG, WebP supported</p>
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
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Frame Shape
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {FRAME_OPTIONS.map(({ value, label, preview }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onFrameChange(value)}
                  className={`flex flex-col items-center gap-1.5 py-2 rounded-xl border transition cursor-pointer ${
                    imageFrame === value
                      ? 'border-purple-600 dark:border-purple-400 bg-purple-100 dark:bg-purple-900/40 shadow-sm'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {preview}
                  <span
                    className={`text-[10px] font-bold ${
                      imageFrame === value ? 'text-purple-700 dark:text-purple-300' : 'text-slate-600 dark:text-slate-400'
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
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Image Size
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {SIZE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSizeChange(value)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    imageSize === value
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
                      : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Position on Poster
              </label>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {POSITION_LABELS[imagePosition]}
              </span>
            </div>
            <div
              className="grid gap-1 p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900"
              style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
            >
              {POSITION_GRID.map((row, ri) =>
                row.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    title={POSITION_LABELS[pos]}
                    onClick={() => onPositionChange(pos)}
                    className={`h-8 rounded-lg transition flex items-center justify-center cursor-pointer ${
                      imagePosition === pos
                        ? 'bg-purple-600 dark:bg-purple-500 border border-purple-500 shadow-sm'
                        : 'bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full transition ${
                        imagePosition === pos ? 'bg-white scale-125' : 'bg-slate-400 dark:bg-slate-500'
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
