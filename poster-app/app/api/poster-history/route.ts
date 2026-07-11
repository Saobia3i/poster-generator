import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

import { PosterFormSchema, type PosterFormData } from '@/lib/posterSchema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type HistoryFileEntry = {
  timestamp?: string;
  sizePreset?: PosterFormData['sizePreset'];
  title?: string;
  subtitle?: string;
  formSnapshot?: unknown;
};

function historyPath() {
  return path.join(process.cwd(), 'data', 'posters.json');
}

function toClientItem(entry: HistoryFileEntry, index: number) {
  const parsed = PosterFormSchema.safeParse(entry.formSnapshot);
  if (!parsed.success) return null;

  const savedAt = entry.timestamp ?? new Date(0).toISOString();
  const formData = parsed.data;

  return {
    id: `${savedAt}-${index}`,
    savedAt,
    title: entry.title?.trim() || formData.title || 'Untitled poster',
    subtitle: entry.subtitle ?? formData.subtitle ?? '',
    sizePreset: entry.sizePreset ?? formData.sizePreset,
    formData,
  };
}

export async function GET() {
  try {
    if (!fs.existsSync(historyPath())) {
      return NextResponse.json({ items: [] });
    }

    const raw = fs.readFileSync(historyPath(), 'utf-8');
    const fileData = JSON.parse(raw);
    const entries = Array.isArray(fileData) ? fileData : [];

    const items = entries
      .map(toClientItem)
      .filter((item): item is NonNullable<ReturnType<typeof toClientItem>> => item !== null)
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

    return NextResponse.json({ items });
  } catch (err) {
    console.error('[poster-history] Could not read history:', err);
    return NextResponse.json(
      { error: 'Could not read poster history' },
      { status: 500 }
    );
  }
}
