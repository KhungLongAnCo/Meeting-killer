"use client";

import { useRef, useEffect } from "react";
import { Loader2, Target } from "lucide-react";

export type Entry = {
  id: string;
  originalText: string;
  translatedText: string;
  totalMs?: number;
  sttMs?: number;
  translateMs?: number;
  speakerId: number;
};

export type TranscriptPanelProps = {
  entries: Entry[];
  interimText: string;
  interimOriginalText: string;
  interimTranslatedText: string;
  isProcessing: boolean;
};

export const TranscriptPanel = ({
  entries,
  interimText,
  interimOriginalText,
  interimTranslatedText,
  isProcessing,
}: TranscriptPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, interimText, interimOriginalText, interimTranslatedText]);

  const isEmpty =
    entries.length === 0 &&
    !interimText &&
    !interimOriginalText &&
    !interimTranslatedText &&
    !isProcessing;

  return (
    <div className="relative bg-[color:var(--bg-secondary)] border border-[color:var(--border-subtle)] rounded-lg p-5 h-[calc(100vh-320px)] min-h-[300px] flex flex-col shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--bg-secondary)] via-transparent to-[color:var(--bg-secondary)] pointer-events-none z-10 opacity-70" />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pb-20 pt-4 z-0 pr-2"
      >
        {isEmpty && (
          <div className="h-full flex flex-col items-center justify-center text-[color:var(--text-muted)] gap-3">
            <div className="border border-[color:var(--border-subtle)] p-4 rounded-full bg-[color:var(--bg-primary)]/50 relative">
              <Target className="w-8 h-8 opacity-40 text-[color:var(--text-secondary)]" />
              <div className="absolute inset-0 border border-[color:var(--accent)] rounded-full animate-ping opacity-25 scale-75" />
            </div>
            <p className="text-xs font-mono tracking-widest text-center">
              SYSTEM ARMED. AWAITING INCOMING AUDIO.
            </p>
          </div>
        )}

        {entries.map((entry) => (
          <div
            key={entry.id}
            className="group animate-slide-in relative border-b border-[color:var(--border-subtle)]/30 pb-4 last:border-b-0 space-y-1"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-[color:var(--text-secondary)] font-normal leading-relaxed font-sans">
                {entry.originalText}
              </p>
              {entry.totalMs && (
                <span className="text-[9px] font-mono text-[color:var(--text-muted)] bg-[color:var(--bg-elevated)] px-2 py-0.5 rounded border border-[color:var(--border-subtle)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                  {entry.totalMs}ms
                </span>
              )}
            </div>
            <p className="text-base font-semibold leading-relaxed tracking-tight font-sans text-[color:var(--text-primary)]">
              {entry.translatedText}
            </p>
          </div>
        ))}

        {interimText && (
          <div className="space-y-1 pl-12">
            <p className="text-sm text-[color:var(--text-primary)] font-mono flex items-center gap-2">
              {interimText}
              <span className="w-1.5 h-3 bg-[color:var(--accent)] rounded-sm animate-pulse" />
            </p>
          </div>
        )}

        {(interimOriginalText || interimTranslatedText) && (
          <div className="space-y-1">
            {interimOriginalText && (
              <p className="text-sm text-[color:var(--text-secondary)] font-sans">
                {interimOriginalText}
              </p>
            )}
            {interimTranslatedText && (
              <p className="text-base font-semibold font-sans flex items-center gap-2 text-[color:var(--text-primary)]">
                {interimTranslatedText}
                <span className="w-1.5 h-3.5 bg-[color:var(--accent)] rounded-sm animate-pulse" />
              </p>
            )}
          </div>
        )}

        {isProcessing && !interimText && (
          <div className="flex items-center gap-2 text-[color:var(--accent)] opacity-80 pl-12">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-xs font-mono tracking-wider">
              DECODING STREAM...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
