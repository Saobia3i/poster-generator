'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, Search, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { icons } from 'lucide-react';
import { ICON_CATEGORIES, ICON_CATEGORY_LABELS } from '@/lib/iconPaths';
import type { IconBadge } from '@/lib/layoutEngine';

interface IconBadgeBuilderProps {
  badges: IconBadge[];
  onChange: (badges: IconBadge[]) => void;
}

// Convert kebab-case 'map-pin' → PascalCase 'MapPin' for lucide-react lookup
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function IconPreview({
  iconKey,
  size = 16,
  className = 'text-purple-400',
}: {
  iconKey: string;
  size?: number;
  className?: string;
}) {
  const componentName = toPascalCase(iconKey);
  const Icon = (
    LucideIcons as unknown as Record<string, React.ComponentType<{ size: number; className?: string; strokeWidth?: number }>>
  )[componentName];
  if (!Icon) return <span style={{ fontSize: size, lineHeight: 1 }}>□</span>;
  return <Icon size={size} className={className} strokeWidth={1.8} />;
}

export default function IconBadgeBuilder({ badges, onChange }: IconBadgeBuilderProps) {
  const [openPickerIdx, setOpenPickerIdx] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(ICON_CATEGORY_LABELS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    if (openPickerIdx === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenPickerIdx(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openPickerIdx]);

  const addBadge = () => {
    if (badges.length >= 9) return;
    onChange([...badges, { icon: 'Shield', label: '', x: 50, y: 50, size: 'medium' }]);
  };

  const removeBadge = (i: number) => {
    onChange(badges.filter((_, idx) => idx !== i));
  };

  const updateBadge = (i: number, field: keyof IconBadge, value: IconBadge[keyof IconBadge]) => {
    const next = [...badges];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };

  // Filtered icon list
  const allLucideIcons = Object.keys(icons);
  const filteredIcons: string[] = searchQuery.trim()
    ? allLucideIcons.filter((key) => key.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 240)
    : (ICON_CATEGORIES[activeCategory] ?? []).map(toPascalCase);

  const openPicker = (i: number) => {
    setOpenPickerIdx(openPickerIdx === i ? null : i);
    setSearchQuery('');
    setActiveCategory(ICON_CATEGORY_LABELS[0]);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          Icon Badges
        </label>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{badges.length}/9</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {badges.map((badge, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 group sm:flex-nowrap">
            {/* Icon picker button */}
            <div className="relative" ref={openPickerIdx === i ? dropdownRef : undefined}>
              <button
                type="button"
                id={`icon-picker-${i}`}
                onClick={() => openPicker(i)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl hover:border-purple-500/70 transition min-w-[80px] shadow-sm"
              >
                <IconPreview iconKey={badge.icon} size={15} className="text-purple-600 dark:text-purple-400" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate max-w-[48px]">{badge.icon}</span>
                <ChevronDown size={11} className="text-slate-400 flex-shrink-0" />
              </button>

              {/* ─── Icon Picker Dropdown ─────────────────────── */}
              {openPickerIdx === i && (
                <div
                  className="absolute top-full left-0 mt-1.5 z-50 w-[min(320px,calc(92vw-2rem))] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl shadow-slate-900/30 dark:shadow-black/70 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Search bar */}
                  <div className="p-2.5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2">
                      <Search size={13} className="text-slate-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search 1000+ icons…"
                        className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category tabs — hidden during search */}
                  {!searchQuery && (
                    <div className="flex overflow-x-auto gap-1 px-2 pt-2 pb-0 scrollbar-none border-b border-slate-200 dark:border-slate-800">
                      {ICON_CATEGORY_LABELS.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setActiveCategory(cat)}
                          className={`flex-shrink-0 px-2.5 py-1 rounded-t-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                            activeCategory === cat
                              ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-b-2 border-purple-600 dark:border-purple-400'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Icon grid */}
                  <div className="p-2 max-h-[220px] overflow-y-auto">
                    {filteredIcons.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
                        No icons found for &quot;{searchQuery}&quot;
                      </div>
                    ) : (
                      <div className="grid grid-cols-6 gap-1.5">
                        {filteredIcons.map((iconKey) => (
                          <button
                            key={iconKey}
                            type="button"
                            title={iconKey}
                            onClick={() => {
                              updateBadge(i, 'icon', iconKey);
                              setOpenPickerIdx(null);
                            }}
                            className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition group/icon cursor-pointer ${
                              badge.icon === iconKey
                                ? 'bg-purple-100 dark:bg-purple-900/40 border border-purple-500/80 shadow-sm'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                            }`}
                          >
                            <IconPreview
                              iconKey={iconKey}
                              size={18}
                              className={
                                badge.icon === iconKey
                                  ? 'text-purple-600 dark:text-purple-300'
                                  : 'text-slate-600 dark:text-slate-400 group-hover/icon:text-purple-600 dark:group-hover/icon:text-white'
                              }
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer hint */}
                  {!searchQuery && (
                    <div className="px-3 py-1.5 border-t border-slate-200 dark:border-slate-800 text-[10px] font-medium text-slate-500 dark:text-slate-400 text-center">
                      {filteredIcons.length} icons · click to select
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Label input */}
            <input
              id={`badge-label-${i}`}
              type="text"
              value={badge.label}
              onChange={(e) => updateBadge(i, 'label', e.target.value)}
              placeholder="Label"
              className="min-w-[130px] flex-1 bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
            />

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <label className="flex items-center gap-1">X<input aria-label={`Icon ${i + 1} horizontal position`} type="number" min="0" max="100" value={badge.x} onChange={(e) => updateBadge(i, 'x', Math.max(0, Math.min(100, Number(e.target.value))))} className="w-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg px-1.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 text-center" /></label>
              <label className="flex items-center gap-1">Y<input aria-label={`Icon ${i + 1} vertical position`} type="number" min="0" max="100" value={badge.y} onChange={(e) => updateBadge(i, 'y', Math.max(0, Math.min(100, Number(e.target.value))))} className="w-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg px-1.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 text-center" /></label>
            </div>
            <select aria-label={`Icon ${i + 1} size`} value={badge.size} onChange={(e) => updateBadge(i, 'size', e.target.value as IconBadge['size'])} className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <option value="small">S</option><option value="medium">M</option><option value="large">L</option>
            </select>

            <button
              type="button"
              onClick={() => removeBadge(i)}
              disabled={badges.length <= 1}
              aria-label={`Delete icon ${i + 1}`}
              title="Delete icon"
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-30 transition cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        id="btn-add-badge"
        onClick={addBadge}
        disabled={badges.length >= 9}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-purple-300 dark:border-purple-500/40 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <Plus size={14} />
        Add icon badge {badges.length >= 9 && '(max 9)'}
      </button>
    </div>
  );
}
