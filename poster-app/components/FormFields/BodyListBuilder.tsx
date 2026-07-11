'use client';

import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface BodyListBuilderProps {
  items: string[];
  onChange: (items: string[]) => void;
}

export default function BodyListBuilder({ items, onChange }: BodyListBuilderProps) {
  const addItem = () => onChange([...items, '']);
  const removeItem = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, value: string) => {
    const next = [...items];
    next[i] = value;
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
          Bullet List Items
        </label>
        <span className="text-[10px] text-white/30">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <GripVertical size={14} className="text-white/20 flex-shrink-0" />
            {/* Accent dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
            <input
              id={`bullet-item-${i}`}
              type="text"
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={`Item ${i + 1}`}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              disabled={items.length <= 1}
              className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 disabled:opacity-0 transition opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        id="btn-add-bullet"
        onClick={addItem}
        disabled={items.length >= 8}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/15 text-white/40 hover:text-white/70 hover:border-white/30 text-xs transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Plus size={13} />
        Add item {items.length >= 8 && '(max 8)'}
      </button>
    </div>
  );
}
