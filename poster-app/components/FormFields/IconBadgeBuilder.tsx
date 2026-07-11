'use client';

import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { AVAILABLE_ICONS } from '@/lib/iconPaths';
import type { IconBadge } from '@/lib/layoutEngine';

interface IconBadgeBuilderProps {
  badges: IconBadge[];
  onChange: (badges: IconBadge[]) => void;
}

// Map from our icon key names to Lucide component names
const ICON_TO_LUCIDE: Record<string, string> = {
  'shield': 'Shield',
  'shield-check': 'ShieldCheck',
  'lock': 'Lock',
  'wifi': 'Wifi',
  'code': 'Code',
  'code-2': 'Code2',
  'globe': 'Globe',
  'users': 'Users',
  'star': 'Star',
  'zap': 'Zap',
  'award': 'Award',
  'target': 'Target',
  'cpu': 'Cpu',
  'database': 'Database',
  'terminal': 'Terminal',
  'search': 'Search',
  'mail': 'Mail',
  'calendar': 'Calendar',
  'brain': 'Brain',
  'network': 'Network',
  'map-pin': 'MapPin',
  'book-open': 'BookOpen',
  'presentation': 'Presentation',
};

function IconPreview({ iconKey, size = 16 }: { iconKey: string; size?: number }) {
  const componentName = ICON_TO_LUCIDE[iconKey];
  if (!componentName) return <span style={{ fontSize: size }}>□</span>;
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size: number; className?: string }>>)[componentName];
  if (!Icon) return <span style={{ fontSize: size }}>□</span>;
  return <Icon size={size} className="text-purple-400" />;
}

export default function IconBadgeBuilder({ badges, onChange }: IconBadgeBuilderProps) {
  const [openPickerIdx, setOpenPickerIdx] = useState<number | null>(null);

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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
          Icon Badges
        </label>
        <span className="text-[10px] text-white/30">
          {badges.length}/9 · wraps at 3
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {badges.map((badge, i) => (
          <div key={i} className="flex items-center gap-2 group">
            {/* Icon picker button */}
            <div className="relative">
              <button
                type="button"
                id={`icon-picker-${i}`}
                onClick={() => setOpenPickerIdx(openPickerIdx === i ? null : i)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-purple-500/50 transition min-w-[80px]"
              >
                <IconPreview iconKey={badge.icon} />
                <span className="text-[10px] text-white/50 truncate max-w-[50px]">{badge.icon}</span>
                <ChevronDown size={10} className="text-white/30 flex-shrink-0" />
              </button>

              {/* Icon picker dropdown */}
              {openPickerIdx === i && (
                <div className="absolute top-full left-0 mt-1 z-50 w-64 bg-[#1a1625] border border-white/10 rounded-xl p-2 shadow-2xl shadow-black/50">
                  <div className="grid grid-cols-5 gap-1">
                    {AVAILABLE_ICONS.map((iconKey) => (
                      <button
                        type="button"
                        key={iconKey}
                        title={iconKey}
                        onClick={() => {
                          updateBadge(i, 'icon', iconKey);
                          setOpenPickerIdx(null);
                        }}
                        className={`p-2 rounded-lg flex items-center justify-center transition ${
                          badge.icon === iconKey
                            ? 'bg-purple-500/30 border border-purple-500/50'
                            : 'hover:bg-white/10'
                        }`}
                      >
                        <IconPreview iconKey={iconKey} size={14} />
                      </button>
                    ))}
                  </div>
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
