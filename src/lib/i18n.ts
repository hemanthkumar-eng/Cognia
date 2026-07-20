import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// English-first. To add Hindi etc. later: drop in a new resource block and the
// matching Sarvam language code — no screen changes needed.
const resources = {
  en: {
    translation: {
      appName: "Cognia",
      tagline: "Your friendly English-speaking buddy",

      auth: {
        createTitle: "Create your account",
        subtitle: "Practise spoken English with a personal AI tutor.",
        continueGoogle: "Continue with Google",
        continueApple: "Continue with Apple",
        or: "or",
        email: "Email",
        emailPlaceholder: "you@example.com",
        password: "Password",
        passwordPlaceholder: "At least 8 characters",
        show: "Show",
        hide: "Hide",
        createCta: "Create account",
        terms: "By continuing, you agree to our Terms and Privacy Policy.",
        haveAccount: "Already have an account?",
        login: "Log in",
      },

      subscribe: {
        title: "Choose your plan",
        subtitle: "Pick the right guide for your class and start learning.",
        manageTitle: "Your subscription",
        manageSubtitle: "Change your plan or the classes you're subscribed to.",
        perMonth: "/mo",
        mostPopular: "Most popular",
        tierBasic: "Basic",
        tierPremium: "Premium",
        selectGrade: "Select your class",
        selectGrades: "Select your classes",
        classTag: "Class",
        gradeShort: "Class {{grade}}",
        basicNote: "Basic covers one class. Upgrade to Premium to add more.",
        premiumNote: "Add every class you need — perfect for families.",
        totalLabel: "Total",
        oneClass: "1 class",
        classCount: "{{count}} classes",
        continue: "Continue",
        save: "Save changes",
        features: {
          oneGrade: "1 class of your choice",
          multiGrade: "Add multiple classes",
          voiceTutor: "Unlimited voice tutor",
          coreLessons: "Core lessons",
          allLessons: "All lessons & scenarios",
          progress: "Progress tracking",
          priority: "Priority new content",
        },
        upgradeTitle: "Premium feature",
        upgradeBody:
          "Adding more than one class is a Premium feature. Switch to Premium to continue.",
        upgradeCta: "Switch to Premium",
        cancel: "Cancel",
      },

      onboarding: {
        title: "Let's get to know you!",
        namePlaceholder: "Your name",
        gradeLabel: "Which class are you in? (optional)",
        boardLabel: "Which board?",
        levelLabel: "How comfortable are you with English?",
        levelBeginner: "Just starting",
        levelIntermediate: "I can manage",
        levelAdvanced: "Quite confident",
        interestsLabel: "What do you love? (pick a few)",
        start: "Start learning",
      },

      nav: {
        home: "Home",
        progress: "Progress",
        settings: "Settings",
      },

      home: {
        greeting: "Hi {{name}}!",
        prompt: "Ready to talk in English?",
        startTalking: "Free chat",
        lessons: "Lessons",
        settings: "Settings",
        streak: "day streak",
        xp: "XP",
        lessonsDone: "lessons",
      },

      tracking: {
        title: "Your progress",
        subtitle: "Keep the streak going.",
        streak: "Day streak",
        xp: "Total XP",
        lessonsDone: "Lessons done",
        recentTitle: "Recent activity",
        empty: "Finish a lesson or a chat to start tracking your progress.",
        lastActive: "Last active",
        never: "Not yet",

        // Syllabus coverage
        syllabusTitle: "Syllabus coverage",
        classLabel: "Class {{grade}}",
        topicsProgress: "{{done}} of {{total}} topics",
        noBoardTitle: "Pick your board",
        noBoardBody: "Choose ICSE or CBSE to see your class syllabus.",
        chooseBoard: "Choose board",
        noClassBody: "Subscribe to a class to track your syllabus.",
        practice: "Practice",
        done: "Done",

        // Activity calendar
        activityTitle: "Activity",
        currentStreak: "Current streak",
        bestStreak: "Best streak",
        daysThisWeek: "Days this week",
        days: "days",
        less: "Less",
        more: "More",
      },

      board: {
        icse: "ICSE",
        cbse: "CBSE",
      },

      lessons: {
        title: "Choose a lesson",
        subtitle: "Pick something to practise",
        loading: "Loading lessons…",
        error: "Couldn't load lessons. Is the server running?",
        retry: "Try again",
        completed: "Done",
      },

      conversation: {
        tapToSpeak: "Hold to speak",
        listening: "Listening…",
        thinking: "Thinking…",
        speaking: "Speaking…",
        idle: "Hold the mic and say hello!",
        typeInstead: "Type instead",
        send: "Send",
        back: "Back",
        finish: "Finish lesson",
        freeChat: "Free chat",
        wellDone: "Well done!",
        completedXp: "+{{xp}} XP",
      },

      settings: {
        title: "Settings",
        subscription: "Subscription",
        planBasic: "Basic plan",
        planPremium: "Premium plan",
        classesLabel: "Classes",
        managePlan: "Manage plan & classes",
        choosePlan: "Choose a plan",
        noPlan: "No active plan",
        language: "Language",
        comingSoon: "More languages coming soon",
        clearHistory: "Clear conversation",
        clearHistoryDone: "Your conversation has been cleared.",
        editProfile: "Edit profile",
        logout: "Log out",
        logoutConfirm: "You'll need to sign in again to continue. Your profile and plan are kept.",
        confirmLogout: "Log out",
        reset: "Reset everything",
        resetConfirm:
          "This erases your profile, progress and conversations on this device. This can't be undone.",
        cancel: "Cancel",
        confirmReset: "Reset",
      },

      interests: {
        cricket: "Cricket",
        space: "Space",
        animals: "Animals",
        stories: "Stories",
        music: "Music",
        science: "Science",
        movies: "Movies",
        food: "Food",
        games: "Games",
        nature: "Nature",
      },
    },
  },
};

const device = getLocales()[0]?.languageCode ?? "en";

i18n.use(initReactI18next).init({
  resources,
  lng: resources[device as keyof typeof resources] ? device : "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
