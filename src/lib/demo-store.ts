"use client";

import { useSyncExternalStore } from "react";
import { defaultStudent, students } from "@/data/students";
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
  studentId: defaultStudent.id,
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
let pendingWrite: ReturnType<typeof setTimeout> | undefined;
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
    if (!isRecord(value) || value.version !== 1) return initialState;
    if (
      !isRecord(value.results) ||
      !isRecord(value.drafts) ||
      !Array.isArray(value.decisions)
    )
      return initialState;
    // v1 最初固定使用 yuan；默认账户改名后保留它的已有学习记录。
    if (!students.some((s) => s.id === "yuan")) {
      if (value.studentId === "yuan") value.studentId = defaultStudent.id;
      if (value.extraStudentId === "yuan")
        value.extraStudentId = defaultStudent.id;
      for (const [key, result] of Object.entries(value.results)) {
        if (
          isRecord(result) &&
          result.studentId === "yuan" &&
          key === `yuan:${result.problemId}`
        ) {
          const nextKey = `${defaultStudent.id}:${result.problemId}`;
          value.results[nextKey] ??= {
            ...result,
            studentId: defaultStudent.id,
          };
          delete value.results[key];
        }
      }
      for (const key of Object.keys(value.drafts)) {
        if (key.startsWith("yuan:")) {
          const nextKey = `${defaultStudent.id}:${key.slice(5)}`;
          value.drafts[nextKey] ??= value.drafts[key];
          delete value.drafts[key];
        }
      }
    }
    for (const decision of value.decisions) {
      if (isRecord(decision) && typeof decision.text === "string") {
        decision.text = decision.text.replaceAll("袁某", defaultStudent.name);
      }
    }
    if (!students.some((s) => s.id === value.studentId))
      value.studentId = defaultStudent.id;
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
        draft.hintLevel > 4 ||
        (draft.language !== undefined &&
          !["C++17", "Python 3", "Java 17"].includes(String(draft.language)))
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

function onStorage(event: StorageEvent) {
  if (event.key === storageKey || event.key === null) {
    clearTimeout(pendingWrite);
    snapshot = restore(event.newValue);
    listeners.forEach((notify) => notify());
  }
}
function subscribe(listener: () => void) {
  if (!listeners.size) {
    window.addEventListener("storage", onStorage);
    window.addEventListener("pagehide", persist);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pagehide", persist);
      persist();
    }
  };
}

function persist() {
  clearTimeout(pendingWrite);
  try {
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
  } catch {
    /* 配额耗尽仍可继续本次演示。 */
  }
}
function update(
  partial: Partial<DemoState>,
  persistence: "now" | "later" | "memory" = "now",
) {
  snapshot = { ...getSnapshot(), ...partial };
  if (persistence === "now") persist();
  else if (persistence === "later") {
    clearTimeout(pendingWrite);
    pendingWrite = setTimeout(persist, 300);
  }
  listeners.forEach((listener) => listener());
}

export function useDemo() {
  return useSyncExternalStore(subscribe, getSnapshot, () => initialState);
}

export const demoActions = {
  clearStudentRecords: (studentId: string) =>
    update({
      results: Object.fromEntries(
        Object.entries(getSnapshot().results).filter(
          ([, result]) => result.studentId !== studentId,
        ),
      ),
      drafts: Object.fromEntries(
        Object.entries(getSnapshot().drafts).filter(
          ([key]) => !key.startsWith(`${studentId}:`),
        ),
      ),
    }),
  selectStudent: (studentId: string) =>
    update({
      studentId: students.some((s) => s.id === studentId)
        ? studentId
        : defaultStudent.id,
    }),
  saveDraft: (key: string, draft: SessionDraft) =>
    update({ drafts: { ...getSnapshot().drafts, [key]: draft } }),
  patchDraft: (
    key: string,
    partial: Partial<SessionDraft>,
    fallback: SessionDraft,
  ) =>
    update(
      {
        drafts: {
          ...getSnapshot().drafts,
          [key]: { ...(getSnapshot().drafts[key] ?? fallback), ...partial },
        },
      },
      "later",
    ),
  tickDraft: (key: string, seconds: number, fallback: SessionDraft) => {
    const current = getSnapshot();
    if (current.results[key]) return;
    const draft = current.drafts[key] ?? fallback;
    update(
      {
        drafts: {
          ...current.drafts,
          [key]: { ...draft, seconds: draft.seconds + seconds },
        },
      },
      (draft.seconds + seconds) % 5 === 0 ? "now" : "memory",
    );
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
