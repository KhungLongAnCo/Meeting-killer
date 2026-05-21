import fs from 'fs';

let content = fs.readFileSync('app/page.tsx', 'utf-8');

const oldStartRecording = `  const startRecording = async () => {
    if (sttEngine === 'openai-realtime') {
      try {
        let stream: MediaStream;

        if (audioSource === 'tab') {
          const displayStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
          // Stop video tracks — we only need audio
          displayStream.getVideoTracks().forEach(t => t.stop());
          if (displayStream.getAudioTracks().length === 0) {
            throw new Error('No audio track captured. Make sure to select a tab with audio.');
          }
          stream = new MediaStream(displayStream.getAudioTracks());
          tabStreamRef.current = stream;
        } else if (audioSource === 'both') {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
          });
          const displayStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
          displayStream.getVideoTracks().forEach(t => t.stop());
          if (displayStream.getAudioTracks().length === 0) {
            micStream.getTracks().forEach(t => t.stop());
            throw new Error('No audio track captured. Make sure to select a tab with audio.');
          }
          // Mix mic + tab audio
          const mixCtx = new AudioContext();
          mixCtxRef.current = mixCtx;
          const dest = mixCtx.createMediaStreamDestination();
          mixCtx.createMediaStreamSource(micStream).connect(dest);
          mixCtx.createMediaStreamSource(new MediaStream(displayStream.getAudioTracks())).connect(dest);
          stream = dest.stream;
          streamRef.current = micStream;
          tabStreamRef.current = new MediaStream(displayStream.getAudioTracks());
        } else {
          const permResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (permResult.state === 'denied') {
            alert('🎤 Microphone permission is blocked. Please allow microphone access in your browser settings.');
            return;
          }
          stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
          });
        }

        if (audioSource !== 'both') {
          streamRef.current = stream;
        }
        isRecordingRef.current = true;
        setIsRecording(true);
        console.log(\`[Realtime] Got stream (source: \${audioSource}), starting WebRTC connection...\`);

        const tokenRes = await fetch('/api/realtime-token', {`;

const newCommonStart = `  const startRecording = async () => {
    // 1. Web Speech doesn't need MediaStream
    if (sttEngine === 'web-speech') {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Your browser doesn't support Web Speech API. Switch to Whisper.");
        return;
      }
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      const langMap: Record<string, string> = { 'en': 'en-US', 'vi': 'vi-VN', 'ja': 'ja-JP' };
      recognitionRef.current.lang = langMap[sourceLang] || 'en-US';
      recognitionRef.current.interimResults = true;
      recognitionRef.current.continuous = true;
      recognitionRef.current.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            if (transcript.trim()) {
              setInterimText('');
              fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: transcript.trim(),
                  sourceLang: sourceLangRef.current,
                  targetLang: targetLangRef.current,
                  modelName: modelNameRef.current,
                  sessionId: sessionIdRef.current,
                })
              }).then(r => r.json()).then(data => {
                if (data.translatedText) {
                  setEntries(prev => [...prev, {
                    id: Math.random().toString(36).substring(7),
                    originalText: transcript.trim(),
                    translatedText: data.translatedText,
                    totalMs: data.latencyMs,
                    speakerId: currentSpeakerRef.current,
                  }]);
                }
              }).catch(console.error);
            }
          } else {
            interim += transcript;
          }
        }
        setInterimText(interim);
      };
      recognitionRef.current.onerror = (event: any) => console.error("Speech error", event.error);
      recognitionRef.current.onend = () => {
        if (isRecordingRef.current) {
          try { recognitionRef.current?.start(); } catch(e) {}
        }
      };
      recognitionRef.current.start();
      setIsRecording(true);
      return;
    }

    if (sttEngine === 'deepgram' && !deepgramApiKey) {
      alert("Deepgram API Key is missing. Please configure it in Settings.");
      return;
    }

    // 2. Common stream acquisition for all other engines
    let stream: MediaStream;
    try {
      if (audioSource === 'tab') {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
        displayStream.getVideoTracks().forEach(t => t.stop());
        if (displayStream.getAudioTracks().length === 0) {
          throw new Error('No audio track captured. Make sure to select a tab with audio.');
        }
        stream = new MediaStream(displayStream.getAudioTracks());
        tabStreamRef.current = stream;
      } else if (audioSource === 'both') {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
        displayStream.getVideoTracks().forEach(t => t.stop());
        if (displayStream.getAudioTracks().length === 0) {
          micStream.getTracks().forEach(t => t.stop());
          throw new Error('No audio track captured. Make sure to select a tab with audio.');
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
        const permResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permResult.state === 'denied') {
          alert('🎤 Microphone permission is blocked. Please allow microphone access in your browser settings.');
          return;
        }
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
      }
    } catch (err: any) {
      console.error("Stream acquisition failed", err);
      if (err.name === 'NotAllowedError') {
        alert('🎤 Media access denied. Please allow permission and try again.');
      } else if (err.name === 'NotFoundError') {
        alert('🎤 No device found. Please connect a microphone or select a valid tab.');
      } else {
        alert('🎤 Could not access media: ' + err.message);
      }
      return;
    }

    if (audioSource !== 'both') {
      streamRef.current = stream;
    }
    isRecordingRef.current = true;
    setIsRecording(true);
    console.log(\`[STT] Got stream (source: \${audioSource}), starting engine: \${sttEngine}\`);

    if (sttEngine === 'openai-realtime') {
      try {
        const tokenRes = await fetch('/api/realtime-token', {`;

content = content.replace(oldStartRecording, newCommonStart);

// Now patch Deepgram block
const oldDeepgram = `    } else if (sttEngine === 'deepgram') {
      if (!deepgramApiKey) {
        alert("Deepgram API Key is missing. Please configure it in Settings.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
        streamRef.current = stream;
        isRecordingRef.current = true;
        setIsRecording(true);

        const languageMap: Record<string, string> = { 'en': 'en', 'vi': 'vi', 'ja': 'ja' };`;
const newDeepgram = `    } else if (sttEngine === 'deepgram') {
      try {
        const languageMap: Record<string, string> = { 'en': 'en', 'vi': 'vi', 'ja': 'ja' };`;
content = content.replace(oldDeepgram, newDeepgram);

// Remove the old web-speech block entirely since we moved it to the top.
// Be careful to match it accurately.
const startWebSpeech = `    } else if (sttEngine === 'web-speech') {`;
const endWebSpeech = `      recognitionRef.current.start();
      setIsRecording(true);

    } else {
      // ── Whisper + VAD ──`;

const idxWebSpeechStart = content.indexOf(startWebSpeech);
const idxWebSpeechEnd = content.indexOf(endWebSpeech);

if (idxWebSpeechStart !== -1 && idxWebSpeechEnd !== -1) {
  content = content.substring(0, idxWebSpeechStart) + `    } else {
      // ── Whisper + VAD ──` + content.substring(idxWebSpeechEnd + endWebSpeech.length);
}

// Now patch Whisper block
const oldWhisper = `      // ── Whisper + VAD ──
      try {
        // Check permission first
        const permResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permResult.state === 'denied') {
          alert('🎤 Microphone permission is blocked. Please allow microphone access in your browser settings.');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
        streamRef.current = stream;
        isRecordingRef.current = true;
        setIsRecording(true);
        console.log('[Mic] Got stream, starting recorder + VAD');

        // Start first recorder`;

const newWhisper = `      // ── Whisper + VAD ──
      try {
        console.log('[Whisper] Got stream, starting recorder + VAD');
        
        // Start first recorder`;

content = content.replace(oldWhisper, newWhisper);

fs.writeFileSync('app/page.tsx', content);
console.log('Patched page.tsx successfully!');
