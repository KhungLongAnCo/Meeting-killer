"use client";

import { Volume2, VolumeX } from "lucide-react";

export type STTEngine = "openai-realtime" | "deepgram" | "web-speech" | "whisper";
export type AudioSource = "mic" | "tab" | "both";
export type Language = "en" | "vi" | "ja";
export type TranslateModel = "gpt-4o-mini" | "gpt-4o" | "gpt-4.1-mini" | "gpt-4.1-nano";
export type DeepgramModel = "nova-2" | "nova-2-general" | "nova-2-meeting";

export type ConfigBarProps = {
  sttEngine: STTEngine;
  onSttEngineChange: (value: STTEngine) => void;
  sourceLang: Language;
  onSourceLangChange: (value: Language) => void;
  targetLang: Language;
  onTargetLangChange: (value: Language) => void;
  audioSource: AudioSource;
  onAudioSourceChange: (value: AudioSource) => void;
  modelName: TranslateModel;
  onModelNameChange: (value: TranslateModel) => void;
  deepgramModel: DeepgramModel;
  onDeepgramModelChange: (value: DeepgramModel) => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
};

const LANGUAGES: { value: Language; flag: string; label: string }[] = [
  { value: "en", flag: "🇬🇧", label: "English" },
  { value: "vi", flag: "🇻🇳", label: "Tiếng Việt" },
  { value: "ja", flag: "🇯🇵", label: "Japanese" },
];

const STT_ENGINES: { value: STTEngine; label: string }[] = [
  { value: "deepgram", label: "Deepgram Live" },
  { value: "openai-realtime", label: "OpenAI Realtime" },
  { value: "web-speech", label: "Web Speech (Free)" },
  { value: "whisper", label: "Whisper" },
];

const TRANSLATE_MODELS: { value: TranslateModel; label: string }[] = [
  { value: "gpt-4.1-nano", label: "4.1 Nano · $0.10/m" },
  { value: "gpt-4o-mini", label: "4o Mini · $0.15/m" },
  { value: "gpt-4.1-mini", label: "4.1 Mini · $0.40/m" },
  { value: "gpt-4o", label: "4o · $2.50/m" },
];

const DEEPGRAM_MODELS: { value: DeepgramModel; label: string }[] = [
  { value: "nova-2", label: "Nova 2 · $0.0059/m" },
  { value: "nova-2-general", label: "Nova 2 General · $0.0059/m" },
  { value: "nova-2-meeting", label: "Nova 2 Meeting · $0.0059/m" },
];

function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; flag?: string }[];
}) {
  return (
    <div className="bg-[color:var(--bg-secondary)] border border-[color:var(--border-subtle)] p-3 rounded flex flex-col gap-1 shadow-md hover:border-[color:var(--border-active)] transition-colors">
      <label className="text-[9px] text-[color:var(--text-secondary)] uppercase font-mono tracking-widest font-bold">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="bg-transparent border-none outline-none text-[color:var(--text-primary)] text-xs font-mono font-medium cursor-pointer w-full focus:ring-0"
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)]"
          >
            {opt.flag ? `${opt.flag} ${opt.label}` : opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export const ConfigBar = ({
  sttEngine,
  onSttEngineChange,
  sourceLang,
  onSourceLangChange,
  targetLang,
  onTargetLangChange,
  audioSource,
  onAudioSourceChange,
  modelName,
  onModelNameChange,
  deepgramModel,
  onDeepgramModelChange,
  voiceEnabled,
  onToggleVoice,
}: ConfigBarProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 w-full">
      <SelectField
        label="STT Engine"
        value={sttEngine}
        onChange={onSttEngineChange}
        options={STT_ENGINES}
      />

      <SelectField
        label="Source"
        value={sourceLang}
        onChange={onSourceLangChange}
        options={LANGUAGES}
      />

      <SelectField
        label="Target"
        value={targetLang}
        onChange={onTargetLangChange}
        options={LANGUAGES}
      />

      <SelectField
        label="Audio"
        value={audioSource}
        onChange={onAudioSourceChange}
        options={[
          { value: "mic", label: "🎤 Mic Only" },
          { value: "tab", label: "🖥️ Tab Audio" },
          { value: "both", label: "⚡ Combined" },
        ]}
      />

      {sttEngine === "deepgram" ? (
        <SelectField
          label="Deepgram Model"
          value={deepgramModel}
          onChange={onDeepgramModelChange}
          options={DEEPGRAM_MODELS}
        />
      ) : (
        <SelectField
          label="Translate Model"
          value={modelName}
          onChange={onModelNameChange}
          options={TRANSLATE_MODELS}
        />
      )}

      <div
        onClick={onToggleVoice}
        className={`border p-3 rounded flex items-center justify-between shadow-md cursor-pointer transition-all duration-200 ${
          voiceEnabled
            ? "bg-[color:var(--accent-dim)] border-[color:var(--accent-glow)] text-[color:var(--accent)] hover:bg-[color:var(--accent-glow)]"
            : "bg-[color:var(--bg-secondary)] border-[color:var(--border-subtle)] text-[color:var(--text-secondary)] hover:border-[color:var(--border-active)]"
        }`}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] text-[color:var(--text-secondary)] uppercase font-mono tracking-widest font-bold">
            Voice Engine
          </span>
          <span className="text-xs font-mono font-medium">
            {voiceEnabled ? "ACTIVE" : "MUTED"}
          </span>
        </div>
        {voiceEnabled ? (
          <Volume2 className="w-4 h-4" />
        ) : (
          <VolumeX className="w-4 h-4 opacity-60" />
        )}
      </div>
    </div>
  );
};
