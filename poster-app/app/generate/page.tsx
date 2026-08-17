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
import {
  Download,
  AlertTriangle,
  History,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  RotateCcw,
  Trash2,
  GripVertical,
  Link,
  Sun,
  Moon,
  Layout,
  Image as ImageIcon,
  Type,
  List,
  Table as TableIcon,
  Shield,
  QrCode,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

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
  hasPartnerLogo: false,
  partnerLogoPosition: 'top-right',
  bulletList: ['CYBERSECURITY', 'AI & MACHINE LEARNING'],
  bulletIcons: [null, null],
  hasTable: false,
  tableHeaders: ['Topic', 'Time', 'Speaker'],
  tableRows: [['', '', ''], ['', '', '']],
  hasIconBadges: false,
  iconBadges: [
    { icon: 'shield', label: 'SECURITY', x: 82, y: 78, size: 'medium' },
    { icon: 'brain', label: 'AI', x: 70, y: 78, size: 'medium' },
  ],
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
  bulletAlignment: 'left',
  logoLayout: 'split',
};

// ── Section wrapper ────────────────────────────────────────────────
function FormSection({
  title,
  icon: Icon,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all">
      <button
        type="button"
        className={`w-full flex items-center justify-between px-4 py-3.5 text-left ${collapsible ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60' : 'cursor-default'}`}
        onClick={() => collapsible && setOpen(!open)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && <Icon size={16} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />}
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate">{title}</span>
        </div>
        {collapsible && (open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />)}
      </button>
      {open && <div className="px-4 pb-4.5 pt-1 flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800/60">{children}</div>}
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
      className="flex w-full items-center justify-between text-left cursor-pointer group py-1"
    >
      <div>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition">{label}</span>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
      </div>
      <span className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
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
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as PosterFormData['clubLogoPosition'])}
        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
      >
        <option value="top-left">Top Left</option>
        <option value="top-center">Top Center</option>
        <option value="top-right">Top Right</option>
        <option value="center">Center</option>
        <option value="bottom-left">Bottom Left</option>
        <option value="bottom-center">Bottom Center</option>
        <option value="bottom-right">Bottom Right</option>
        <option value="hidden">Hidden</option>
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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
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

  useEffect(() => {
    const saved = localStorage.getItem('poster-theme') as 'dark' | 'light';
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('poster-theme', nextTheme);
  };

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
      if (data.iconBadges?.length) {
        update('hasIconBadges', true);
        update('iconBadges', data.iconBadges.map((badge: { icon: string; label: string }, index: number) => ({
          ...badge,
          x: 82 - index * 12,
          y: 78,
          size: 'medium' as const,
        })));
      }
    } catch (err) {
      console.error('AI assist error:', err);
      setGenerateError(err instanceof Error ? err.message : 'AI assist failed.');
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className={`${theme} flex h-dvh w-full overflow-hidden bg-slate-100 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200`}>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close form sidebar"
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══════════════════════════════════════
          LEFT PANEL — Form
          ═══════════════════════════════════════ */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-[min(460px,92vw)] flex-shrink-0 flex flex-col h-dvh overflow-y-auto overscroll-contain touch-pan-y bg-slate-50 dark:bg-[#0e1320] border-r border-slate-200 dark:border-slate-800/80 shadow-2xl lg:static lg:z-auto lg:w-[460px] lg:translate-x-0 lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-200`}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 sm:px-6 sm:py-4 bg-white dark:bg-slate-900/80">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md shadow-purple-500/20">
                A
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-100 truncate tracking-tight">Poster Generator</h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">AUSTCAIC · Graphics Team</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle Light or Dark Theme"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 transition cursor-pointer text-xs font-bold shadow-sm"
              >
                {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-purple-600" />}
                <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>

              <button
                type="button"
                aria-label="Close form sidebar"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 lg:hidden cursor-pointer"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="px-4 py-4 flex flex-col gap-3.5">

          {/* Density warning banner */}
          {densityWarning && (
            <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 rounded-xl px-4 py-3 shadow-sm">
              <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">{densityWarning}</p>
            </div>
          )}

          {/* Generate error */}
          {generateError && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-500/40 rounded-xl px-4 py-3 text-xs font-medium text-red-700 dark:text-red-300 shadow-sm">
              {generateError}
            </div>
          )}

          {/* 1. Size */}
          <FormSection title="Poster Size" icon={Layout}>
            <SizeSelector
              value={formData.sizePreset}
              onChange={(v) => update('sizePreset', v)}
              customWidthIn={formData.customWidthIn}
              customHeightIn={formData.customHeightIn}
              onCustomWidth={(v) => update('customWidthIn', v)}
              onCustomHeight={(v) => update('customHeightIn', v)}
            />
          </FormSection>

          {/* 2. Branding */}
          <FormSection title="Branding & Logo Layout" icon={ImageIcon}>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 block">Logo Placement Type</label>
                <select
                  value={formData.logoLayout}
                  onChange={(e) => update('logoLayout', e.target.value as 'split' | 'side_by_side')}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
                >
                  <option value="split">Split Corners (Original)</option>
                  <option value="side_by_side">Side-by-Side Header</option>
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

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <Toggle
                  id="toggle-partner-logo"
                  label="Add Partner / Sponsor Logo"
                  description="Upload custom PNG/JPEG logo for partners or co-organizers"
                  checked={formData.hasPartnerLogo ?? false}
                  onChange={(v) => update('hasPartnerLogo', v)}
                />

                {formData.hasPartnerLogo && (
                  <div className="flex flex-col gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
                      Partner Logo Image (PNG / JPEG)
                    </label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            update('partnerLogoDataUrl', ev.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                    />

                    {formData.partnerLogoDataUrl && (
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          <img src={formData.partnerLogoDataUrl} alt="Partner Logo Preview" className="h-8 max-w-[100px] object-contain rounded bg-white p-1 border border-slate-200" />
                          <span className="text-[11px] text-slate-500 font-medium">Uploaded</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => update('partnerLogoDataUrl', undefined)}
                          className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {formData.logoLayout === 'split' && (
                      <LogoPlacementSelect
                        id="partner-logo-position"
                        label="Partner logo position"
                        value={formData.partnerLogoPosition ?? 'top-right'}
                        onChange={(v) => update('partnerLogoPosition', v)}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </FormSection>

          {/* Dynamic Reorderable Sections */}
          {formData.sectionOrder.map((section, index) => {
            let sectionTitle = '';
            let SectionCategoryIcon = Type;
            let sectionContent: React.ReactNode = null;
            let isEnabled = false;

            if (section === 'content') {
              isEnabled = true;
              sectionTitle = 'Poster Content';
              SectionCategoryIcon = Type;
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
                    <div className="flex flex-col gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <Toggle
                        id="toggle-extra-badge"
                        label="Extra Badge Pill"
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
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
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
              SectionCategoryIcon = List;
              sectionContent = (
                <div className="flex flex-col gap-3">
                  <BodyListBuilder
                    items={formData.bulletList}
                    onChange={(v) => update('bulletList', v)}
                    icons={formData.bulletIcons}
                    onIconsChange={(v) => update('bulletIcons', v)}
                  />

                  <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 block">Bullet List Columns</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((cols) => (
                        <button
                          key={cols}
                          type="button"
                          onClick={() => update('bulletColumns', cols)}
                          className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            formData.bulletColumns === cols
                              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
                              : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {cols} {cols === 1 ? 'Column' : 'Columns'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <label htmlFor="bullet-alignment" className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Bullet Alignment</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'left', label: 'Left', icon: AlignLeft },
                        { key: 'center', label: 'Center', icon: AlignCenter },
                        { key: 'right', label: 'Right', icon: AlignRight },
                      ].map(({ key, label, icon: AlignIcon }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => update('bulletAlignment', key as PosterFormData['bulletAlignment'])}
                          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            formData.bulletAlignment === key
                              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
                              : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <AlignIcon size={14} />
                          {label}
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
              SectionCategoryIcon = TableIcon;
              sectionContent = (
                <div className="flex flex-col gap-3">
                  <Toggle
                    id="toggle-table"
                    label="Add Data Table"
                    description="Shows a clean data table on the poster"
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
              SectionCategoryIcon = Shield;
              sectionContent = (
                <div className="flex flex-col gap-3">
                  <Toggle
                    id="toggle-icon-badges"
                    label="Free-Positioned Icon Badges"
                    description="Add individual Lucide icons with X/Y position and size controls"
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
              SectionCategoryIcon = QrCode;
              sectionContent = (
                <div className="flex flex-col gap-3">
                  <Toggle
                    id="toggle-qr"
                    label="QR Code"
                    description="Generates QR code centered on poster from URL"
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
              SectionCategoryIcon = ImageIcon;
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
                className={`relative border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-4 transition-all duration-150 shadow-sm ${
                  draggingIndex === index ? 'opacity-40 border-dashed border-purple-500 bg-purple-50 dark:bg-purple-950/20' : 'hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Drag Header handle */}
                <div className="flex items-center justify-between gap-3 mb-3 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} className="text-slate-400 hover:text-purple-600 transition flex-shrink-0" />
                    <SectionCategoryIcon size={15} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider">{sectionTitle}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveSection(index, 'up')}
                      className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === formData.sectionOrder.length - 1}
                      onClick={() => moveSection(index, 'down')}
                      className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown size={14} />
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

          {/* Corner watermarks */}
          {features.watermarkWords && (
            <FormSection title="Corner Watermarks" icon={Layers} collapsible defaultOpen={false}>
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
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-[#0e1320] shadow-lg">
          <button
            type="button"
            id="btn-generate"
            onClick={handleGenerate}
            disabled={isGenerating || !formData.title.trim()}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
              bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500
              shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 active:scale-[0.99]"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Generating PNG...
              </>
            ) : (
              <>
                <Download size={17} />
                Generate & Download PNG
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleShareLink}
            className="w-full mt-2.5 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-xs border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-sm"
          >
            <Link size={14} />
            {shareLinkCopied ? 'Link Copied to Clipboard!' : 'Share Edit Link'}
          </button>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 text-center mt-2">
            Exports at full {formData.sizePreset === 'custom' ? `${Math.round((formData.customWidthIn ?? 8) * 300)}×${Math.round((formData.customHeightIn ?? 5) * 300)}` : ({ banner_small: '1500×600', facebook_post: '1200×630', instagram_square: '1080×1080', instagram_story: '1080×1920', instagram_portrait_4_5: '1080×1350', poster_landscape: '1500×2400', poster_portrait_a4: '2481×3508' }[formData.sizePreset])}px · 300 DPI
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          RIGHT PANEL — Live Preview
          ═══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-dvh min-w-0 overflow-hidden bg-slate-200 dark:bg-[#060810] border-l border-slate-200 dark:border-slate-800/80">
        {/* Preview header */}
        <div className="px-4 py-3 border-b border-slate-300 dark:border-slate-800 flex items-center justify-between flex-shrink-0 bg-white dark:bg-slate-900/90 sm:px-6 sm:py-3.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open form sidebar"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 lg:hidden cursor-pointer shadow-sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={19} />
            </button>
            <div className="inline-flex rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800/80 p-1">
              <button
                type="button"
                onClick={() => setActivePanel('preview')}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
                  activePanel === 'preview'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Live Preview
              </button>
              <button
                type="button"
                onClick={() => setActivePanel('history')}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
                  activePanel === 'history'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Previous
              </button>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 sm:flex">
            <History size={14} className="text-purple-600 dark:text-purple-400" />
            <span>{historyItems.length} saved {historySource === 'local' ? 'locally' : 'shared'}</span>
          </div>
        </div>

        {activePanel === 'preview' ? (
          <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center p-3 sm:p-6">
            <PosterPreview
              formData={formData}
              onDensityWarning={setDensityWarning}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-[#060810]">
            {isHistoryLoading ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-300 dark:border-slate-700 border-t-purple-600" />
                <p className="mt-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Loading previous posters...</p>
              </div>
            ) : historyItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <History size={32} className="text-slate-400 dark:text-slate-600" />
                <h2 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">No previous posters yet</h2>
                <p className="mt-1 max-w-sm text-xs font-medium text-slate-500 dark:text-slate-400">
                  Generate and download a poster once. It will be saved here for the team on this shared server.
                </p>
              </div>
            ) : (
              <div className="mx-auto flex w-full max-w-4xl flex-col gap-3.5">
                {historySource === 'local' && (
                  <div className="rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-xs font-semibold text-amber-800 dark:text-amber-200 shadow-sm">
                    Shared history could not load, so this is showing only this browser's local saved posters.
                  </div>
                )}
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</h2>
                        <span className="rounded-full border border-purple-200 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300">
                          {item.sizePreset.replaceAll('_', ' ')}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="mt-1 line-clamp-1 text-xs text-slate-600 dark:text-slate-400">{item.subtitle}</p>
                      )}
                      <p className="mt-2 text-[10px] font-medium text-slate-400 dark:text-slate-500">{formatSavedAt(item.savedAt)}</p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => loadFromHistory(item)}
                        className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-3.5 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer"
                      >
                        <RotateCcw size={14} />
                        Load
                      </button>
                      {historySource === 'local' && (
                        <button
                          type="button"
                          aria-label={`Delete ${item.title}`}
                          onClick={() => deleteHistoryItem(item.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 transition cursor-pointer"
                        >
                          <Trash2 size={14} />
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
