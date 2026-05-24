"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Activity } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ConfigBar } from "@/components/room/ConfigBar";
import { TranscriptPanel } from "@/components/room/TranscriptPanel";
import { ControlBar } from "@/components/room/ControlBar";
import { useRecording } from "@/hooks/useRecording";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import type { STTEngine, AudioSource, Language, TranslateModel, DeepgramModel } from "@/components/room/ConfigBar";
import type { Entry } from "@/components/room/TranscriptPanel";

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = use(params);
  const auth = useAuth();
  const settings = useSettings(auth.isAuthenticated);

  const [roomName, setRoomName] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Config state
  const [sourceLang, setSourceLang] = useState<Language>("en");
  const [targetLang, setTargetLang] = useState<Language>("vi");
  const [modelName, setModelName] = useState<TranslateModel>("gpt-4o-mini");
  const [sttEngine, setSttEngine] = useState<STTEngine>("deepgram");
  const [audioSource, setAudioSource] = useState<AudioSource>("both");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [deepgramModel, setDeepgramModel] = useState<DeepgramModel>("nova-2");

  const recording = useRecording({
    sttEngine,
    sourceLang,
    targetLang,
    modelName,
    audioSource,
    deepgramModel,
    deepgramApiKey: settings.deepgramApiKey,
    voiceEnabled,
    sessionId,
  });

  // Load room data
  useEffect(() => {
    fetch(`/api/rooms/${roomId}`)
      .then((r) => r.json())
      .then((room) => {
        setRoomName(room.name || "");
        if (room.sessions) {
          const allEntries: Entry[] = [];
          for (const session of room.sessions) {
            for (const entry of session.entries) {
              allEntries.push({
                id: entry.id,
                originalText: entry.originalText,
                translatedText: entry.translatedText,
                totalMs: entry.latencyMs,
                speakerId: 1,
              });
            }
          }
          setEntries(allEntries);
        }
      })
      .catch(console.error);
  }, [roomId]);

  // Create session on mount
  useEffect(() => {
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceLang, targetLang, model: modelName, roomId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) setSessionId(data.id);
      })
      .catch(console.error);
  }, [roomId]);

  // Sync recording entries with room entries
  const allEntries = [...entries, ...recording.entries];

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => !prev);
  }, []);

  const handleCopy = useCallback(() => {
    const text = allEntries
      .map(
        (e) =>
          `[${recording.speakers.find((s) => s.id === e.speakerId)?.name || "Unknown"}]\n${e.originalText}\n${e.translatedText}`,
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
  }, [allEntries, recording.speakers]);

  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 overflow-y-auto bg-[color:var(--bg-primary)]">
        <div className="w-full max-w-4xl flex flex-col gap-5">
          {/* Room Title */}
          <div className="flex items-center gap-2 text-xs font-mono text-[color:var(--text-secondary)] tracking-wider">
            <Activity className="w-3.5 h-3.5 text-[color:var(--accent)] animate-pulse" />
            ROOM:{" "}
            <span className="text-[color:var(--text-primary)] font-bold">
              {roomName.toUpperCase() || "LOADING..."}
            </span>
          </div>

          <ConfigBar
            sttEngine={sttEngine}
            onSttEngineChange={setSttEngine}
            sourceLang={sourceLang}
            onSourceLangChange={setSourceLang}
            targetLang={targetLang}
            onTargetLangChange={setTargetLang}
            audioSource={audioSource}
            onAudioSourceChange={setAudioSource}
            modelName={modelName}
            onModelNameChange={setModelName}
            deepgramModel={deepgramModel}
            onDeepgramModelChange={setDeepgramModel}
            voiceEnabled={voiceEnabled}
            onToggleVoice={toggleVoice}
          />

          <TranscriptPanel
            entries={allEntries}
            interimText={recording.interimText}
            interimOriginalText={recording.interimOriginalText}
            interimTranslatedText={recording.interimTranslatedText}
            isProcessing={recording.isProcessing}
          />

          <ControlBar
            isRecording={recording.isRecording}
            onStart={recording.startRecording}
            onStop={recording.stopRecording}
            onCopy={handleCopy}
            onClear={recording.clearTranscript}
          />
        </div>
      </div>
    </AppShell>
  );
}
