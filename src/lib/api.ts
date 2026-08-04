import { API_URL } from "./config";
import type { ConverseResponse, Profile, Scenario, TopicRef } from "./types";

// Talks to our backend (never to Sarvam directly — the key stays server-side).

export async function health(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getScenarios(): Promise<Scenario[]> {
  const res = await fetch(`${API_URL}/api/scenarios`);
  if (!res.ok) throw new Error(`Could not load lessons (${res.status})`);
  return (await res.json()) as Scenario[];
}

interface ConverseArgs {
  sessionId: string;
  profile: Profile;
  audioUri?: string; // local file:// from the recorder
  text?: string; // text fallback (noisy / low bandwidth)
  scenarioId?: string; // active lesson, if any
  topic?: TopicRef; // syllabus topic being practised, if any
  opening?: boolean; // ask the tutor to speak first (no student input)
}

export async function converse({
  sessionId,
  profile,
  audioUri,
  text,
  scenarioId,
  topic,
  opening,
}: ConverseArgs): Promise<ConverseResponse> {
  const form = new FormData();
  form.append("sessionId", sessionId);
  form.append("profile", JSON.stringify(profile));
  if (scenarioId) form.append("scenarioId", scenarioId);
  if (topic) form.append("topic", JSON.stringify(topic));

  if (opening) {
    form.append("opening", "true");
  } else if (text && text.trim()) {
    form.append("text", text.trim());
  } else if (audioUri) {
    // React Native's FormData accepts this { uri, name, type } shape for files.
    form.append("audio", {
      uri: audioUri,
      name: "speech.m4a",
      type: "audio/m4a",
    } as unknown as Blob);
  } else {
    throw new Error("converse() needs either audioUri, text, or opening");
  }

  const res = await fetch(`${API_URL}/api/converse`, {
    method: "POST",
    body: form,
    // NOTE: do not set Content-Type — RN sets the multipart boundary for us.
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return (await res.json()) as ConverseResponse;
}

export async function clearServerHistory(sessionId: string): Promise<void> {
  try {
    await fetch(`${API_URL}/api/converse/${sessionId}`, { method: "DELETE" });
  } catch {
    // best effort — the new sessionId already isolates the old history
  }
}
