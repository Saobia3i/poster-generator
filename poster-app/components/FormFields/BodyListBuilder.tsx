'use client';

import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { icons as lucideIcons } from 'lucide-react';

interface BodyListBuilderProps {
  items: string[];
  onChange: (items: string[]) => void;
  icons: (string | null)[];
  onIconsChange: (icons: (string | null)[]) => void;
}

export default function BodyListBuilder({ items, onChange, icons, onIconsChange }: BodyListBuilderProps) {
  const addItem = () => { onChange([...items, '']); onIconsChange([...icons, null]); };
  const removeItem = (i: number) => { onChange(items.filter((_, idx) => idx !== i)); onIconsChange(icons.filter((_, idx) => idx !== i)); };
  const updateItem = (i: number, value: string) => {
    const next = [...items];
    next[i] = value;
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          Bullet List Items
        </label>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <GripVertical size={16} className="text-slate-400 dark:text-slate-500 flex-shrink-0 cursor-grab" />
            {/* Accent dot */}
            <div className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 flex-shrink-0" />
            <input
              id={`bullet-item-${i}`}
              type="text"
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={`Item ${i + 1}`}
              className="flex-1 bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
            />
            <input
              list="lucide-bullet-icons"
              aria-label={`Icon beside bullet ${i + 1}`}
              value={icons[i] ?? ''}
              onChange={(e) => {
                const next = [...icons];
                next[i] = e.target.value || null;
                onIconsChange(next);
              }}
              placeholder="Icon"
              className="w-24 bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              disabled={items.length <= 1}
              aria-label={`Delete bullet ${i + 1}`}
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-0 transition cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <datalist id="lucide-bullet-icons">
        {Object.keys(lucideIcons).map((name) => <option key={name} value={name} />)}
      </datalist>

      <button
        type="button"
        id="btn-add-bullet"
        onClick={addItem}
        disabled={items.length >= 8}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-purple-300 dark:border-purple-500/40 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <Plus size={14} />
        Add item {items.length >= 8 && '(max 8)'}
      </button>
    </div>
  );
}
