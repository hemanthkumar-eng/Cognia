// Subscription catalogue — the single source of truth for plan tiers, their
// (mock) rupee pricing, and the classes a student can subscribe to.
//
// Two tiers: Basic (one class) and Premium (multiple classes + everything).
// Prices are placeholders until real billing lands; a Premium plan is a flat
// monthly fee that covers every class you add (a "family" plan), which is why
// multi-class is the headline Premium feature.
import type { SubscriptionTier } from "./types";

export interface TierInfo {
  id: SubscriptionTier;
  /** Flat monthly price in rupees (covers all selected classes). */
  priceMonthly: number;
  /** True when the tier can hold more than one class at a time. */
  multiGrade: boolean;
  /** i18n keys under `subscribe.features` — the plan's selling points. */
  featureKeys: string[];
  /** Show a "Most popular" ribbon. */
  highlight: boolean;
}

export const TIERS: readonly TierInfo[] = [
  {
    id: "basic",
    priceMonthly: 299,
    multiGrade: false,
    featureKeys: ["oneGrade", "voiceTutor", "coreLessons", "progress"],
    highlight: false,
  },
  {
    id: "premium",
    priceMonthly: 599,
    multiGrade: true,
    featureKeys: ["multiGrade", "voiceTutor", "allLessons", "progress", "priority"],
    highlight: true,
  },
];

export function tierInfo(id: SubscriptionTier): TierInfo {
  // TIERS always contains both ids, so this never falls through in practice.
  return TIERS.find((tier) => tier.id === id) ?? TIERS[0];
}

// Classes 1–12.
export const GRADES: readonly number[] = Array.from({ length: 12 }, (_, i) => i + 1);

// Rupee formatting. Kept manual (no Intl dependency) so it renders identically
// on every engine — amounts here are small, so plain grouping is enough.
export function formatRupees(amount: number): string {
  return `₹${amount}`;
}
