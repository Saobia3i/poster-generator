'use client';

import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface BasicInfoFieldsProps {
  title: string;
  subtitle: string;
  quickNotes: string;
  showSubtitle: boolean;
  isAILoading: boolean;
  onTitleChange: (v: string) => void;
  onSubtitleChange: (v: string) => void;
  onQuickNotesChange: (v: string) => void;
  onAIAssist: () => void;
}

export default function BasicInfoFields({
  title,
  subtitle,
  quickNotes,
  showSubtitle,
  isAILoading,
  onTitleChange,
  onSubtitleChange,
  onQuickNotesChange,
  onAIAssist,
}: BasicInfoFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      <div>
        <label htmlFor="field-title" className="text-xs font-semibold text-white/50 uppercase tracking-widest block mb-1.5">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          id="field-title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g. WEEKLY CLASSES ON"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition"
        />
      </div>

      {/* Subtitle */}
      {showSubtitle && (
        <div>
          <label htmlFor="field-subtitle" className="text-xs font-semibold text-white/50 uppercase tracking-widest block mb-1.5">
            Subtitle / Tagline
          </label>
          <input
            id="field-subtitle"
            type="text"
            value={subtitle}
            onChange={(e) => onSubtitleChange(e.target.value)}
            placeholder="e.g. Join us every week for hands-on learning"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition"
          />
        </div>
      )}

      {/* AI Quick Notes */}
      <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-purple-400" />
            <label htmlFor="field-quick-notes" className="text-xs font-semibold text-purple-300 uppercase tracking-widest">
              AI Quick Notes
            </label>
          </div>
          <span className="text-[10px] text-purple-400/50">Optional — always editable after</span>
        </div>
        <textarea
          id="field-quick-notes"
          rows={3}
          value={quickNotes}
          onChange={(e) => onQuickNotesChange(e.target.value)}
          placeholder='e.g. "workshop on cybersecurity, date 20 July, speaker Abrar, 3 topics: recon, exploitation, defense"'
          className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-purple-500 transition"
        />
        <button
          type="button"
          id="btn-ai-assist"
          onClick={onAIAssist}
          disabled={isAILoading || !quickNotes.trim()}
          className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all"
        >
          {isAILoading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Sparkles size={13} />
          )}
          {isAILoading ? 'Generating...' : 'Auto-fill with AI'}
        </button>
      </div>
    </div>
  );
}
