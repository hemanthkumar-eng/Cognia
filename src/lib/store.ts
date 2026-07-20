import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Message, Profile, Progress, Subscription } from "./types";

function newSessionId(): string {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// Local date key (YYYY-MM-DD) used for streaks and the activity heatmap. Exported
// so the Progress screen keys into `history` with exactly the same format.
export function dayStr(d: Date): string {
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
  completedTopics: [],
  bestStreak: 0,
  history: {},
};

interface AppState {
  profile: Profile;
  authed: boolean; // signed in (placeholder until Supabase auth lands)
  subscription: Subscription | null; // null until a plan is chosen
  onboarded: boolean;
  sessionId: string;
  messages: Message[];
  progress: Progress;
  hydrated: boolean; // persist finished loading from disk

  setProfile: (p: Profile) => void;
  completeAuth: () => void;
  logout: () => void; // sign out but keep profile/subscription for re-login
  setSubscription: (s: Subscription) => void;
  completeOnboarding: (p: Profile) => void;
  addMessage: (m: Message) => void;
  resetConversation: () => string; // returns the old sessionId (to clear server-side)
  recordActivity: (xpGain: number) => void; // updates streak + xp for today
  completeScenario: (id: string) => void;
  completeTopic: (id: string) => void; // marks a syllabus topic finished
  resetAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      authed: false,
      subscription: null,
      onboarded: false,
      sessionId: newSessionId(),
      messages: [],
      progress: DEFAULT_PROGRESS,
      hydrated: false,

      setProfile: (profile) => set({ profile }),
      completeAuth: () => set({ authed: true }),
      logout: () => set({ authed: false }),
      setSubscription: (subscription) => set({ subscription }),
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
        const history = { ...(p.history ?? {}) };
        history[today] = (history[today] ?? 0) + xpGain;
        set({
          progress: {
            ...p,
            streak,
            bestStreak: Math.max(p.bestStreak ?? 0, streak),
            lastActiveDate: today,
            xp: p.xp + xpGain,
            history,
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
      completeTopic: (id) => {
        const p = get().progress;
        const done = p.completedTopics ?? [];
        if (done.includes(id)) return;
        set({ progress: { ...p, completedTopics: [...done, id] } });
      },
      resetAll: () =>
        set({
          profile: DEFAULT_PROFILE,
          authed: false,
          subscription: null,
          onboarded: false,
          messages: [],
          sessionId: newSessionId(),
          progress: DEFAULT_PROGRESS,
        }),
    }),
    {
      name: "cognia-store",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // v1 added completedTopics/bestStreak/history to Progress. Persist restores
      // the nested `progress` object wholesale, so older payloads miss those keys —
      // backfill them from the defaults here.
      migrate: (persisted: unknown, version) => {
        const state = (persisted ?? {}) as { progress?: Partial<Progress> };
        if (version < 1) {
          state.progress = { ...DEFAULT_PROGRESS, ...(state.progress ?? {}) };
        }
        return state as AppState;
      },
      partialize: (s) => ({
        profile: s.profile,
        authed: s.authed,
        subscription: s.subscription,
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
