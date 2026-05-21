import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured on the server' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    const lang = formData.get('lang') as string;

    if (!file) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    // Convert Blob to File object expected by OpenAI
    // We give it a .webm extension since it's likely from MediaRecorder on web
    const buffer = Buffer.from(await file.arrayBuffer());
    const audioFile = new File([buffer], 'audio.webm', { type: file.type || 'audio/webm' });

    const startTime = Date.now();
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: lang === 'vi' ? 'vi' : (lang === 'ja' ? 'ja' : 'en'), // ISO-639-1 format
      response_format: 'text',
    });

    const latencyMs = Date.now() - startTime;
    const text = response as unknown as string; // when response_format='text', it returns string directly
    
    return NextResponse.json({ text, latencyMs });
  } catch (error: any) {
    console.error('STT error:', error);
    return NextResponse.json({ error: error.message || 'STT failed' }, { status: 500 });
  }
}
