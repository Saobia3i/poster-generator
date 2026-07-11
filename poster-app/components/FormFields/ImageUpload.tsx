'use client';

import React, { useRef } from 'react';
import { Upload, X, Image } from 'lucide-react';

interface ImageUploadProps {
  imageDataUrl?: string;
  onChange: (dataUrl: string | undefined) => void;
}

export default function ImageUpload({ imageDataUrl, onChange }: ImageUploadProps) {
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-0.5">
        <Image size={13} className="text-white/40" />
        <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
          Optional Image
        </label>
      </div>

      {imageDataUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-white/10">
          <img
            src={imageDataUrl}
            alt="Uploaded"
            className="w-full h-28 object-cover"
          />
          <button
            type="button"
            id="btn-remove-image"
            onClick={() => onChange(undefined)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500/80 transition"
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
    </div>
  );
}
