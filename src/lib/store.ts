import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Message, Profile, Progress } from "./types";

function newSessionId(): string {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function dayStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

const DEFAULT_PROFILE: Profile = {
  name: "",
  level: "beginner",
  interests: [],
  language: "en-IN",
};

const DEFAULT_PROGRESS: Progress = {
  streak: 0,
  lastActiveDate: null,
  xp: 0,
  completedScenarios: [],
};

interface AppState {
  profile: Profile;
  onboarded: boolean;
  sessionId: string;
  messages: Message[];
  progress: Progress;
  hydrated: boolean; // persist finished loading from disk

  setProfile: (p: Profile) => void;
  completeOnboarding: (p: Profile) => void;
  addMessage: (m: Message) => void;
  resetConversation: () => string; // returns the old sessionId (to clear server-side)
  recordActivity: (xpGain: number) => void; // updates streak + xp for today
  completeScenario: (id: string) => void;
  resetAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      onboarded: false,
      sessionId: newSessionId(),
      messages: [],
      progress: DEFAULT_PROGRESS,
      hydrated: false,

      setProfile: (profile) => set({ profile }),
      completeOnboarding: (profile) => set({ profile, onboarded: true }),
      addMessage: (m) => set({ messages: [...get().messages, m] }),
      resetConversation: () => {
        const old = get().sessionId;
        set({ messages: [], sessionId: newSessionId() });
        return old;
      },
      recordActivity: (xpGain) => {
        const p = get().progress;
        const today = dayStr(new Date());
        let streak = p.streak;
        if (p.lastActiveDate !== today) {
          const yesterday = dayStr(new Date(Date.now() - 86_400_000));
          streak = p.lastActiveDate === yesterday ? p.streak + 1 : 1;
        }
        set({
          progress: {
            ...p,
            streak,
            lastActiveDate: today,
            xp: p.xp + xpGain,
          },
        });
      },
      completeScenario: (id) => {
        const p = get().progress;
        if (p.completedScenarios.includes(id)) return;
        set({
          progress: {
            ...p,
            completedScenarios: [...p.completedScenarios, id],
          },
        });
      },
      resetAll: () =>
        set({
          profile: DEFAULT_PROFILE,
          onboarded: false,
          messages: [],
          sessionId: newSessionId(),
          progress: DEFAULT_PROGRESS,
        }),
    }),
    {
      name: "bolobuddy-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        profile: s.profile,
        onboarded: s.onboarded,
        sessionId: s.sessionId,
        progress: s.progress,
      }),
      // Runs after persisted state is loaded from AsyncStorage.
      onRehydrateStorage: () => () => {
        useAppStore.setState({ hydrated: true });
      },
    },
  ),
);
