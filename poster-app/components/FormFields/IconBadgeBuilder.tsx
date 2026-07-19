'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, Search, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { ICON_CATEGORIES, ICON_CATEGORY_LABELS, AVAILABLE_ICONS } from '@/lib/iconPaths';
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
    onChange([...badges, { icon: 'shield', label: '' }]);
  };

  const removeBadge = (i: number) => {
    onChange(badges.filter((_, idx) => idx !== i));
  };

  const updateBadge = (i: number, field: keyof IconBadge, value: string) => {
    const next = [...badges];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };

  // Filtered icon list
  const filteredIcons: string[] = searchQuery.trim()
    ? AVAILABLE_ICONS.filter((key) =>
        key.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : (ICON_CATEGORIES[activeCategory] ?? []);

  const openPicker = (i: number) => {
    setOpenPickerIdx(openPickerIdx === i ? null : i);
    setSearchQuery('');
    setActiveCategory(ICON_CATEGORY_LABELS[0]);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
          Icon Badges
        </label>
        <span className="text-[10px] text-white/30">{badges.length}/9</span>
      </div>

      <div className="flex flex-col gap-2">
        {badges.map((badge, i) => (
          <div key={i} className="flex items-center gap-2 group">
            {/* Icon picker button */}
            <div className="relative" ref={openPickerIdx === i ? dropdownRef : undefined}>
              <button
                type="button"
                id={`icon-picker-${i}`}
                onClick={() => openPicker(i)}
                className="flex items-center gap-1.5 px-2.5 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-purple-500/50 transition min-w-[72px]"
              >
                <IconPreview iconKey={badge.icon} size={14} />
                <span className="text-[9px] text-white/50 truncate max-w-[42px]">{badge.icon}</span>
                <ChevronDown size={9} className="text-white/30 flex-shrink-0" />
              </button>

              {/* ─── Icon Picker Dropdown ─────────────────────── */}
              {openPickerIdx === i && (
                <div
                  className="absolute top-full left-0 mt-1 z-50 w-[310px] bg-[#16122a] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Search bar */}
                  <div className="p-2 border-b border-white/8">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
                      <Search size={12} className="text-white/30 flex-shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search icons…"
                        className="flex-1 bg-transparent text-xs text-white placeholder-white/20 focus:outline-none"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="text-white/30 hover:text-white/60"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category tabs — hidden during search */}
                  {!searchQuery && (
                    <div className="flex overflow-x-auto gap-0.5 px-2 pt-2 pb-0 scrollbar-none border-b border-white/5">
                      {ICON_CATEGORY_LABELS.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setActiveCategory(cat)}
                          className={`flex-shrink-0 px-2 py-1 rounded-t-lg text-[9px] font-semibold whitespace-nowrap transition-all ${
                            activeCategory === cat
                              ? 'bg-purple-600/30 text-purple-300 border-b-2 border-purple-500'
                              : 'text-white/40 hover:text-white/70 hover:bg-white/5'
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
                      <div className="text-center py-6 text-[10px] text-white/25">
                        No icons found for &quot;{searchQuery}&quot;
                      </div>
                    ) : (
                      <div className="grid grid-cols-6 gap-1">
                        {filteredIcons.map((iconKey) => (
                          <button
                            key={iconKey}
                            type="button"
                            title={iconKey}
                            onClick={() => {
                              updateBadge(i, 'icon', iconKey);
                              setOpenPickerIdx(null);
                            }}
                            className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition group/icon ${
                              badge.icon === iconKey
                                ? 'bg-purple-500/30 border border-purple-500/60 shadow-sm shadow-purple-900/30'
                                : 'hover:bg-white/10 border border-transparent'
                            }`}
                          >
                            <IconPreview
                              iconKey={iconKey}
                              size={16}
                              className={
                                badge.icon === iconKey
                                  ? 'text-purple-300'
                                  : 'text-white/50 group-hover/icon:text-white/90'
                              }
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer hint */}
                  {!searchQuery && (
                    <div className="px-3 py-1.5 border-t border-white/5 text-[9px] text-white/20 text-center">
                      {filteredIcons.length} icons · hover for name
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
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition"
            />

            <button
              type="button"
              onClick={() => removeBadge(i)}
              disabled={badges.length <= 1}
              className="p-1.5 rounded-lg text-white/0 group-hover:text-white/30 hover:!text-red-400 hover:bg-red-400/10 disabled:!opacity-0 transition"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        id="btn-add-badge"
        onClick={addBadge}
        disabled={badges.length >= 9}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/15 text-white/40 hover:text-white/70 hover:border-white/30 text-xs transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Plus size={13} />
        Add icon badge {badges.length >= 9 && '(max 9)'}
      </button>
    </div>
  );
}
