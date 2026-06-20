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
  | "live_part"   // generic: any part is in progress (multi-part matches)
  | "break"       // generic: between parts
  | "finished"
  | "cancelled"
  | "postponed";

export const LIVE_STATUSES: MatchStatus[] = [
  "live_first",
  "half_time",
  "live_second",
  "extra_time",
  "penalty_shootout",
  "live_part",
  "break",
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
  currentMinuteAt?: Timestamp;
  halfNumber: 1 | 2 | null;
  parts?: number;        // number of parts (2 = halves, 4 = quarters). default 2
  partDuration?: number; // minutes per part. default 45
  currentPart?: number;  // 0 = not started, N = current/last completed part
  description: string | null;
  isPublic: true;
  viewerCount?: number;

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
  | "custom_note"
  | "part_start"  // generic part start (2nd, 3rd, 4th part)
  | "part_end";   // generic part end

export const TIMELINE_EVENTS: MatchEventType[] = [
  "match_start",
  "first_half_end",
  "second_half_start",
  "full_time",
  "extra_time_start",
  "extra_time_end",
  "penalty_shootout_start",
  "match_finished",
  "part_start",
  "part_end",
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
  partNumber?: number | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Settings — Teams ────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  createdAt: Timestamp;
}

export interface TeamPlayer {
  id: string;
  name: string;
  jerseyNumber: number | null;
  createdAt: Timestamp;
}

export interface TeamPitch {
  id: string;
  name: string;
  createdAt: Timestamp;
}

export interface TeamCompetition {
  id: string;
  name: string;
  createdAt: Timestamp;
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
  clock?: {
    seconds: number; // elapsed seconds at the moment of save
    savedAt: number; // Date.now() (Unix ms) at the moment of save
  };
}
