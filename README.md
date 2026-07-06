# Cognia

An India-first, **English-speaking practice buddy** for students. A Duolingo-style
mascot talks with the student by **voice**: the app speaks (TTS), listens to the
student (STT), and shows everything as on-screen **captions**. It personalizes by
the student's class, ability level, and interests. English-first, architected to
scale to Hindi, Tamil, Telugu and more.

Powered by **Sarvam AI** (Saaras STT · Sarvam-M LLM · Bulbul TTS) — Indian-language
tuned, INR-billed, India data residency.

> **Status:** Phase 0 scaffold + **Phase 1** (guided lessons, scenario-aware tutor,
> streaks/XP). See the build roadmap at the bottom.

---

## Architecture

```
[Expo app]  --audio/text-->  [server (Hono)]  -->  Sarvam STT  (speech -> text)
                                              -->  Sarvam LLM  (tutor reply)
                                              -->  Sarvam TTS  (text -> speech)
[Expo app]  <--text+audio--  [server]
```

The **Sarvam API key never ships in the app** — only the backend holds it.

```
src/
  app/            expo-router screens: index, onboarding, home, lessons, conversation, settings
  components/     Mascot, Transcript, MicButton (+ template themed-text/view)
  lib/            api, audio, store (zustand+persist), i18n, config, types, ui
server/
  src/            index.ts, routes/converse.ts, sarvam.ts, prompt.ts, scenarios.ts, types.ts
```

Backend endpoints: `GET /api/health`, `GET /api/scenarios` (lesson catalogue),
`POST /api/converse` (audio/text/opening turn, optional `scenarioId`),
`DELETE /api/converse/:sessionId`.

---

## Prerequisites

- Node 20+ and npm
- A **Sarvam AI** API key — https://dashboard.sarvam.ai
- For the app: the **Expo Go** app won't work (we use native audio modules).
  Use a **development build** on a real device or an emulator/simulator.

---

## 1. Run the backend

```bash
cd server
cp .env.example .env          # then paste your SARVAM_API_KEY into .env
npm install
npm run dev                   # http://localhost:3000
```

Check it:

```bash
curl http://localhost:3000/api/health      # -> {"ok":true,...}
```

Cost guardrails live in `.env` (`MAX_LLM_OUTPUT_TOKENS`, `MAX_HISTORY_TURNS`).

## 2. Run the app

```bash
# from the project root
npm install

# point the app at your backend (only needed on a physical device)
cp .env.example .env          # set EXPO_PUBLIC_API_URL to your computer's LAN IP

# build & run a dev build (installs the native audio module)
npx expo run:android          # or: npx expo run:ios
```

> `npx expo start` alone is **not** enough on a physical device because
> `expo-audio` needs native code. Use `expo run:*` (or `eas build --profile development`).

The app's backend URL is resolved in `src/lib/config.ts`:
iOS simulator → `localhost`, Android emulator → `10.0.2.2`, physical device →
`EXPO_PUBLIC_API_URL`.

---

## How it works

- **Onboarding** collects name, class (optional), ability level, and interests →
  stored locally (Zustand + AsyncStorage).
- **Conversation**: hold the mic to record → audio goes to `/api/converse` →
  `STT → LLM → TTS` → the reply plays and both lines appear in the transcript.
  A **text fallback** is available for noisy / low-bandwidth situations.
- **Personalization** lives in `server/src/prompt.ts` — level, grade and interests
  shape the tutor's system prompt (vocabulary, sentence length, themes, gentle
  correction). Child-safety instructions are baked in.
- **Lessons** (`server/src/scenarios.ts`) are guided scenarios (Saying Hello, At
  the Market, Tell a Story…) tagged by ability level. Picking one starts a fresh
  conversation where the tutor **speaks first** (an "opening" turn) and stays on
  the lesson goal. A **Finish lesson** button marks it complete.
- **Progress**: each spoken turn earns XP, finishing a lesson earns a bonus, and a
  daily **streak** is tracked locally (`src/lib/store.ts`). Shown on Home.

---

## Scaling to other languages (already wired)

- UI strings: add a locale block in `src/lib/i18n.ts`.
- Voice: Sarvam STT (22 langs) / TTS (11 langs) are language-parameterized — set
  `Profile.language` (e.g. `hi-IN`) and it flows through STT, LLM and TTS.

---

## Verify the change

1. `curl localhost:3000/api/health` → `{ "ok": true }`.
2. With `SARVAM_API_KEY` set, `POST /api/converse` (audio or `text=`) returns
   `userText`, `replyText`, and a playable `audioBase64`.
3. In the app: onboard → Conversation → hold mic, say "Hello, how are you?" →
   transcript shows both lines, mascot cycles listening → thinking → speaking,
   reply audio plays.
4. Turn on airplane mode mid-request → graceful error + text fallback still works.
5. Change ability level beginner → advanced → reply complexity changes.

Typecheck both projects:

```bash
npx tsc --noEmit            # app
cd server && npx tsc --noEmit
```

---

## Roadmap

- **Phase 0 (done):** runnable skeleton, push-to-talk voice loop.
- **Phase 1 (done):** scenario-aware tutor prompts, guided lessons (tutor opens
  the conversation), streaks/XP/lesson completion.
- **Phase 2 (in progress):** WebSocket **streaming** voice — live captions +
  lower-latency replies (see below). Still to come: Supabase auth/profiles/
  progress; Rive mascot; echo-cancelled barge-in.
- **Phase 3:** Hindi + regional languages, pronunciation scoring, store release.

---

## Real-time streaming voice (Phase 2, behind a flag)

A second voice path streams mic audio live instead of record-then-upload:

```
[app] --PCM (WebSocket)--> [server /api/stream] --> Sarvam streaming STT
   ^                                                       |
   |  live captions + reply text + reply audio  <----------+  (LLM + TTS)
```

- **On device:** `@siteed/audio-studio` captures 16 kHz mono PCM16 and forwards
  base64 chunks over a WebSocket to our server (`src/lib/streaming.ts`).
- **On server:** `server/src/stream.ts` bridges each utterance to Sarvam's STT
  WebSocket (`server/src/sarvam-stream.ts`), relays live transcript segments back
  as captions, then runs the **same** `runTutorTurn()` (LLM + TTS) as the REST
  path — so history stays consistent whether a turn came in by stream, upload, or
  the text box.
- **Enable it:** set `EXPO_PUBLIC_STREAMING=1` (app `.env`) and rebuild the dev
  client (native module — not Expo Go). Off by default; the turn-based path stays
  the stable default.

**Needs on-device + live-key validation** (built to spec, not yet run against a
real Sarvam key):
1. Sarvam streaming STT emits per-utterance (VAD-driven) segments, not word-by-
   word partials — confirm caption cadence feels live enough. (`sarvam-stream.ts`)
2. The per-chunk `audio.encoding` value for raw PCM input is unverified; override
   `SARVAM_STT_AUDIO_ENCODING` if transcripts come back empty/garbled.
3. **Barge-in** (interrupt the tutor mid-reply) needs acoustic echo cancellation
   so the mic doesn't hear the tutor's own audio. The current push-to-talk model
   sidesteps this (mic is closed while the tutor speaks); true full-duplex
   barge-in is a follow-up (validate `@mykin-ai/expo-audio-stream`'s AEC path or
   native config on a dev build first).
4. Streaming **TTS** exists on Sarvam too; this increment streams STT and plays
   the reply as one batch WAV. Chunked TTS playback is the next latency win.

## Notes & compliance

- Sarvam endpoint shapes in `server/src/sarvam.ts` are the single place to update
  if Sarvam changes a field or model name (`SARVAM_*` env vars override model ids).
- Users may be **minors** — before launch, review India's **DPDP Act 2023**
  (children's data / consent). The app collects only a first name by default.
