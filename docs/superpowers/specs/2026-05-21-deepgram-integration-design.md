# Deepgram Live Streaming Integration Design

## Purpose
Integrate Deepgram's Live Streaming Audio (WebSocket API) as a new Speech-to-Text (STT) option alongside the existing Whisper and Web Speech API engines. This will provide low-latency, real-time transcription.

## Architecture & Data Flow
- **Direct WebSocket Connection**: The browser will establish a direct `wss://` connection to Deepgram's servers.
- **Key Distribution**: The Next.js backend will expose the authenticated user's `DEEPGRAM_API_KEY` to the frontend via the `/api/settings` endpoint. Since the application is for authenticated admin use only, this is an acceptable security model.
- **Audio Capture**: The frontend will capture microphone (and/or tab) audio, slice it into chunks (e.g., using `MediaRecorder` with a timeslice like 250ms), and send these chunks over the WebSocket.
- **Translation Pipeline**: Deepgram will return both interim and final transcripts.
  - Interim transcripts will be displayed immediately to the user.
  - Once Deepgram issues a `is_final` or `speech_final` transcript, the text will be sent to the existing `/api/translate` endpoint to be translated into the target language.

## Components to Update

### 1. Database & Prisma
- Modify `prisma/schema.prisma` to add `deepgramApiKey String?` to the `Setting` model.
- Run database migrations (`npx prisma migrate dev`).

### 2. Backend APIs
- Update `app/api/settings/route.ts` to include `deepgramApiKey` in both `GET` and `POST` handlers.

### 3. Frontend UI (`app/page.tsx`)
- **Settings Modal**: Add a new input field for the Deepgram API Key.
- **STT Engine Selector**: Add a new option: `<option value="deepgram">Deepgram Live</option>`.
- **Model Selector**: Add a dropdown to select the Deepgram model when Deepgram is active (e.g., `nova-2`, `nova-2-general`). Wait, the user specifically mentioned "cho chọn model trong màn streaming" (allow selecting model in streaming screen). We'll add a specific Deepgram Model dropdown (or reuse the existing Model dropdown if applicable, but STT models are distinct from Translation models). Let's add an STT Model selector.
- **Streaming Logic**: Implement the WebSocket connection flow:
  - On `startRecording`: Open `WebSocket` to Deepgram, attach `onmessage` handlers to process `is_final` transcripts.
  - Setup `MediaRecorder` with `timeslice` to continuously push audio binary data to the WebSocket.
  - On `stopRecording`: Close the `WebSocket` and `MediaRecorder`.

## Error Handling
- If `DEEPGRAM_API_KEY` is missing when starting recording, prompt the user to configure it in Settings.
- Handle WebSocket disconnects and errors gracefully by stopping the recording and showing an alert.

## Testing Plan
- Test creating and saving the Deepgram API Key in Settings.
- Verify WebSocket connection successfully authenticates.
- Speak into the mic and verify interim transcripts appear in real-time.
- Verify final transcripts trigger the translation API and display the translated text correctly.
