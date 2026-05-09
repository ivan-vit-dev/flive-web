import { Timestamp } from "firebase/firestore";

// ─── Auth / User ────────────────────────────────────────────────────────────

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: "reporter";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Match ───────────────────────────────────────────────────────────────────

export type MatchStatus =
  | "scheduled"
  | "live_first"
  | "half_time"
  | "live_second"
  | "extra_time"
  | "penalty_shootout"
  | "finished"
  | "cancelled"
  | "postponed";

export const LIVE_STATUSES: MatchStatus[] = [
  "live_first",
  "half_time",
  "live_second",
  "extra_time",
  "penalty_shootout",
];

export interface MatchSummary {
  scorers: { name: string; team: "home" | "away"; minute: number; isOwnGoal: boolean }[];
  cards: { name: string; team: "home" | "away"; type: "yellow" | "red" | "second_yellow"; minute: number }[];
  halfTimeScore: { home: number; away: number };
  fullTimeScore: { home: number; away: number };
  hadExtraTime: boolean;
  shootoutScore: { home: number; away: number } | null;
}

export interface Match {
  id: string;
  reporterId: string;
  reporterName: string;

  homeTeam: string;
  awayTeam: string;
  homePlayers: string[];
  awayPlayers: string[];
  homeScore: number;
  awayScore: number;
  homeShootoutScore: number;
  awayShootoutScore: number;

  enabledEventTypes: MatchEventType[];

  venue: string;
  competition: string;
  scheduledAt: Timestamp;
  status: MatchStatus;
  currentMinute: number;
  halfNumber: 1 | 2 | null;
  description: string | null;
  isPublic: true;

  summary: MatchSummary | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Match Events ─────────────────────────────────────────────────────────────

export type MatchEventType =
  // Timeline — structural (always present, not configurable)
  | "match_start"
  | "first_half_end"
  | "second_half_start"
  | "full_time"
  | "extra_time_start"
  | "extra_time_end"
  | "penalty_shootout_start"
  | "match_finished"
  // Gameplay — reporter-configurable
  | "goal"
  | "own_goal"
  | "yellow_card"
  | "second_yellow"
  | "red_card"
  | "substitution"
  | "corner"
  | "free_kick"
  | "penalty_awarded"
  | "penalty_scored"
  | "penalty_missed"
  | "penalty_kick"
  | "offside"
  | "foul"
  | "injury"
  | "injury_time_announced"
  | "shot_on_target"
  | "shot_off_target"
  | "save"
  | "var_review"
  | "var_goal_disallowed"
  | "var_goal_confirmed"
  | "custom_note";

export const TIMELINE_EVENTS: MatchEventType[] = [
  "match_start",
  "first_half_end",
  "second_half_start",
  "full_time",
  "extra_time_start",
  "extra_time_end",
  "penalty_shootout_start",
  "match_finished",
];

export const GAMEPLAY_EVENTS: MatchEventType[] = [
  "goal",
  "own_goal",
  "yellow_card",
  "second_yellow",
  "red_card",
  "substitution",
  "corner",
  "free_kick",
  "penalty_awarded",
  "penalty_scored",
  "penalty_missed",
  "penalty_kick",
  "offside",
  "foul",
  "injury",
  "injury_time_announced",
  "shot_on_target",
  "shot_off_target",
  "save",
  "var_review",
  "var_goal_disallowed",
  "var_goal_confirmed",
  "custom_note",
];

export const EVENT_GROUPS: Record<string, MatchEventType[]> = {
  goals: ["goal", "own_goal", "penalty_scored", "penalty_missed"],
  cards: ["yellow_card", "second_yellow", "red_card"],
  setPieces: ["corner", "free_kick", "penalty_awarded", "offside", "foul"],
  shootout: ["penalty_kick"],
  stats: ["shot_on_target", "shot_off_target", "save", "injury", "injury_time_announced"],
  other: ["substitution", "var_review", "var_goal_disallowed", "var_goal_confirmed", "custom_note"],
};

export type ShootoutResult = "scored" | "missed" | "saved";

export interface MatchEvent {
  id: string;
  matchId: string;
  type: MatchEventType;
  minute: number;
  addedTime: number | null;

  team: "home" | "away" | null;
  playerName: string | null;
  assistName: string | null;
  playerOutName: string | null;
  shootoutResult: ShootoutResult | null;
  description: string | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Offline broadcast session ────────────────────────────────────────────────

export interface PendingEvent {
  localId: string;
  event: Omit<MatchEvent, "id" | "createdAt" | "updatedAt">;
  queuedAt: string;
}

export interface BroadcastSession {
  matchId: string;
  pendingEvents: PendingEvent[];
}
