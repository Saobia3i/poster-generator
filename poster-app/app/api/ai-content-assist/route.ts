/**
 * POST /api/ai-content-assist
 *
 * Architecture: Inside Next.js (no separate Python service).
 * Groq and Pinecone both have full Node SDK support — no microservice needed.
 *
 * Flow:
 *   1. Receive rough notes from the form
 *   2. Query Pinecone for similar past poster copy (RAG)
 *      → If Pinecone unavailable or empty, skip gracefully
 *   3. Call Groq with system prompt + retrieved style examples
 *   4. Parse and validate Groq response with Zod
 *   5. Return structured {title, subtitle, body, suggestedTable, tableData}
 *
 * SETUP:
 *   Set these env vars in .env.local:
 *     GROQ_API_KEY=...
 *     PINECONE_API_KEY=...
 *     PINECONE_INDEX_NAME=poster-style-corpus  (create once, seed ~20-30 entries)
 *     PINECONE_ENVIRONMENT=...
 *
 * RAG corpus seeding:
 *   Run: node scripts/seed-pinecone.mjs
 *   You only need to seed once. After seeding, AI suggestions will
 *   automatically match your club's established tone and style.
 *   No code change needed — just add data to Pinecone.
 *
 * FAIL SAFE: If Groq or Pinecone are unavailable, returns {error: "AI unavailable"}.
 * The form still works fully manually — AI assist is enhancement only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AIContentSchema } from '@/lib/posterSchema';

export const runtime = 'nodejs';

const RequestSchema = z.object({
  notes: z.string().min(1, 'Notes are required'),
});

// ── Pinecone RAG query ─────────────────────────────────────────────
async function queryStyleCorpus(notes: string): Promise<string[]> {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME ?? 'poster-style-corpus';

  if (!apiKey) return []; // no Pinecone configured — skip gracefully

  try {
    const { Pinecone } = await import('@pinecone-database/pinecone');
    const pc = new Pinecone({ apiKey });
    const index = pc.index(indexName);

    // Embed the notes using Groq's embedding model or a simple fallback
    // For now we use the notes text hash as a proxy — replace with real embedding
    // when you want semantic similarity (requires embedding API call)
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) return [];

    // Use OpenAI-compatible embedding via Groq if available
    // (Groq currently supports text-embedding-ada-002 compatible API)
    const embeddingRes = await fetch('https://api.groq.com/openai/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nomic-embed-text-v1_5',
        input: notes,
      }),
    }).catch(() => null);

    if (!embeddingRes?.ok) return [];

    const embeddingData = await embeddingRes.json();
    const vector: number[] = embeddingData?.data?.[0]?.embedding;
    if (!vector) return [];

    const queryResult = await index.query({
      vector,
      topK: 5,
      includeMetadata: true,
    });

    return (queryResult.matches ?? [])
      .filter((m) => (m.score ?? 0) > 0.7)
      .map((m) => String(m.metadata?.posterCopy ?? ''))
      .filter(Boolean);
  } catch (err) {
    console.warn('[ai-content-assist] Pinecone query failed — skipping RAG:', err);
    return [];
  }
}

// ── Groq content generation ────────────────────────────────────────
async function generateWithGroq(
  notes: string,
  styleExamples: string[]
): Promise<unknown> {
  const { default: Groq } = await import('groq-sdk');
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const examplesSection =
    styleExamples.length > 0
      ? `\n\nStyle reference examples from past AUSTCAIC posters (match this voice and tone):\n${styleExamples.map((ex, i) => `[Example ${i + 1}]: ${ex}`).join('\n')}`
      : '';

  const systemPrompt = `You are a content writer for AUSTCAIC (American University of Science and Technology Club for AI and Cybersecurity). 
You generate polished, professional poster copy for club events, workshops, and announcements.
Club tone: formal but energetic, technical but accessible, concise and impactful.
${examplesSection}

CRITICAL: Respond ONLY with valid JSON matching this exact schema. No markdown, no explanation, just JSON:
{
  "title": "string — short, punchy, uppercase-friendly headline",
  "subtitle": "string — one sentence tagline or date/venue info",
  "body": ["string array — 3-5 bullet points, concise"],
  "suggestedTable": boolean — true if the content has parallel structured data (e.g. schedule, topic list with times/speakers),
  "tableData": {  // only if suggestedTable is true
    "headers": ["string"],
    "rows": [["string"]]
  }
}`;

  const response = await client.chat.completions.create({
    model: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate poster copy for this event/content:\n${notes}` },
    ],
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0]?.message?.content ?? '{}';
  return JSON.parse(text);
}

// ─────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Validate request
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Notes are required' }, { status: 422 });
  }

  // Check API key (fail gracefully if not configured)
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      {
        error: 'AI unavailable',
        message: 'GROQ_API_KEY is not configured. Set it in .env.local to enable AI assist.',
      },
      { status: 503 }
    );
  }

  try {
    // RAG: query style corpus (returns [] if Pinecone not configured)
    const styleExamples = await queryStyleCorpus(parsed.data.notes);

    // Generate content with Groq
    const rawResponse = await generateWithGroq(parsed.data.notes, styleExamples);

    // Validate Groq response shape
    const validated = AIContentSchema.safeParse(rawResponse);
    if (!validated.success) {
      console.warn('[ai-content-assist] Groq response did not match schema:', rawResponse);
      return NextResponse.json(
        { error: 'AI returned unexpected format', raw: rawResponse },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ...validated.data,
      _meta: {
        styleExamplesUsed: styleExamples.length,
        model: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
      },
    });
  } catch (err) {
    console.error('[ai-content-assist] Error:', err);
    return NextResponse.json(
      { error: 'AI unavailable', details: String(err) },
      { status: 503 }
    );
  }
}
