"use client";

import { useSyncExternalStore } from "react";
import { learningTracks } from "@/data/learning-tracks";
import { problems } from "@/data/problems";
import { defaultStudent } from "@/data/students";
import type { AccountProfile, AccountState } from "@/types/account";

export const personalStudentId = defaultStudent.id;
export const defaultAccount: AccountState = {
  version: 1,
  profile: {
    nickname: defaultStudent.name,
    bio: "每天进步一点，把问题想明白。",
    role: "learner",
    avatar: "code",
    track: "practice",
    dailyMinutes: 30,
    language: "C++17",
    shareProgress: false,
    gentleMotion: true,
  },
  sidebarCollapsed: false,
  bookmarks: [],
};
const storageKey = "codepath:account:v1";
let snapshot = defaultAccount;
let initialized = false;
const listeners = new Set<() => void>();

function restore(raw: string | null): AccountState {
  try {
    const value = JSON.parse(raw || "null") as AccountState | null;
    const p = value?.profile;
    if (
      value?.version !== 1 ||
      !p ||
      typeof p.nickname !== "string" ||
      !p.nickname.trim() ||
      p.nickname.length > 24 ||
      typeof p.bio !== "string" ||
      p.bio.length > 120 ||
      !["learner", "student", "teacher"].includes(p.role) ||
      !["code", "coffee", "sprout", "orbit"].includes(p.avatar) ||
      !learningTracks.some((t) => t.id === p.track) ||
      ![15, 30, 45, 60, 90].includes(p.dailyMinutes) ||
      !["C++17", "Python 3", "Java 17"].includes(p.language) ||
      typeof p.shareProgress !== "boolean" ||
      typeof p.gentleMotion !== "boolean" ||
      typeof value.sidebarCollapsed !== "boolean" ||
      !Array.isArray(value.bookmarks)
    )
      return defaultAccount;
    return {
      ...value,
      profile: {
        ...p,
        nickname:
          p.nickname.trim() === "袁某" ? defaultStudent.name : p.nickname,
      },
      bookmarks: [
        ...new Set(
          value.bookmarks.filter((id) => problems.some((p) => p.id === id)),
        ),
      ],
    };
  } catch {
    return defaultAccount;
  }
}

function getSnapshot() {
  if (!initialized && typeof window !== "undefined") {
    initialized = true;
    try {
      const raw = localStorage.getItem(storageKey);
      snapshot = restore(raw);
      const normalized = JSON.stringify(snapshot);
      if (raw && raw !== normalized)
        localStorage.setItem(storageKey, normalized);
    } catch {
      /* 内存模式仍可体验。 */
    }
  }
  return snapshot;
}
function onStorage(event: StorageEvent) {
  if (event.key === storageKey || event.key === null) {
    snapshot = restore(event.newValue);
    listeners.forEach((notify) => notify());
  }
}
function subscribe(listener: () => void) {
  if (!listeners.size) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}
function update(partial: Partial<AccountState>) {
  snapshot = { ...getSnapshot(), ...partial };
  try {
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
  } catch {
    /* 不阻塞当前体验。 */
  }
  listeners.forEach((notify) => notify());
}
export function useAccount() {
  return useSyncExternalStore(subscribe, getSnapshot, () => defaultAccount);
}
export const accountActions = {
  updateProfile: (patch: Partial<AccountProfile>) =>
    update({ profile: { ...getSnapshot().profile, ...patch } }),
  toggleSidebar: () =>
    update({ sidebarCollapsed: !getSnapshot().sidebarCollapsed }),
  toggleBookmark: (id: number) =>
    update({
      bookmarks: getSnapshot().bookmarks.includes(id)
        ? getSnapshot().bookmarks.filter((value) => value !== id)
        : [...getSnapshot().bookmarks, id],
    }),
  clearBookmarks: () => update({ bookmarks: [] }),
  reset: () => update(defaultAccount),
};
