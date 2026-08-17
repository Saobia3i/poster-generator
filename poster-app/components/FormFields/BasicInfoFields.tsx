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
        <label htmlFor="field-title" className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider block mb-1.5">
          Title <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <input
          id="field-title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g. WEEKLY CLASSES ON"
          className="w-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
        />
      </div>

      {/* Subtitle */}
      {showSubtitle && (
        <div>
          <label htmlFor="field-subtitle" className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider block mb-1.5">
            Subtitle / Tagline
          </label>
          <input
            id="field-subtitle"
            type="text"
            value={subtitle}
            onChange={(e) => onSubtitleChange(e.target.value)}
            placeholder="e.g. Join us every week for hands-on learning"
            className="w-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
          />
        </div>
      )}

      {/* AI Quick Notes */}
      <div className="rounded-xl border border-purple-300 dark:border-purple-500/30 bg-purple-50/70 dark:bg-purple-950/20 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-purple-600 dark:text-purple-400" />
            <label htmlFor="field-quick-notes" className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
              AI Quick Notes
            </label>
          </div>
          <span className="text-[10px] text-purple-600/70 dark:text-purple-400/60 font-medium">Optional — always editable after</span>
        </div>
        <textarea
          id="field-quick-notes"
          rows={3}
          value={quickNotes}
          onChange={(e) => onQuickNotesChange(e.target.value)}
          placeholder='e.g. "workshop on cybersecurity, date 20 July, speaker Abrar, 3 topics: recon, exploitation, defense"'
          className="w-full bg-white dark:bg-slate-900/90 border border-purple-300 dark:border-purple-500/30 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
        />
        <button
          type="button"
          id="btn-ai-assist"
          onClick={onAIAssist}
          disabled={isAILoading || !quickNotes.trim()}
          className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all cursor-pointer"
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
