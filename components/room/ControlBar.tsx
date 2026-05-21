"use client";

import { Mic, Square, Copy, Trash2 } from "lucide-react";

export type ControlBarProps = {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  onCopy: () => void;
  onClear: () => void;
};

export const ControlBar = ({
  isRecording,
  onStart,
  onStop,
  onCopy,
  onClear,
}: ControlBarProps) => {
  return (
    <div
      className={`p-4 rounded border transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl ${
        isRecording
          ? "bg-[color:var(--bg-secondary)] border-[color:var(--danger)] shadow-[0_0_20px_rgba(255,64,96,0.1)]"
          : "bg-[color:var(--bg-secondary)] border-[color:var(--border-subtle)]"
      }`}
    >
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {!isRecording ? (
          <button
            onClick={onStart}
            className="flex items-center gap-2 bg-[color:var(--accent)] hover:bg-[color:var(--accent)]/90 text-black px-6 py-2.5 rounded font-mono font-bold uppercase tracking-wider text-xs transition-all active:scale-95 w-full sm:w-auto justify-center cursor-pointer shadow-[0_0_15px_rgba(200,255,0,0.15)] hover:shadow-[0_0_25px_rgba(200,255,0,0.3)]"
          >
            <Mic className="w-4 h-4 stroke-[2.5]" />
            START INTERCEPT
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex items-center gap-2 bg-[color:var(--danger)] hover:bg-[color:var(--danger)]/90 text-white px-6 py-2.5 rounded font-mono font-bold uppercase tracking-wider text-xs transition-all active:scale-95 w-full sm:w-auto justify-center cursor-pointer shadow-[0_0_15px_rgba(255,64,96,0.2)]"
          >
            <Square className="w-4 h-4 fill-white stroke-none" />
            STOP INTERCEPT
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs font-mono">
        <StatusBadge isRecording={isRecording} />
        <div className="h-6 w-px bg-[color:var(--border-subtle)] hidden sm:block" />
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors p-2 sm:p-0 cursor-pointer font-bold"
        >
          <Copy className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">COPY</span>
        </button>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-[color:var(--text-secondary)] hover:text-[color:var(--danger)] transition-colors p-2 sm:p-0 cursor-pointer font-bold"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">CLEAR</span>
        </button>
      </div>
    </div>
  );
};

function StatusBadge({ isRecording }: { isRecording: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[color:var(--bg-primary)] border border-[color:var(--border-subtle)] rounded">
      {isRecording ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--danger)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--danger)]" />
          </span>
          <span className="text-[color:var(--danger)] font-bold tracking-widest">
            RECORDING
          </span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-[color:var(--text-muted)]" />
          <span className="text-[color:var(--text-muted)] tracking-widest">
            STANDBY
          </span>
        </>
      )}
    </div>
  );
}
