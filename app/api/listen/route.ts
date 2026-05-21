import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import prisma from '@/lib/prisma';

import { getUserApiKey } from '@/lib/getUserApiKey';

const LANG_NAMES: Record<string, string> = {
  'en': 'English', 'vi': 'Vietnamese', 'ja': 'Japanese',
  'ko': 'Korean', 'zh': 'Chinese', 'fr': 'French', 'de': 'German',
};

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const apiKey = await getUserApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    const sourceLang = formData.get('sourceLang') as string || 'en';
    const targetLang = formData.get('targetLang') as string || 'vi';
    const modelName = formData.get('model') as string || 'gpt-4o-mini';
    const sessionId = formData.get('sessionId') as string || '';

    if (!file || file.size < 100) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    // ── Step 1: Whisper STT ──
    const buffer = Buffer.from(await file.arrayBuffer());
    const audioFile = new File([buffer], 'audio.webm', { type: 'audio/webm' });

    const sttResponse = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: sourceLang === 'vi' ? 'vi' : (sourceLang === 'ja' ? 'ja' : 'en'),
      response_format: 'text',
    });

    const transcribedText = (sttResponse as unknown as string).trim();
    const sttMs = Date.now() - startTime;

    if (!transcribedText) {
      return NextResponse.json({ text: '', translatedText: '', sttMs, translateMs: 0, totalMs: sttMs });
    }

    // ── Step 2: GPT Translation ──
    const translateStart = Date.now();
    const srcName = LANG_NAMES[sourceLang] || sourceLang;
    const tgtName = LANG_NAMES[targetLang] || targetLang;

    const chatResponse = await openai.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: `You are a real-time translator. Translate from ${srcName} to ${tgtName}. Output ONLY the translated text. No explanations, no quotes, no formatting.`
        },
        { role: 'user', content: transcribedText }
      ],
      temperature: 0.3,
      max_tokens: 512,
    });

    const translatedText = chatResponse.choices[0]?.message?.content?.trim() || '';
    const translateMs = Date.now() - translateStart;
    const totalMs = Date.now() - startTime;

    // Save to DB async
    if (sessionId) {
      await prisma.entry.create({
        data: {
          sessionId,
          originalText: transcribedText,
          translatedText,
          latencyMs: totalMs,
        }
      }).catch(err => console.error('Failed to save entry:', err));
    }

    return NextResponse.json({
      text: transcribedText,
      translatedText,
      sttMs,
      translateMs,
      totalMs,
    });
  } catch (error: any) {
    console.error('Listen error:', error);
    return NextResponse.json({ error: error.message || 'Listen failed' }, { status: 500 });
  }
}
