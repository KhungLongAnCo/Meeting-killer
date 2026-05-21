import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import prisma from '@/lib/prisma';

import { getUserApiKey } from '@/lib/getUserApiKey';

export async function POST(request: Request) {
  try {
    const { text, sourceLang, targetLang, modelName, sessionId } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = await getUserApiKey();
    if (!apiKey) {
       return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const langNames: Record<string, string> = {
      'en': 'English',
      'vi': 'Vietnamese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'fr': 'French',
      'de': 'German',
    };

    const srcName = langNames[sourceLang] || sourceLang;
    const tgtName = langNames[targetLang] || targetLang;

    const startTime = Date.now();
    const response = await openai.chat.completions.create({
      model: modelName || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a real-time translator. Translate from ${srcName} to ${tgtName}. Output ONLY the translated text. No explanations, no quotes, no formatting.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const translatedText = response.choices[0]?.message?.content?.trim() || '';
    const latencyMs = Date.now() - startTime;

    // If sessionId is provided, save the entry asynchronously
    if (sessionId) {
      await prisma.entry.create({
        data: {
          sessionId,
          originalText: text,
          translatedText,
          latencyMs,
        }
      }).catch(err => console.error('Failed to save entry:', err));
    }

    return NextResponse.json({ translatedText, latencyMs });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: error.message || 'Translation failed' }, { status: 500 });
  }
}
