import { NextResponse } from 'next/server';
import { getUserApiKey } from '@/lib/getUserApiKey';

export async function POST(request: Request) {
  try {
    const { targetLang } = await request.json();
    const apiKey = await getUserApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured on the server' }, { status: 500 });
    }

    const response = await fetch(
      "https://api.openai.com/v1/realtime/translations/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Safety-Identifier": "meeting-killer-session",
        },
        body: JSON.stringify({
          session: {
            model: "gpt-realtime-translate",
            audio: {
              input: {
                transcription: {
                  model: "gpt-realtime-whisper"
                }
              },
              output: { language: targetLang || "en" },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI Realtime Token Error:", errorText);
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error creating realtime token:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
