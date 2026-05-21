"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Entry } from "@/components/room/TranscriptPanel";
import type { STTEngine, AudioSource, Language, TranslateModel, DeepgramModel } from "@/components/room/ConfigBar";

const SPEAKER_COLORS = [
  "#00f0ff", "#c8ff00", "#ff007f", "#ffd000", "#e000ff",
  "#ff7b00", "#3b82f6", "#ff4060", "#00e87b",
];

type Speaker = {
  id: number;
  name: string;
  color: string;
};

export type UseRecordingParams = {
  sttEngine: STTEngine;
  sourceLang: Language;
  targetLang: Language;
  modelName: TranslateModel;
  audioSource: AudioSource;
  deepgramModel: DeepgramModel;
  deepgramApiKey: string;
  voiceEnabled: boolean;
  sessionId: string | null;
};

export function useRecording({
  sttEngine,
  sourceLang,
  targetLang,
  modelName,
  audioSource,
  deepgramModel,
  deepgramApiKey,
  voiceEnabled,
  sessionId,
}: UseRecordingParams) {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimOriginalText, setInterimOriginalText] = useState("");
  const [interimTranslatedText, setInterimTranslatedText] = useState("");
  const [speakers, setSpeakers] = useState<Speaker[]>([
    { id: 1, name: "Person 1", color: SPEAKER_COLORS[0] },
  ]);
  const [currentSpeaker, setCurrentSpeaker] = useState(1);

  // Refs
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tabStreamRef = useRef<MediaStream | null>(null);
  const mixCtxRef = useRef<AudioContext | null>(null);
  const isRecordingRef = useRef(false);
  const processingRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const vadFrameRef = useRef<number | null>(null);
  const hadVoiceRef = useRef(false);
  const deepgramSocketRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const interimOriginalRef = useRef("");
  const interimTranslatedRef = useRef("");
  const currentSpeakerRef = useRef(1);
  const lastFinalizeTimeRef = useRef(0);
  const speakerCountRef = useRef(1);

  // Ref syncs
  const sourceLangRef = useRef(sourceLang);
  const targetLangRef = useRef(targetLang);
  const modelNameRef = useRef(modelName);
  const sessionIdRef = useRef(sessionId);

  useEffect(() => { sourceLangRef.current = sourceLang; }, [sourceLang]);
  useEffect(() => { targetLangRef.current = targetLang; }, [targetLang]);
  useEffect(() => { modelNameRef.current = modelName; }, [modelName]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // ── Realtime helpers ──
  const finalizeRealtimeSentence = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    const original = interimOriginalRef.current.trim();
    const translated = interimTranslatedRef.current.trim();
    interimOriginalRef.current = "";
    interimTranslatedRef.current = "";
    setInterimOriginalText("");
    setInterimTranslatedText("");

    if (!original && !translated) return;

    const newEntry: Entry = {
      id: Math.random().toString(36).substring(7),
      originalText: original || "...",
      translatedText: translated || "...",
      speakerId: currentSpeakerRef.current,
    };
    setEntries((prev) => [...prev, newEntry]);
    lastFinalizeTimeRef.current = Date.now();

    if (sessionIdRef.current) {
      fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          originalText: original || "...",
          translatedText: translated || "...",
        }),
      }).catch((err) => console.error("Failed to save entry:", err));
    }
  }, []);

  const resetRealtimeSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (interimOriginalRef.current.trim() || interimTranslatedRef.current.trim()) {
        finalizeRealtimeSentence();
      }
    }, 1800);
  }, [finalizeRealtimeSentence]);

  const cleanupRealtimeConnection = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    try { pcRef.current?.close(); } catch {}
    pcRef.current = null;
    try { dataChannelRef.current?.close(); } catch {}
    dataChannelRef.current = null;
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
      remoteAudioRef.current = null;
    }
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    streamRef.current = null;
    try { tabStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    tabStreamRef.current = null;
    try { mixCtxRef.current?.close(); } catch {}
    mixCtxRef.current = null;
    if (interimOriginalRef.current.trim() || interimTranslatedRef.current.trim()) {
      finalizeRealtimeSentence();
    }
  }, [finalizeRealtimeSentence]);

  // ── VAD: Voice Activity Detection ──
  const startVAD = useCallback((stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.3;
    source.connect(analyser);
    audioContextRef.current = audioContext;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let isSilent = true;
    let voiceStartTime = 0;
    const SILENCE_THRESHOLD = 8;
    const SILENCE_DURATION = 1200;
    const MAX_CHUNK_DURATION = 4000;

    const flushRecorder = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };

    const check = () => {
      if (!isRecordingRef.current) return;
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      const avg = sum / dataArray.length;

      if (avg > SILENCE_THRESHOLD) {
        if (isSilent) {
          isSilent = false;
          hadVoiceRef.current = true;
          voiceStartTime = Date.now();
          setInterimText("🎙️ Listening...");
        }
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        if (Date.now() - voiceStartTime >= MAX_CHUNK_DURATION && !processingRef.current) {
          flushRecorder();
          voiceStartTime = Date.now();
        }
      } else {
        if (!isSilent && !silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            isSilent = true;
            silenceTimerRef.current = null;
            if (!processingRef.current) flushRecorder();
          }, SILENCE_DURATION);
        }
      }
      vadFrameRef.current = requestAnimationFrame(check);
    };
    vadFrameRef.current = requestAnimationFrame(check);
  }, []);

  // ── Audio helpers ──
  const sendAudioForTranslation = useCallback(async (audioBlob: Blob) => {
    if (audioBlob.size < 500) return;
    processingRef.current = true;
    setIsProcessing(true);
    setInterimText("🎧 Processing...");

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      formData.append("sourceLang", sourceLangRef.current);
      formData.append("targetLang", targetLangRef.current);
      formData.append("model", modelNameRef.current);
      if (sessionIdRef.current) formData.append("sessionId", sessionIdRef.current);

      const res = await fetch("/api/listen", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.text && data.translatedText) {
        setInterimText("");
        setEntries((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            originalText: data.text,
            translatedText: data.translatedText,
            totalMs: data.totalMs,
            sttMs: data.sttMs,
            translateMs: data.translateMs,
            speakerId: currentSpeakerRef.current,
          },
        ]);
      } else {
        setInterimText("");
      }
    } catch (err) {
      console.error("Listen failed:", err);
      setInterimText("");
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
      if (isRecordingRef.current && streamRef.current) {
        startNewRecorder(streamRef.current);
      }
    }
  }, []);

  const sendAudioRef = useRef(sendAudioForTranslation);
  sendAudioRef.current = sendAudioForTranslation;

  const startNewRecorder = useCallback((stream: MediaStream) => {
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
    mediaRecorderRef.current = recorder;
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      if (chunks.length > 0 && hadVoiceRef.current) {
        hadVoiceRef.current = false;
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        sendAudioRef.current(audioBlob);
      } else {
        if (isRecordingRef.current && streamRef.current) {
          startNewRecorder(streamRef.current);
        }
      }
    };

    recorder.start();
  }, []);

  // ── Start engines ──
  const startWebSpeech = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Your browser doesn't support Web Speech API. Switch to Whisper.");
      return false;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    const langMap: Record<string, string> = { en: "en-US", vi: "vi-VN", ja: "ja-JP" };
    recognition.lang = langMap[sourceLang] || "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          if (transcript.trim()) {
            setInterimText("");
            fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: transcript.trim(),
                sourceLang: sourceLangRef.current,
                targetLang: targetLangRef.current,
                modelName: modelNameRef.current,
                sessionId: sessionIdRef.current,
              }),
            })
              .then((r) => r.json())
              .then((data) => {
                if (data.translatedText) {
                  setEntries((prev) => [
                    ...prev,
                    {
                      id: Math.random().toString(36).substring(7),
                      originalText: transcript.trim(),
                      translatedText: data.translatedText,
                      totalMs: data.latencyMs,
                      speakerId: currentSpeakerRef.current,
                    },
                  ]);
                }
              })
              .catch(console.error);
          }
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);
    };

    recognition.onerror = (event: any) => console.error("Speech error", event.error);
    recognition.onend = () => {
      if (isRecordingRef.current) {
        try { recognition.start(); } catch {}
      }
    };
    recognition.start();
    return true;
  }, [sourceLang]);

  const startOpenAIRealtime = useCallback(async (stream: MediaStream) => {
    try {
      const tokenRes = await fetch("/api/realtime-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLang: targetLangRef.current }),
      });
      const tokenData = await tokenRes.json();
      if (tokenData.error) throw new Error(tokenData.error);

      const clientSecret = tokenData.value || tokenData.client_secret?.value || tokenData.client_secret;
      if (!clientSecret) throw new Error("Failed to get client secret");

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      let audioEl = remoteAudioRef.current;
      if (!audioEl) {
        audioEl = document.createElement("audio");
        audioEl.autoplay = true;
        remoteAudioRef.current = audioEl;
      }
      audioEl.muted = !voiceEnabled;

      pc.ontrack = (e) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = e.streams[0];
        }
      };

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;

      dc.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "session.input_transcript.delta") {
            const delta = data.delta || "";
            if (interimOriginalRef.current === "" && lastFinalizeTimeRef.current > 0) {
              const gap = Date.now() - lastFinalizeTimeRef.current;
              if (gap > 3000) {
                const newId = speakerCountRef.current + 1;
                speakerCountRef.current = newId;
                currentSpeakerRef.current = newId;
                setCurrentSpeaker(newId);
                setSpeakers((prev) => {
                  if (prev.find((s) => s.id === newId)) return prev;
                  return [
                    ...prev,
                    {
                      id: newId,
                      name: `Person ${newId}`,
                      color: SPEAKER_COLORS[(newId - 1) % SPEAKER_COLORS.length],
                    },
                  ];
                });
              }
            }
            interimOriginalRef.current += delta;
            setInterimOriginalText(interimOriginalRef.current);
            resetRealtimeSilenceTimer();
          } else if (data.type === "session.output_transcript.delta") {
            const delta = data.delta || "";
            interimTranslatedRef.current += delta;
            setInterimTranslatedText(interimTranslatedRef.current);
            resetRealtimeSilenceTimer();
            const text = interimTranslatedRef.current.trim();
            if (/[.?!。？！]$/.test(text)) {
              finalizeRealtimeSentence();
            }
          }
        } catch (err) {
          console.error("Error processing message:", err);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch("https://api.openai.com/v1/realtime/translations/calls", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${clientSecret}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });

      if (!sdpResponse.ok) {
        const errText = await sdpResponse.text();
        throw new Error(`OpenAI WebRTC Connection failed: ${errText}`);
      }

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
    } catch (err: any) {
      console.error("OpenAI Realtime startup failed", err);
      alert("Realtime Connection failed: " + err.message);
      cleanupRealtimeConnection();
      return false;
    }
    return true;
  }, [voiceEnabled, resetRealtimeSilenceTimer, finalizeRealtimeSentence, cleanupRealtimeConnection]);

  const startDeepgram = useCallback((stream: MediaStream) => {
    const languageMap: Record<string, string> = { en: "en", vi: "vi", ja: "ja" };
    const lang = languageMap[sourceLang] || "en";

    const socket = new WebSocket(
      `wss://api.deepgram.com/v1/listen?model=${deepgramModel}&language=${lang}&interim_results=true&smart_format=true`,
      ["token", deepgramApiKey],
    );
    deepgramSocketRef.current = socket;

    socket.onopen = () => {
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0 && socket.readyState === 1) {
          socket.send(e.data);
        }
      };
      recorder.start(250);
    };

    socket.onmessage = (message) => {
      const received = JSON.parse(message.data);
      if (received.channel?.alternatives?.[0]) {
        const transcript = received.channel.alternatives[0].transcript;
        if (transcript) {
          if (received.is_final) {
            setInterimText("");
            const currentSpeakerId = currentSpeakerRef.current;
            fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: transcript.trim(),
                sourceLang: sourceLangRef.current,
                targetLang: targetLangRef.current,
                modelName: modelNameRef.current,
                sessionId: sessionIdRef.current,
                speakerId: currentSpeakerId,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.translatedText) {
                  setEntries((prev) => [
                    ...prev,
                    {
                      id: Math.random().toString(36).substring(7),
                      originalText: transcript.trim(),
                      translatedText: data.translatedText,
                      translateMs: data.latencyMs,
                      speakerId: currentSpeakerId,
                    },
                  ]);
                }
              })
              .catch(console.error);
          } else {
            setInterimText(transcript);
          }
        }
      }
    };

    socket.onerror = () => {
      alert("Deepgram WebSocket Error. Please check your API key.");
      setIsRecording(false);
      isRecordingRef.current = false;
    };
  }, [sourceLang, deepgramModel, deepgramApiKey]);

  // ── Start / Stop ──
  const startRecording = useCallback(async () => {
    if (sttEngine === "deepgram" && !deepgramApiKey) {
      alert("Deepgram API Key is missing. Please configure it in Settings.");
      return;
    }

    // Web Speech doesn't need MediaStream
    if (sttEngine === "web-speech") {
      const ok = startWebSpeech();
      if (ok) {
        isRecordingRef.current = true;
        setIsRecording(true);
      }
      return;
    }

    // Acquire stream
    let stream: MediaStream;
    try {
      if (audioSource === "tab") {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
        displayStream.getVideoTracks().forEach((t) => t.stop());
        if (displayStream.getAudioTracks().length === 0) {
          throw new Error("No audio track captured. Make sure to select a tab with audio.");
        }
        stream = new MediaStream(displayStream.getAudioTracks());
        tabStreamRef.current = stream;
      } else if (audioSource === "both") {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
        displayStream.getVideoTracks().forEach((t) => t.stop());
        if (displayStream.getAudioTracks().length === 0) {
          micStream.getTracks().forEach((t) => t.stop());
          throw new Error("No audio track captured. Make sure to select a tab with audio.");
        }
        const mixCtx = new AudioContext();
        mixCtxRef.current = mixCtx;
        const dest = mixCtx.createMediaStreamDestination();
        mixCtx.createMediaStreamSource(micStream).connect(dest);
        mixCtx.createMediaStreamSource(new MediaStream(displayStream.getAudioTracks())).connect(dest);
        stream = dest.stream;
        streamRef.current = micStream;
        tabStreamRef.current = new MediaStream(displayStream.getAudioTracks());
      } else {
        const permResult = await navigator.permissions.query({ name: "microphone" as PermissionName });
        if (permResult.state === "denied") {
          alert("Microphone permission is blocked. Please allow microphone access in your browser settings.");
          return;
        }
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
      }
    } catch (err: any) {
      console.error("Stream acquisition failed", err);
      if (err.name === "NotAllowedError") {
        alert("Media access denied. Please allow permission and try again.");
      } else if (err.name === "NotFoundError") {
        alert("No device found. Please connect a microphone or select a valid tab.");
      } else {
        alert("Could not access media: " + err.message);
      }
      return;
    }

    if (audioSource !== "both") streamRef.current = stream;
    isRecordingRef.current = true;
    setIsRecording(true);

    if (sttEngine === "openai-realtime") {
      const ok = await startOpenAIRealtime(stream);
      if (!ok) {
        setIsRecording(false);
        isRecordingRef.current = false;
      }
    } else if (sttEngine === "deepgram") {
      startDeepgram(stream);
    } else {
      // Whisper + VAD
      startNewRecorder(stream);
      startVAD(stream);
    }
  }, [sttEngine, audioSource, deepgramApiKey, startWebSpeech, startOpenAIRealtime, startDeepgram, startNewRecorder, startVAD]);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setInterimText("");

    if (sttEngine === "openai-realtime") {
      cleanupRealtimeConnection();
    } else if (sttEngine === "deepgram") {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (deepgramSocketRef.current) {
        deepgramSocketRef.current.send(JSON.stringify({ type: "CloseStream" }));
        setTimeout(() => {
          deepgramSocketRef.current?.close();
          deepgramSocketRef.current = null;
        }, 500);
      }
      try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
      streamRef.current = null;
    } else if (sttEngine === "web-speech") {
      recognitionRef.current?.stop();
    } else {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
      streamRef.current = null;
      audioContextRef.current?.close();
      audioContextRef.current = null;
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (vadFrameRef.current) {
        cancelAnimationFrame(vadFrameRef.current);
        vadFrameRef.current = null;
      }
    }
  }, [sttEngine, cleanupRealtimeConnection]);

  const clearTranscript = useCallback(() => {
    setEntries([]);
    setInterimText("");
    setInterimOriginalText("");
    setInterimTranslatedText("");
    interimOriginalRef.current = "";
    interimTranslatedRef.current = "";
    setSpeakers([{ id: 1, name: "Person 1", color: SPEAKER_COLORS[0] }]);
    setCurrentSpeaker(1);
    currentSpeakerRef.current = 1;
    speakerCountRef.current = 1;
    lastFinalizeTimeRef.current = 0;
  }, []);

  const copyTranscript = useCallback(() => {
    const text = entries
      .map((e) => `[${speakers.find((s) => s.id === e.speakerId)?.name || "Unknown"}]\n${e.originalText}\n${e.translatedText}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
  }, [entries, speakers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { cleanupRealtimeConnection(); };
  }, [cleanupRealtimeConnection]);

  return {
    isRecording,
    interimText,
    entries,
    isProcessing,
    interimOriginalText,
    interimTranslatedText,
    speakers,
    currentSpeaker,
    setCurrentSpeaker,
    startRecording,
    stopRecording,
    clearTranscript,
    copyTranscript,
  };
}
