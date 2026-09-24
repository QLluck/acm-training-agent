"use client";

import { useSyncExternalStore } from "react";
import { students } from "@/data/students";
import { problems } from "@/data/problems";
import type {
  CoachDecision,
  DemoState,
  SessionDraft,
  SessionResult,
} from "@/types/training";

const storageKey = "acm-training-agent:v1";
const initialState: DemoState = {
  version: 1,
  studentId: "yuan",
  results: {},
  drafts: {},
  round: 0,
  decisions: [],
  difficulty: 0,
  topic: "",
  extraStudentId: "",
};
let snapshot = initialState;
let loaded = false;
const listeners = new Set<() => void>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function restore(raw: string | null): DemoState {
  try {
    const value: unknown = JSON.parse(raw || "null");
    if (
      !isRecord(value) ||
      value.version !== 1 ||
      !students.some((s) => s.id === value.studentId)
    )
      return initialState;
    if (
      !isRecord(value.results) ||
      !isRecord(value.drafts) ||
      !Array.isArray(value.decisions)
    )
      return initialState;
    for (const [key, result] of Object.entries(value.results)) {
      if (
        !isRecord(result) ||
        !students.some((s) => s.id === result.studentId) ||
        !problems.some((p) => p.id === result.problemId) ||
        key !== `${result.studentId}:${result.problemId}` ||
        !["ac", "unfinished"].includes(String(result.outcome)) ||
        !isFiniteNumber(result.seconds) ||
        !isFiniteNumber(result.hintLevel) ||
        result.hintLevel < 0 ||
        result.hintLevel > 4 ||
        !isRecord(result.skillDelta) ||
        !Object.values(result.skillDelta).every(isFiniteNumber) ||
        ![
          result.note,
          result.analysis,
          result.nextStep,
          result.finishedAt,
        ].every((v) => typeof v === "string")
      )
        return initialState;
    }
    for (const draft of Object.values(value.drafts)) {
      if (
        !isRecord(draft) ||
        typeof draft.code !== "string" ||
        typeof draft.note !== "string" ||
        !isFiniteNumber(draft.seconds) ||
        !isFiniteNumber(draft.hintLevel) ||
        draft.hintLevel < 0 ||
        draft.hintLevel > 4
      )
        return initialState;
    }
    if (
      value.decisions.some(
        (d) =>
          !isRecord(d) ||
          typeof d.id !== "string" ||
          typeof d.text !== "string" ||
          !["accept", "difficulty", "topic", "individual"].includes(
            String(d.kind),
          ),
      )
    )
      return initialState;
    if (
      !isFiniteNumber(value.round) ||
      !isFiniteNumber(value.difficulty) ||
      typeof value.topic !== "string" ||
      typeof value.extraStudentId !== "string"
    )
      return initialState;
    return value as unknown as DemoState;
  } catch {
    return initialState;
  }
}

function getSnapshot() {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try {
      snapshot = restore(localStorage.getItem(storageKey));
    } catch {
      /* 无存储权限时保持内存演示。 */
    }
  }
  return snapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) {
      snapshot = restore(event.newValue);
      listeners.forEach((notify) => notify());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function update(partial: Partial<DemoState>) {
  snapshot = { ...getSnapshot(), ...partial };
  try {
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
  } catch {
    /* 配额耗尽仍可继续本次演示。 */
  }
  listeners.forEach((listener) => listener());
}

export function useDemo() {
  return useSyncExternalStore(subscribe, getSnapshot, () => initialState);
}

export const demoActions = {
  selectStudent: (studentId: string) => update({ studentId }),
  saveDraft: (key: string, draft: SessionDraft) =>
    update({ drafts: { ...getSnapshot().drafts, [key]: draft } }),
  patchDraft: (
    key: string,
    partial: Partial<SessionDraft>,
    fallback: SessionDraft,
  ) =>
    update({
      drafts: {
        ...getSnapshot().drafts,
        [key]: { ...(getSnapshot().drafts[key] ?? fallback), ...partial },
      },
    }),
  tickDraft: (key: string, seconds: number, fallback: SessionDraft) => {
    const current = getSnapshot();
    if (current.results[key]) return;
    const draft = current.drafts[key] ?? fallback;
    update({
      drafts: {
        ...current.drafts,
        [key]: { ...draft, seconds: draft.seconds + seconds },
      },
    });
  },
  saveResult: (result: SessionResult) =>
    update({
      results: {
        ...getSnapshot().results,
        [`${result.studentId}:${result.problemId}`]: result,
      },
    }),
  resumeUnfinished: (key: string) => {
    const results = { ...getSnapshot().results };
    if (results[key]?.outcome !== "unfinished") return;
    delete results[key];
    update({ results });
  },
  nextRound: () => update({ round: getSnapshot().round + 1 }),
  decide: (
    kind: CoachDecision["kind"],
    text: string,
    patch: Partial<DemoState> = {},
  ) =>
    update({
      ...patch,
      decisions: [
        { id: crypto.randomUUID(), kind, text },
        ...getSnapshot().decisions,
      ].slice(0, 12),
    }),
  reset: () => update(initialState),
};
