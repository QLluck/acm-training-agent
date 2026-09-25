"use client";

import {
  BookOpen,
  Braces,
  BriefcaseBusiness,
  Check,
  Code2,
  Coffee,
  GraduationCap,
  Orbit,
  Sprout,
  Trophy,
} from "lucide-react";
import { learningTracks } from "@/data/learning-tracks";
import { accountActions, useAccount } from "@/lib/account-store";
import type { AccountProfile } from "@/types/account";

const trackIcons = {
  practice: Braces,
  contest: Trophy,
  interview: BriefcaseBusiness,
  postgrad: BookOpen,
  beginner: Sprout,
  teaching: GraduationCap,
};
export function TrackPicker({ compact = false }: { compact?: boolean }) {
  const { profile } = useAccount();
  return (
    <div
      className={`track-picker ${compact ? "compact-tracks" : ""}`}
      role="group"
      aria-label="选择学习方向"
    >
      {learningTracks.map((track) => {
        const Icon = trackIcons[track.id];
        const active = profile.track === track.id;
        return (
          <button
            key={track.id}
            type="button"
            className={`track-card ${active ? "selected" : ""}`}
            aria-pressed={active}
            onClick={() => accountActions.updateProfile({ track: track.id })}
          >
            <span className="track-symbol">
              <Icon size={21} aria-hidden="true" />
            </span>
            <strong>{track.title}</strong>
            {!compact && <span>{track.subtitle}</span>}
            {active && (
              <Check className="track-check" size={14} aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );
}
export function AccountAvatar({
  avatar,
  size = "",
}: {
  avatar: AccountProfile["avatar"];
  size?: "small" | "large" | "";
}) {
  const Icon = { code: Code2, coffee: Coffee, sprout: Sprout, orbit: Orbit }[
    avatar
  ];
  return (
    <span className={`avatar account-avatar ${size}`}>
      <Icon
        size={size === "large" ? 34 : size === "small" ? 18 : 23}
        aria-hidden="true"
      />
    </span>
  );
}
