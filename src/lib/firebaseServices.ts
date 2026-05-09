import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Match, MatchEvent, MatchEventType, MatchStatus, MatchSummary, User } from "@/types";
import { GAMEPLAY_EVENTS } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function docToMatch(id: string, data: Record<string, unknown>): Match {
  return { id, ...data } as Match;
}

function docToEvent(id: string, data: Record<string, unknown>): MatchEvent {
  return { id, ...data } as MatchEvent;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUserDoc(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as User;
}

export async function createUserDoc(uid: string, email: string, displayName: string): Promise<User> {
  const now = serverTimestamp() as Timestamp;
  const userData = {
    uid,
    email,
    displayName,
    role: "reporter" as const,
    createdAt: now,
    updatedAt: now,
  };
  await updateDoc(doc(db, "users", uid), userData).catch(async () => {
    // doc doesn't exist yet — use setDoc via updateDoc workaround
    const { setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "users", uid), userData);
  });
  return { ...userData, createdAt: Timestamp.now(), updatedAt: Timestamp.now() };
}

// ─── Matches — Public ─────────────────────────────────────────────────────────

export async function getPublicMatches(): Promise<Match[]> {
  const q = query(
    collection(db, "matches"),
    where("isPublic", "==", true),
    orderBy("scheduledAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToMatch(d.id, d.data()));
}

export async function getMatch(matchId: string): Promise<Match | null> {
  const snap = await getDoc(doc(db, "matches", matchId));
  if (!snap.exists()) return null;
  return docToMatch(snap.id, snap.data());
}

// ─── Matches — Reporter ───────────────────────────────────────────────────────

export async function getReporterMatches(reporterId: string): Promise<Match[]> {
  const q = query(
    collection(db, "matches"),
    where("reporterId", "==", reporterId),
    orderBy("scheduledAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToMatch(d.id, d.data()));
}

export async function createMatch(
  data: Omit<Match, "id" | "homeScore" | "awayScore" | "homeShootoutScore" | "awayShootoutScore" | "status" | "currentMinute" | "halfNumber" | "summary" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "matches"), {
    ...data,
    homeScore: 0,
    awayScore: 0,
    homeShootoutScore: 0,
    awayShootoutScore: 0,
    status: "scheduled" as MatchStatus,
    currentMinute: 0,
    halfNumber: null,
    summary: null,
    enabledEventTypes: data.enabledEventTypes ?? GAMEPLAY_EVENTS,
    isPublic: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  // denormalize the doc id
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

export async function updateMatch(matchId: string, patch: Partial<Match>): Promise<void> {
  await updateDoc(doc(db, "matches", matchId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMatch(matchId: string): Promise<void> {
  await deleteDoc(doc(db, "matches", matchId));
}

export async function updateMatchStatus(matchId: string, status: MatchStatus, extra?: { currentMinute?: number; halfNumber?: 1 | 2 | null }): Promise<void> {
  await updateDoc(doc(db, "matches", matchId), {
    status,
    ...(extra ?? {}),
    updatedAt: serverTimestamp(),
  });
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function getMatchEvents(matchId: string): Promise<MatchEvent[]> {
  const q = query(
    collection(db, "matches", matchId, "events"),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToEvent(d.id, d.data()));
}

export async function addMatchEvent(
  matchId: string,
  eventData: Omit<MatchEvent, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "matches", matchId, "events"), {
    ...eventData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update score on goal events
  const matchPatch: Record<string, unknown> = { updatedAt: serverTimestamp() };

  if (eventData.type === "goal") {
    if (eventData.team === "home") matchPatch.homeScore = increment(1);
    if (eventData.team === "away") matchPatch.awayScore = increment(1);
  }
  if (eventData.type === "own_goal") {
    // own_goal: team field = team that conceded, so increment opponent
    if (eventData.team === "home") matchPatch.awayScore = increment(1);
    if (eventData.team === "away") matchPatch.homeScore = increment(1);
  }
  if (eventData.type === "penalty_scored") {
    if (eventData.team === "home") matchPatch.homeScore = increment(1);
    if (eventData.team === "away") matchPatch.awayScore = increment(1);
  }
  if (eventData.type === "penalty_kick" && eventData.shootoutResult === "scored") {
    if (eventData.team === "home") matchPatch.homeShootoutScore = increment(1);
    if (eventData.team === "away") matchPatch.awayShootoutScore = increment(1);
  }

  if (Object.keys(matchPatch).length > 1) {
    await updateDoc(doc(db, "matches", matchId), matchPatch);
  }

  return ref.id;
}

// ─── Post-match summary ───────────────────────────────────────────────────────

export async function writeMatchSummary(matchId: string, events: MatchEvent[], match: Match): Promise<void> {
  const scorers = events
    .filter((e) => e.type === "goal" || e.type === "own_goal" || e.type === "penalty_scored")
    .map((e) => ({
      name: e.playerName ?? "Unknown",
      team: e.team as "home" | "away",
      minute: e.minute,
      isOwnGoal: e.type === "own_goal",
    }));

  const cards = events
    .filter((e) => ["yellow_card", "second_yellow", "red_card"].includes(e.type))
    .map((e) => ({
      name: e.playerName ?? "Unknown",
      team: e.team as "home" | "away",
      type: e.type as "yellow" | "red" | "second_yellow",
      minute: e.minute,
    }));

  const htEvent = events.find((e) => e.type === "first_half_end");
  const hadET = events.some((e) => e.type === "extra_time_start");
  const hadShootout = events.some((e) => e.type === "penalty_shootout_start");

  const summary: MatchSummary = {
    scorers,
    cards,
    halfTimeScore: { home: 0, away: 0 }, // approximated — not tracked separately in v1
    fullTimeScore: { home: match.homeScore, away: match.awayScore },
    hadExtraTime: hadET,
    shootoutScore: hadShootout
      ? { home: match.homeShootoutScore, away: match.awayShootoutScore }
      : null,
  };

  await updateDoc(doc(db, "matches", matchId), {
    summary,
    status: "finished" as MatchStatus,
    updatedAt: serverTimestamp(),
  });
}
