'use client';

import React, { useState, useCallback, useEffect } from 'react';
import SizeSelector from '@/components/FormFields/SizeSelector';
import BasicInfoFields from '@/components/FormFields/BasicInfoFields';
import BodyListBuilder from '@/components/FormFields/BodyListBuilder';
import TableBuilder from '@/components/TableBuilder';
import IconBadgeBuilder from '@/components/FormFields/IconBadgeBuilder';
import QrCodeField from '@/components/FormFields/QrCodeField';
import ImageUpload from '@/components/FormFields/ImageUpload';
import WatermarkFields from '@/components/FormFields/WatermarkFields';
import PosterPreview from '@/components/PosterPreview';

import { PRESET_TO_VARIANT, VARIANT_FEATURES } from '@/lib/theme';
import type { PosterFormData } from '@/lib/posterSchema';
import { Download, AlertTriangle, History, ChevronDown, ChevronUp, Menu, X, RotateCcw, Trash2, GripVertical, Link } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'austcaic-poster-history-v1';
const MAX_HISTORY_ITEMS = 30;

type PosterHistoryItem = {
  id: string;
  savedAt: string;
  title: string;
  subtitle: string;
  sizePreset: PosterFormData['sizePreset'];
  formData: PosterFormData;
};

// ── Default form state ─────────────────────────────────────────────
const defaultFormData: PosterFormData = {
  sizePreset: 'poster_landscape',
  title: '',
  subtitle: '',
  clubLogoPosition: 'top-center',
  varsityLogoPosition: 'bottom-center',
  bulletList: ['CYBERSECURITY', 'AI & MACHINE LEARNING'],
  hasTable: false,
  tableHeaders: ['Topic', 'Time', 'Speaker'],
  tableRows: [['', '', ''], ['', '', '']],
  hasIconBadges: false,
  iconBadges: [{ icon: 'shield', label: 'SECURITY' }, { icon: 'brain', label: 'AI' }],
  hasQrCode: false,
  qrUrl: '',
  hasWatermark: true,
  watermarkLeft: 'SECURE',
  watermarkRight: 'LEAD',
  hasExtraBadge: false,
  extraBadgeText: 'REGISTRATION OPEN',
  imageDataUrl: undefined,
  imageFrame: 'none' as const,
  imagePosition: 'center-right' as const,
  imageSize: 'medium' as const,
  quickNotes: '',
  sectionOrder: ['content', 'bullets', 'table', 'badges', 'qrcode', 'image'],
  bulletColumns: 1,
  logoLayout: 'split',
};

// ── Section wrapper ────────────────────────────────────────────────
function FormSection({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
      <button
        type="button"
        className={`w-full flex items-center justify-between px-5 py-4 text-left ${collapsible ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'}`}
        onClick={() => collapsible && setOpen(!open)}
      >
        <span className="text-xs font-bold text-white/60 uppercase tracking-[0.15em]">{title}</span>
        {collapsible && (open ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />)}
      </button>
      {open && <div className="px-5 pb-5 flex flex-col gap-4">{children}</div>}
    </div>
  );
}

// ── Toggle switch ──────────────────────────────────────────────────
function Toggle({ id, label, checked, onChange, description }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void; description?: string }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between text-left cursor-pointer group"
    >
      <div>
        <span className="text-sm text-white/70 group-hover:text-white/90 transition">{label}</span>
        {description && <p className="text-[10px] text-white/30 mt-0.5">{description}</p>}
      </div>
      <span className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-purple-600' : 'bg-white/10'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </span>
    </button>
  );
}

function LogoPlacementSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: PosterFormData['clubLogoPosition'];
  onChange: (value: PosterFormData['clubLogoPosition']) => void;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as PosterFormData['clubLogoPosition'])}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
      >
        <option value="top-left" className="bg-[#15121f]">Top Left</option>
        <option value="top-center" className="bg-[#15121f]">Top Center</option>
        <option value="top-right" className="bg-[#15121f]">Top Right</option>
        <option value="center" className="bg-[#15121f]">Center</option>
        <option value="bottom-left" className="bg-[#15121f]">Bottom Left</option>
        <option value="bottom-center" className="bg-[#15121f]">Bottom Center</option>
        <option value="bottom-right" className="bg-[#15121f]">Bottom Right</option>
        <option value="hidden" className="bg-[#15121f]">Hidden</option>
      </select>
    </label>
  );
}

function formatSavedAt(value: string) {
  try {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return 'Saved poster';
  }
}

// ─────────────────────────────────────────────────────────────────
export default function GeneratePage() {
  const [formData, setFormData] = useState<PosterFormData>(defaultFormData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [densityWarning, setDensityWarning] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'preview' | 'history'>('preview');
  const [historyItems, setHistoryItems] = useState<PosterHistoryItem[]>([]);
  const [historySource, setHistorySource] = useState<'server' | 'local'>('server');
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const getShareableLink = useCallback(() => {
    try {
      // Omit image data to avoid huge URL strings
      const { imageDataUrl, ...dataToShare } = formData;
      const json = JSON.stringify(dataToShare);
      const base64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
      const url = new URL(window.location.href);
      url.hash = `share=${base64}`;
      return url.toString();
    } catch (err) {
      console.error('Failed to generate shareable link:', err);
      return window.location.href;
    }
  }, [formData]);

  const handleShareLink = useCallback(() => {
    const link = getShareableLink();
    navigator.clipboard.writeText(link).then(() => {
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 2000);
    });
  }, [getShareableLink]);

  const variant = PRESET_TO_VARIANT[formData.sizePreset];
  const features = VARIANT_FEATURES[variant];

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;
    
    const newOrder = [...formData.sectionOrder];
    const draggedItem = newOrder[draggingIndex];
    newOrder.splice(draggingIndex, 1);
    newOrder.splice(index, 0, draggedItem);
    
    setDraggingIndex(index);
    update('sectionOrder', newOrder);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingIndex(null);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.sectionOrder.length) return;
    
    const newOrder = [...formData.sectionOrder];
    const item = newOrder[index];
    newOrder.splice(index, 1);
    newOrder.splice(newIndex, 0, item);
    update('sectionOrder', newOrder);
  };

  const update = useCallback(<K extends keyof PosterFormData>(key: K, value: PosterFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const loadLocalHistory = useCallback(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, MAX_HISTORY_ITEMS) as PosterHistoryItem[];
      }
    } catch (err) {
      console.warn('[poster-history] Could not load local history:', err);
    }
    return [];
  }, []);

  const loadSharedHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const res = await fetch('/api/poster-history', { cache: 'no-store' });
      if (!res.ok) throw new Error('Shared history is unavailable.');
      const data = await res.json();
      if (!Array.isArray(data.items)) throw new Error('Shared history returned an unexpected response.');
      setHistoryItems(data.items.slice(0, MAX_HISTORY_ITEMS));
      setHistorySource('server');
    } catch (err) {
      console.warn('[poster-history] Falling back to local history:', err);
      setHistoryItems(loadLocalHistory());
      setHistorySource('local');
    } finally {
      setIsHistoryLoading(false);
    }
  }, [loadLocalHistory]);

  useEffect(() => {
    loadSharedHistory();
  }, [loadSharedHistory]);

  useEffect(() => {
    // Load from URL hash if present
    try {
      const hash = window.location.hash;
      if (hash.startsWith('#share=')) {
        const base64 = hash.substring(7);
        const decodedJson = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const parsedData = JSON.parse(decodedJson);
        // Merge with default state to ensure all fields exist
        setFormData((prev) => ({ ...prev, ...parsedData }));
        // Clear hash so it doesn't stay in the address bar if they edit it
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (err) {
      console.warn('Failed to parse shareable link from hash:', err);
    }
  }, []);

  const persistHistory = useCallback((items: PosterHistoryItem[]) => {
    setHistoryItems(items);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      const lightweight = items.map((item) => ({
        ...item,
        formData: { ...item.formData, imageDataUrl: undefined },
      }));
      setHistoryItems(lightweight);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(lightweight));
      } catch {
        setHistoryItems([]);
      }
      console.warn('[poster-history] Saved without uploaded images because browser storage is full:', err);
    }
  }, []);

  const saveToHistory = useCallback((snapshot: PosterFormData) => {
    const now = new Date();
    const item: PosterHistoryItem = {
      id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      savedAt: now.toISOString(),
      title: snapshot.title.trim() || 'Untitled poster',
      subtitle: snapshot.subtitle ?? '',
      sizePreset: snapshot.sizePreset,
      formData: snapshot,
    };
    persistHistory([item, ...historyItems].slice(0, MAX_HISTORY_ITEMS));
  }, [historyItems, persistHistory]);

  const loadFromHistory = useCallback((item: PosterHistoryItem) => {
    setFormData(item.formData);
    setGenerateError(null);
    setActivePanel('preview');
    setSidebarOpen(false);
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    persistHistory(historyItems.filter((item) => item.id !== id));
  }, [historyItems, persistHistory]);

  // ── Generate & download PNG ──────────────────────────────────────
  const handleGenerate = async () => {
    if (!formData.title.trim()) {
      setGenerateError('Please add a title before generating.');
      return;
    }
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch('/api/generate-poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Generation failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(formData.title || 'poster').toLowerCase().replace(/\s+/g, '-')}.png`;
      a.click();
      URL.revokeObjectURL(url);
      saveToHistory(formData);
      loadSharedHistory();
    } catch (err: unknown) {
      setGenerateError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ── AI content assist ────────────────────────────────────────────
  const handleAIAssist = async () => {
    if (!formData.quickNotes?.trim()) return;
    setIsAILoading(true);
    setGenerateError(null);
    try {
      const res = await fetch('/api/ai-content-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: formData.quickNotes }),
      });
      const data = await res.json();

      if (data.error) {
        console.warn('AI assist:', data.message ?? data.error);
        setGenerateError(data.message ?? data.error);
        return; // fail gracefully — form still usable
      }

      // Auto-fill fields (team member can still edit before generating)
      if (data.title) update('title', data.title);
      if (data.subtitle) update('subtitle', data.subtitle);
      if (data.body?.length) update('bulletList', data.body);
      if (data.suggestedTable && data.tableData) {
        update('hasTable', true);
        update('tableHeaders', data.tableData.headers);
        update('tableRows', data.tableData.rows);
      }
    } catch (err) {
      console.error('AI assist error:', err);
      setGenerateError(err instanceof Error ? err.message : 'AI assist failed.');
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="flex h-dvh w-screen overflow-hidden bg-[#0C0B14] text-white">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close form sidebar"
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══════════════════════════════════════
          LEFT PANEL — Form
          ═══════════════════════════════════════ */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-[min(460px,92vw)] flex-shrink-0 flex flex-col h-dvh overflow-y-auto overscroll-contain touch-pan-y bg-[#0C0B14] shadow-2xl shadow-black/40 transition-transform duration-200 lg:static lg:z-auto lg:w-[460px] lg:translate-x-0 lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">A</div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-white truncate">Poster Generator</h1>
              <p className="text-[11px] text-white/35">AUSTCAIC · Graphics Team Tool</p>
            </div>
            </div>
            <button
              type="button"
              aria-label="Close form sidebar"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form fields */}
        <div className="px-4 py-4 flex flex-col gap-3">

          {/* Density warning banner */}
          {densityWarning && (
            <div className="flex items-start gap-2.5 bg-yellow-500/10 border border-yellow-500/25 rounded-xl px-4 py-3">
              <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-300">{densityWarning}</p>
            </div>
          )}

          {/* Generate error */}
          {generateError && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-xs text-red-300">
              {generateError}
            </div>
          )}

          {/* 1. Size */}
          <FormSection title="Poster Size">
            <SizeSelector
              value={formData.sizePreset}
              onChange={(v) => update('sizePreset', v)}
              customWidthIn={formData.customWidthIn}
              customHeightIn={formData.customHeightIn}
              onCustomWidth={(v) => update('customWidthIn', v)}
              onCustomHeight={(v) => update('customHeightIn', v)}
            />
          </FormSection>

          <FormSection title="Branding & Logo Layout">
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-white/60 mb-1.5 block">Logo Placement Type</label>
                <select
                  value={formData.logoLayout}
                  onChange={(e) => update('logoLayout', e.target.value as 'split' | 'side_by_side')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                >
                  <option value="split" className="bg-[#15121f]">Split Corners (Original)</option>
                  <option value="side_by_side" className="bg-[#15121f]">Side-by-Side</option>
                </select>
              </div>

              {formData.logoLayout === 'split' && (
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <LogoPlacementSelect
                    id="club-logo-position"
                    label="Club logo"
                    value={formData.clubLogoPosition}
                    onChange={(v) => update('clubLogoPosition', v)}
                  />
                  <LogoPlacementSelect
                    id="varsity-logo-position"
                    label="Varsity logo"
                    value={formData.varsityLogoPosition}
                    onChange={(v) => update('varsityLogoPosition', v)}
                  />
                </div>
              )}
            </div>
          </FormSection>

          {/* Dynamic Reorderable Sections */}
          {formData.sectionOrder.map((section, index) => {
            let sectionTitle = '';
            let sectionContent: React.ReactNode = null;
            let isEnabled = false;

            if (section === 'content') {
              isEnabled = true;
              sectionTitle = 'Poster Content';
              sectionContent = (
                <div className="flex flex-col gap-4">
                  <BasicInfoFields
                    title={formData.title}
                    subtitle={formData.subtitle ?? ''}
                    quickNotes={formData.quickNotes ?? ''}
                    showSubtitle={features.subtitle}
                    isAILoading={isAILoading}
                    onTitleChange={(v) => update('title', v)}
                    onSubtitleChange={(v) => update('subtitle', v)}
                    onQuickNotesChange={(v) => update('quickNotes', v)}
                    onAIAssist={handleAIAssist}
                  />

                  {features.extraBadge && (
                    <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
                      <Toggle
                        id="toggle-extra-badge"
                        label="Extra Badge pill"
                        description="Pill badge above headline (e.g. REGISTRATION OPEN)"
                        checked={formData.hasExtraBadge}
                        onChange={(v) => update('hasExtraBadge', v)}
                      />
                      {formData.hasExtraBadge && (
                        <input
                          id="field-badge-text"
                          type="text"
                          value={formData.extraBadgeText ?? ''}
                          onChange={(e) => update('extraBadgeText', e.target.value)}
                          placeholder="REGISTRATION OPEN"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            }

            else if (section === 'bullets' && features.bulletList) {
              isEnabled = true;
              sectionTitle = 'Bullet List';
              sectionContent = (
                <div className="flex flex-col gap-3">
                  <BodyListBuilder
                    items={formData.bulletList}
                    onChange={(v) => update('bulletList', v)}
                  />

                  <div className="mt-2 pt-3 border-t border-white/5">
                    <label className="text-[11px] font-semibold text-white/50 mb-1.5 block">Bullet List Columns (Side-by-Side)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((cols) => (
                        <button
                          key={cols}
                          type="button"
                          onClick={() => update('bulletColumns', cols)}
                          className={`py-1.5 rounded-lg text-xs font-semibold transition ${
                            formData.bulletColumns === cols
                              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
                              : 'bg-white/5 hover:bg-white/10 text-white/70'
                          }`}
                        >
                          {cols} {cols === 1 ? 'Col' : 'Cols'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            else if (section === 'table' && features.table) {
              isEnabled = true;
              sectionTitle = 'Table Builder';
              sectionContent = (
                <div className="flex flex-col gap-3">
                  <Toggle
                    id="toggle-table"
                    label="Add Table"
                    description="Shows a styled data table on the poster"
                    checked={formData.hasTable}
                    onChange={(v) => update('hasTable', v)}
                  />
                  {formData.hasTable && (
                    <TableBuilder
                      headers={formData.tableHeaders}
                      rows={formData.tableRows}
                      onHeadersChange={(v) => update('tableHeaders', v)}
                      onRowsChange={(v) => update('tableRows', v)}
                    />
                  )}
                </div>
              );
            }

            else if (section === 'badges' && features.iconBadges) {
              isEnabled = true;
              sectionTitle = 'Icon Badges';
              sectionContent = (
                <div className="flex flex-col gap-3">
                  <Toggle
                    id="toggle-icon-badges"
                    label="Icon Badge Row"
                    description="Row of icon + label pairs in the bottom-right"
                    checked={formData.hasIconBadges}
                    onChange={(v) => update('hasIconBadges', v)}
                  />
                  {formData.hasIconBadges && (
                    <IconBadgeBuilder
                      badges={formData.iconBadges}
                      onChange={(v) => update('iconBadges', v)}
                    />
                  )}
                </div>
              );
            }

            else if (section === 'qrcode' && features.qrCode) {
              isEnabled = true;
              sectionTitle = 'QR Code';
              sectionContent = (
                <div className="flex flex-col gap-3">
                  <Toggle
                    id="toggle-qr"
                    label="QR Code"
                    description="Generates QR code from URL, centered on poster"
                    checked={formData.hasQrCode}
                    onChange={(v) => update('hasQrCode', v)}
                  />
                  {formData.hasQrCode && (
                    <QrCodeField url={formData.qrUrl ?? ''} onChange={(v) => update('qrUrl', v)} />
                  )}
                </div>
              );
            }

            else if (section === 'image' && features.imageUpload) {
              isEnabled = true;
              sectionTitle = 'Optional Image';
              sectionContent = (
                <ImageUpload
                  imageDataUrl={formData.imageDataUrl}
                  imageFrame={formData.imageFrame}
                  imagePosition={formData.imagePosition}
                  imageSize={formData.imageSize}
                  onChange={(v) => update('imageDataUrl', v)}
                  onFrameChange={(v) => update('imageFrame', v)}
                  onPositionChange={(v) => update('imagePosition', v)}
                  onSizeChange={(v) => update('imageSize', v)}
                />
              );
            }

            if (!isEnabled) return null;

            return (
              <div
                key={section}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                className={`relative border border-white/5 bg-[#12101b]/40 rounded-2xl p-4 transition-all duration-150 ${
                  draggingIndex === index ? 'opacity-40 border-dashed border-purple-500 bg-purple-500/5' : 'hover:border-white/10'
                }`}
              >
                {/* Drag Header handle */}
                <div className="flex items-center justify-between gap-3 mb-3 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2 text-white/50 cursor-grab active:cursor-grabbing">
                    <GripVertical size={14} className="hover:text-white transition flex-shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">{sectionTitle}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveSection(index, 'up')}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                      title="Move Up"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={index === formData.sectionOrder.length - 1}
                      onClick={() => moveSection(index, 'down')}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                      title="Move Down"
                    >
                      <ChevronDown size={12} />
                    </button>
                  </div>
                </div>

                {/* Section Content */}
                <div>
                  {sectionContent}
                </div>
              </div>
            );
          })}

          {/* Corner watermarks (fixed at bottom of dynamic order list) */}
          {features.watermarkWords && (
            <FormSection title="Corner Watermarks" collapsible defaultOpen={false}>
              <div className="flex flex-col gap-3">
                <Toggle
                  id="toggle-watermark"
                  label="Corner Watermarks"
                  description="Decorative words at bottom corners (e.g. SECURE / LEAD)"
                  checked={formData.hasWatermark}
                  onChange={(v) => update('hasWatermark', v)}
                />
                {formData.hasWatermark && (
                  <WatermarkFields
                    left={formData.watermarkLeft}
                    right={formData.watermarkRight}
                    onLeftChange={(v) => update('watermarkLeft', v)}
                    onRightChange={(v) => update('watermarkRight', v)}
                  />
                )}
              </div>
            </FormSection>
          )}

          {/* Spacer */}
          <div className="h-4" />
        </div>

        {/* Generate button (sticky footer) */}
        <div className="px-4 py-4 border-t border-white/8 flex-shrink-0 bg-[#0C0B14]">
          <button
            type="button"
            id="btn-generate"
            onClick={handleGenerate}
            disabled={isGenerating || !formData.title.trim()}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
              bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500
              shadow-lg shadow-purple-900/30 hover:shadow-purple-700/40"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download size={16} />
                Generate & Download PNG
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleShareLink}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-xs border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 transition-all duration-200"
          >
            <Link size={13} />
            {shareLinkCopied ? 'Link Copied to Clipboard!' : 'Share Edit Link'}
          </button>
          <p className="text-[10px] text-white/20 text-center mt-2">
            Exports at full {formData.sizePreset === 'custom' ? `${Math.round((formData.customWidthIn ?? 8) * 300)}×${Math.round((formData.customHeightIn ?? 5) * 300)}` : ({ banner_small: '1500×600', facebook_post: '1200×630', instagram_square: '1080×1080', instagram_story: '1080×1920', poster_landscape: '1500×2400', poster_portrait_a4: '2481×3508' }[formData.sizePreset])}px · 300 DPI
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          RIGHT PANEL — Live Preview
          ═══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-dvh min-w-0 overflow-hidden bg-[#08070F] border-l border-white/6">
        {/* Preview header */}
        <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between flex-shrink-0">
          <div>
            <button
              type="button"
              aria-label="Open form sidebar"
              className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={19} />
            </button>
            <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1 align-middle">
              <button
                type="button"
                onClick={() => setActivePanel('preview')}
                className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest rounded-lg transition ${
                  activePanel === 'preview' ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white/70'
                }`}
              >
                Live Preview
              </button>
              <button
                type="button"
                onClick={() => setActivePanel('history')}
                className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest rounded-lg transition ${
                  activePanel === 'history' ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white/70'
                }`}
              >
                Previous
              </button>
            </div>
            <p className="text-[10px] text-white/20 mt-0.5">Updates as you type · Export uses full resolution</p>
          </div>
          <div className="hidden items-center gap-2 text-[10px] text-white/25 sm:flex">
            <History size={11} />
            <span>{historyItems.length} saved {historySource === 'local' ? 'locally' : 'shared'}</span>
          </div>
        </div>

        {activePanel === 'preview' ? (
          <div className="flex-1 overflow-hidden flex items-center justify-center p-4 sm:p-6">
            <PosterPreview
              formData={formData}
              onDensityWarning={setDensityWarning}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            {isHistoryLoading ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-purple-400" />
                <p className="mt-4 text-xs text-white/35">Loading previous posters...</p>
              </div>
            ) : historyItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <History size={28} className="text-white/20" />
                <h2 className="mt-4 text-sm font-semibold text-white/70">No previous posters yet</h2>
                <p className="mt-1 max-w-sm text-xs text-white/30">
                  Generate and download a poster once. It will be saved here for the team on this shared server.
                </p>
              </div>
            ) : (
              <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
                {historySource === 'local' && (
                  <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-xs text-yellow-200/80">
                    Shared history could not load, so this is showing only this browser's local saved posters.
                  </div>
                )}
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-sm font-semibold text-white/80">{item.title}</h2>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/35">
                          {item.sizePreset.replaceAll('_', ' ')}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="mt-1 line-clamp-1 text-xs text-white/35">{item.subtitle}</p>
                      )}
                      <p className="mt-2 text-[10px] text-white/25">{formatSavedAt(item.savedAt)}</p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => loadFromHistory(item)}
                        className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-200 hover:bg-purple-500/20"
                      >
                        <RotateCcw size={13} />
                        Load
                      </button>
                      {historySource === 'local' && (
                        <button
                          type="button"
                          aria-label={`Delete ${item.title}`}
                          onClick={() => deleteHistoryItem(item.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/35 hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
