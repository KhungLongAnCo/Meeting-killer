"use client";

import { useState } from "react";
import { Settings, X, Target, Globe2, Loader2 } from "lucide-react";

type TabKey = "api-keys" | "preferences" | "appearance";

const TABS: { key: TabKey; label: string; available: boolean }[] = [
  { key: "api-keys", label: "API Keys", available: true },
  { key: "preferences", label: "Preferences", available: false },
  { key: "appearance", label: "Appearance", available: false },
];

export type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
  openaiApiKey: string;
  onOpenaiApiKeyChange: (value: string) => void;
  deepgramApiKey: string;
  onDeepgramApiKeyChange: (value: string) => void;
  isSaving: boolean;
  onSave: () => void;
};

export const SettingsModal = ({
  open,
  onClose,
  openaiApiKey,
  onOpenaiApiKeyChange,
  deepgramApiKey,
  onDeepgramApiKeyChange,
  isSaving,
  onSave,
}: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("api-keys");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center font-sans">
      <div className="bg-[color:var(--bg-secondary)] border border-[color:var(--border-subtle)] rounded-xl w-full max-w-3xl flex overflow-hidden shadow-2xl relative h-[500px]">
        {/* Left Sidebar */}
        <div className="w-48 bg-[color:var(--bg-primary)] border-r border-[color:var(--border-subtle)] p-4 flex flex-col gap-2">
          <h2 className="text-sm font-bold tracking-wider uppercase text-[color:var(--text-primary)] mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[color:var(--accent)]" />
            Settings
          </h2>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => tab.available && setActiveTab(tab.key)}
              className={`text-left px-3 py-2 rounded text-xs font-mono font-bold transition-colors ${
                activeTab === tab.key
                  ? "bg-[color:var(--accent-dim)] text-[color:var(--accent)] border border-[color:var(--accent-glow)]"
                  : tab.available
                    ? "text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-elevated)] hover:text-[color:var(--text-primary)]"
                    : "text-[color:var(--text-secondary)] cursor-not-allowed"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Content */}
        <div className="flex-1 p-6 flex flex-col relative overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {activeTab === "api-keys" && (
            <div className="max-w-md w-full">
              <h3 className="text-lg font-bold text-[color:var(--text-primary)] mb-6 border-b border-[color:var(--border-subtle)] pb-2 tracking-wide">
                API Configuration
              </h3>

              <div className="space-y-6">
                <ApiKeyField
                  icon={<Target className="w-4 h-4 text-[#00e87b]" />}
                  label="OpenAI API Key"
                  description="Your personal API key used for Realtime Translation and Whisper STT. Securely stored."
                  placeholder="sk-..."
                  value={openaiApiKey}
                  onChange={onOpenaiApiKeyChange}
                />

                <ApiKeyField
                  icon={<Target className="w-4 h-4 text-[#ff007f]" />}
                  label="Deepgram API Key"
                  description="Your Deepgram API key used for Live Streaming Audio STT. Securely stored."
                  placeholder="Token..."
                  value={deepgramApiKey}
                  onChange={onDeepgramApiKeyChange}
                />

                <div className="bg-[color:var(--bg-primary)] p-4 rounded-lg border border-[color:var(--border-subtle)] opacity-50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[color:var(--bg-secondary)]/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <span className="text-[10px] font-mono font-bold tracking-widest bg-black/80 px-2 py-1 rounded text-[color:var(--text-muted)]">
                      SOON
                    </span>
                  </div>
                  <label className="block text-sm font-bold text-[color:var(--text-primary)] mb-2 flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-[#3b82f6]" />
                    Gemini API Key
                  </label>
                  <input
                    disabled
                    type="password"
                    placeholder="AIza..."
                    className="w-full bg-[color:var(--bg-secondary)] border border-[color:var(--border-subtle)] rounded px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab !== "api-keys" && (
            <div className="flex items-center justify-center h-full text-[color:var(--text-muted)] text-xs font-mono">
              COMING SOON
            </div>
          )}

          <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-[color:var(--border-subtle)] w-full">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-mono font-bold text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--bg-elevated)] cursor-pointer transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-6 py-2 rounded text-xs font-mono font-bold bg-[color:var(--accent)] text-black hover:bg-[color:var(--accent)]/90 flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(200,255,0,0.15)] transition-all active:scale-95"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              SAVE CHANGES
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function ApiKeyField({
  icon,
  label,
  description,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="bg-[color:var(--bg-primary)] p-4 rounded-lg border border-[color:var(--border-subtle)] hover:border-[color:var(--border-active)] transition-colors">
      <label className="block text-sm font-bold text-[color:var(--text-primary)] mb-2 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <p className="text-xs text-[color:var(--text-muted)] mb-3 leading-relaxed">
        {description}
      </p>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[color:var(--bg-secondary)] border border-[color:var(--border-active)] rounded px-3 py-2 text-sm font-mono outline-none focus:border-[color:var(--accent)] text-[color:var(--text-primary)] shadow-inner"
      />
    </div>
  );
}
