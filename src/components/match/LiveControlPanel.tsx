"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { WifiOff, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventBadge } from "./EventBadge";
import { EventFeedItem } from "./EventFeedItem";
import { EventForm } from "@/components/forms/EventForm";
import { addMatchEvent, updateMatchStatus, updateMatchClock, writeMatchSummary, getMatchEvents, deleteMatchEvent } from "@/lib/firebaseServices";
import { cn, getBroadcastSession, setBroadcastSession, clearBroadcastSession, saveMatchClock, clearMatchClock } from "@/lib/utils";
import type { Match, MatchEvent, MatchEventType, MatchStatus, BroadcastSession, PendingEvent } from "@/types";
import { EVENT_GROUPS } from "@/types";
import toast from "react-hot-toast";

// Events that require the dialog (team selection, player name, or other fields)
const COMPLEX_EVENTS: MatchEventType[] = [
  "goal", "own_goal", "yellow_card", "second_yellow", "red_card",
  "substitution", "penalty_kick", "penalty_scored", "penalty_missed",
  "penalty_awarded", "injury", "foul", "var_review", "var_goal_disallowed",
  "var_goal_confirmed", "custom_note", "injury_time_announced",
  "corner", "free_kick", "shot_on_target", "shot_off_target", "save", "offside",
];

const RUNNING_STATUSES: MatchStatus[] = ["live_first", "live_second", "extra_time", "penalty_shootout", "live_part"];
const ACTIVE_STATUSES: MatchStatus[] = ["live_first", "half_time", "live_second", "extra_time", "penalty_shootout", "live_part", "break"];

// Derives elapsed seconds from Firestore timestamps — same logic as ScoreBoard.
// Used as fallback when no localStorage clock exists (e.g. fresh page load / reload).
function computeMatchSeconds(m: Match): number {
  const base = m.currentMinute * 60;
  if (!RUNNING_STATUSES.includes(m.status) || !m.currentMinuteAt) return base;
  const elapsed = Math.floor((Date.now() - m.currentMinuteAt.toDate().getTime()) / 1000);
  return base + elapsed;
}

interface Props {
  match: Match;
  onMatchUpdated: () => void;
  onSecondsChange?: (seconds: number) => void;
}

export function LiveControlPanel({ match, onMatchUpdated, onSecondsChange }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const [isOnline, setIsOnline] = useState(typeof window !== "undefined" ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const [seconds, setSeconds] = useState(() => {
    const session = getBroadcastSession();
    if (
      session?.matchId === match.id &&
      session?.clock &&
      RUNNING_STATUSES.includes(match.status)
    ) {
      return Math.floor(session.clock.seconds + (Date.now() - session.clock.savedAt) / 1000);
    }
    // No localStorage clock: derive elapsed time from Firestore so reporter and
    // broadcast page stay in sync on fresh load / reload.
    return computeMatchSeconds(match);
  });
  const [clockRestoredFromCache, setClockRestoredFromCache] = useState(() => {
    const session = getBroadcastSession();
    return !!(
      session?.matchId === match.id &&
      session?.clock &&
      RUNNING_STATUSES.includes(match.status)
    );
  });
  const [selectedEventType, setSelectedEventType] = useState<MatchEventType | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);

  const minute = Math.floor(seconds / 60);
  const prevStatusRef = useRef(match.status);
  const secondsRef = useRef(seconds);

  useEffect(() => { secondsRef.current = seconds; }, [seconds]);
  useEffect(() => { onSecondsChange?.(seconds); }, [seconds, onSecondsChange]);

  // Track online/offline state
  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      flushPendingEvents();
    };
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset timer when match phase actually transitions (skip on mount to preserve restored clock)
  useEffect(() => {
    const statusChanged = match.status !== prevStatusRef.current;
    prevStatusRef.current = match.status;
    if (!statusChanged) return;
    if (!RUNNING_STATUSES.includes(match.status)) return;
    setSeconds(computeMatchSeconds(match));
    setClockRestoredFromCache(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.status]);

  // Live running timer
  useEffect(() => {
    if (!RUNNING_STATUSES.includes(match.status)) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [match.status]);

  // Persist running clock to localStorage + Firestore every 30 s.
  // localStorage survives tab close / reload; Firestore keeps broadcast viewers in sync.
  useEffect(() => {
    if (!RUNNING_STATUSES.includes(match.status)) return;
    const id = setInterval(() => {
      saveMatchClock(secondsRef.current);
      void updateMatchClock(match.id, secondsRef.current);
    }, 30_000);
    return () => clearInterval(id);
  }, [match.status, match.id]);

  // Write session to localStorage on mount
  useEffect(() => {
    const existing = getBroadcastSession();
    if (!existing || existing.matchId !== match.id) {
      setBroadcastSession({ matchId: match.id, pendingEvents: [] } satisfies BroadcastSession);
    } else {
      setPendingCount(existing.pendingEvents?.length ?? 0);
    }
  }, [match.id]);

  const loadEvents = useCallback(async () => {
    const fetched = await getMatchEvents(match.id);
    setEvents(fetched);
  }, [match.id]);

  const handleRemoveEvent = useCallback(async (event: MatchEvent) => {
    try {
      await deleteMatchEvent(match.id, event);
      void loadEvents();
      onMatchUpdated();
    } catch {
      toast.error(t("common.error"));
    }
  }, [match.id, loadEvents, onMatchUpdated, t]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const flushPendingEvents = useCallback(async () => {
    const session: BroadcastSession | null = getBroadcastSession();
    if (!session || session.pendingEvents.length === 0) return;

    for (const pending of session.pendingEvents) {
      try {
        await addMatchEvent(match.id, pending.event);
      } catch {
        // keep remaining in queue on failure
      }
    }
    setBroadcastSession({ ...session, pendingEvents: [] });
    setPendingCount(0);
    toast.success(t("control.syncSuccess"));
    onMatchUpdated();
    void loadEvents();
  }, [match.id, t, onMatchUpdated, loadEvents]);

  const logEvent = async (eventData: Omit<MatchEvent, "id" | "createdAt" | "updatedAt">) => {
    if (isOnline) {
      try {
        await addMatchEvent(match.id, eventData);
        onMatchUpdated();
        void loadEvents();
      } catch {
        toast.error(t("common.error"));
      }
    } else {
      const session: BroadcastSession = getBroadcastSession() ?? { matchId: match.id, pendingEvents: [] };
      const pending: PendingEvent = {
        localId: crypto.randomUUID(),
        event: eventData,
        queuedAt: new Date().toISOString(),
      };
      session.pendingEvents.push(pending);
      setBroadcastSession(session);
      setPendingCount(session.pendingEvents.length);
    }
  };

  const handleSimpleEvent = async (type: MatchEventType, partNumber?: number) => {
    await logEvent({
      matchId: match.id,
      type,
      minute,
      addedTime: null,
      team: null,
      playerName: null,
      assistName: null,
      playerOutName: null,
      shootoutResult: null,
      description: null,
      partNumber: partNumber ?? null,
    });
  };

  const handlePhaseChange = async (status: MatchStatus, eventType: MatchEventType, nextPart?: number) => {
    await updateMatchStatus(match.id, status, {
      currentMinute: minute,
      ...(nextPart !== undefined ? { currentPart: nextPart } : {}),
    });
    const isPartEvent = eventType === "part_start" || eventType === "part_end";
    await handleSimpleEvent(eventType, isPartEvent ? nextPart : undefined);
    if (status === "finished") {
      const allEvents = await getMatchEvents(match.id);
      await writeMatchSummary(match.id, allEvents, match);
      clearBroadcastSession(); // wipes entire session including clock
    } else {
      clearMatchClock(); // phase changed — next mount starts from fresh Firestore currentMinute
    }
    onMatchUpdated();
  };

  const phaseButtons = getPhaseButtons(match, t);

  return (
    <div className="space-y-4">
      {/* Offline banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive-subtle bg-destructive-subtle px-4 py-2 text-sm text-destructive">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>{t("control.offlineWarning")}</span>
          {pendingCount > 0 && (
            <span className="ml-auto font-medium">
              {t("control.pendingEvents", { count: pendingCount })}
            </span>
          )}
        </div>
      )}

      {/* Clock restored from cache banner */}
      {clockRestoredFromCache && ACTIVE_STATUSES.includes(match.status) && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-sm text-muted-foreground">
          <Radio className="h-4 w-4 shrink-0 text-primary" />
          <span>{t("control.clockRestored")}</span>
          <button
            className="ml-auto text-xs underline underline-offset-2 hover:text-foreground transition-colors"
            onClick={() => setClockRestoredFromCache(false)}
          >
            {t("common.dismiss")}
          </button>
        </div>
      )}

      {/* Main control row: phase buttons | timer | broadcast */}
      <div className="flex items-center gap-4">
        {/* Left: phase buttons — shrink-0 so they never wrap */}
        <div className="flex gap-2 shrink-0">
          {phaseButtons.map((btn) => (
            <Button
              key={btn.label}
              variant={btn.variant === "brand" ? "default" : btn.variant === "destructive" ? "destructive" : "outline"}
              className={cn(
                "h-auto py-2 px-4",
                btn.variant === "brand" && "gradient-brand text-white border-0 shadow-md hover:opacity-90 transition-opacity"
              )}
              onClick={() => handlePhaseChange(btn.nextStatus, btn.eventType, btn.nextPart)}
            >
              {btn.label}
            </Button>
          ))}
        </div>

        {/* Center: timer */}
        <div className="flex flex-1 flex-col items-center justify-center">
          {ACTIVE_STATUSES.includes(match.status) ? (
            <>
              <span className="font-mono text-4xl font-bold tabular-nums text-primary">
                {String(minute).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
              </span>
              {(match.status === "half_time" || match.status === "break") && (
                <span className="text-xs text-muted-foreground">
                  {((match.status === "half_time" && (match.currentPart ?? 1) >= 2) ||
                    (match.status === "break" && (match.currentPart ?? 0) >= (match.parts ?? 2)))
                    ? t("match.afterLastPart")
                    : t("match.partBreak")}
                </span>
              )}
            </>
          ) : match.status === "scheduled" ? (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">{t("control.minuteLabel")}:</label>
              <Input
                type="number"
                min={0}
                max={150}
                value={minute}
                onChange={(e) => setSeconds(Number(e.target.value) * 60)}
                className="w-20"
              />
            </div>
          ) : null}
        </div>

        {/* Right: broadcast link */}
        <div className="shrink-0">
          <Link
            href={`/${locale}/broadcast/${match.id}`}
            target="_blank"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium gradient-brand text-white shadow-md transition-opacity hover:opacity-90"
          >
            <Radio className="h-4 w-4" />
            {t("control.broadcastLink")}
          </Link>
        </div>
      </div>

      {/* Event grid */}
      {match.status !== "scheduled" && match.status !== "finished" && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Events</h3>

          {Object.entries(EVENT_GROUPS).map(([group, types]) => {
            const visible = types.filter((type) => match.enabledEventTypes.includes(type));
            if (visible.length === 0) return null;
            return (
              <div key={group}>
                <p className="text-xs text-muted-foreground mb-1.5">
                  {t(`control.eventGroups.${group}` as Parameters<typeof t>[0])}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {visible.map((type) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      className="flex-col h-auto py-2 gap-1 w-full rounded-xl"
                      onClick={() =>
                        COMPLEX_EVENTS.includes(type)
                          ? setSelectedEventType(type)
                          : handleSimpleEvent(type)
                      }
                    >
                      <EventBadge type={type} size="sm" />
                      <span className="text-xs">{t(`events.${type}` as Parameters<typeof t>[0])}</span>
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Complex event dialog */}
      {selectedEventType && (
        <EventForm
          type={selectedEventType}
          match={match}
          minute={minute}
          onSubmit={async (data) => {
            await logEvent(data);
            setSelectedEventType(null);
          }}
          onClose={() => setSelectedEventType(null)}
        />
      )}

      {/* Events log */}
      {events.length > 0 && (
        <div className="space-y-2 border-t pt-4">
          <h3 className="text-sm font-medium">{t("control.eventsLog")}</h3>
          <div className="rounded-xl border bg-card">
            <ul className="p-1.5 space-y-0.5">
              {[...events].reverse().map((event, index) => (
                <EventFeedItem
                  key={event.id}
                  event={event}
                  homeTeam={match.homeTeam}
                  awayTeam={match.awayTeam}
                  index={index}
                  onRemove={handleRemoveEvent}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

interface PhaseButton {
  label: string;
  nextStatus: MatchStatus;
  eventType: MatchEventType;
  variant: "brand" | "outline" | "destructive";
  nextPart?: number;
}

function getPhaseButtons(match: Match, t: ReturnType<typeof useTranslations>): PhaseButton[] {
  const parts = match.parts ?? 2;
  const currentPart = match.currentPart ?? 0;
  const status = match.status;

  // Single-part match (U8–U10 short format)
  if (parts === 1) {
    switch (status) {
      case "scheduled":
        return [{ label: t("control.startMatch"), nextStatus: "live_part", eventType: "match_start", variant: "brand", nextPart: 1 }];
      case "live_part":
        return [{ label: t("control.finishMatch"), nextStatus: "finished", eventType: "match_finished", variant: "brand", nextPart: 1 }];
      default:
        return [];
    }
  }

  // Generic multi-part logic (3+ parts, or any match using live_part/break statuses)
  if (parts > 2 || status === "live_part" || status === "break") {
    switch (status) {
      case "scheduled":
        return [{ label: t("control.startPart", { n: 1 }), nextStatus: "live_part", eventType: "match_start", variant: "brand", nextPart: 1 }];
      case "live_part":
        if (currentPart >= parts) {
          // Last part — offer both a clean end-of-part and a direct finish
          return [
            { label: t("control.endPart", { n: currentPart }), nextStatus: "break", eventType: "part_end", variant: "outline", nextPart: currentPart },
            { label: t("control.finishMatch"), nextStatus: "finished", eventType: "match_finished", variant: "destructive", nextPart: currentPart },
          ];
        }
        return [{ label: t("control.endPart", { n: currentPart }), nextStatus: "break", eventType: "part_end", variant: "outline", nextPart: currentPart }];
      case "break": {
        if (currentPart >= parts) {
          return [{ label: t("control.finishMatch"), nextStatus: "finished", eventType: "match_finished", variant: "brand" }];
        }
        const next = currentPart + 1;
        return [{ label: t("control.startPart", { n: next }), nextStatus: "live_part", eventType: "part_start", variant: "brand", nextPart: next }];
      }
      default:
        return [];
    }
  }

  // Standard 2-half logic
  switch (status) {
    case "scheduled":
      return [{ label: t("control.startMatch"), nextStatus: "live_first", eventType: "match_start", variant: "brand", nextPart: 1 }];
    case "live_first":
      return [{ label: t("control.endFirstHalf"), nextStatus: "half_time", eventType: "first_half_end", variant: "outline", nextPart: 1 }];
    case "half_time":
      if (currentPart >= 3) {
        // After extra time — choose: finish or start shootout
        return [
          { label: t("control.finishMatch"), nextStatus: "finished", eventType: "match_finished", variant: "outline" },
          { label: t("control.startShootout"), nextStatus: "penalty_shootout", eventType: "penalty_shootout_start", variant: "brand" },
        ];
      }
      if (currentPart >= 2) {
        // After second half — choose: finish, extra time, or shootout
        return [
          { label: t("control.finishMatch"), nextStatus: "finished", eventType: "match_finished", variant: "outline" },
          { label: t("control.startExtraTime"), nextStatus: "extra_time", eventType: "extra_time_start", variant: "brand" },
          { label: t("control.startShootout"), nextStatus: "penalty_shootout", eventType: "penalty_shootout_start", variant: "outline" },
        ];
      }
      // After first half
      return [{ label: t("control.startSecondHalf"), nextStatus: "live_second", eventType: "second_half_start", variant: "brand", nextPart: 2 }];
    case "live_second":
      return [
        { label: t("control.endSecondHalf"), nextStatus: "half_time", eventType: "full_time", variant: "outline", nextPart: 2 },
        { label: t("control.finishMatch"), nextStatus: "finished", eventType: "match_finished", variant: "destructive", nextPart: 2 },
      ];
    case "extra_time":
      return [
        { label: t("control.endExtraTime"), nextStatus: "half_time", eventType: "extra_time_end", variant: "outline", nextPart: 3 },
        { label: t("control.finishMatch"), nextStatus: "finished", eventType: "match_finished", variant: "destructive" },
      ];
    case "penalty_shootout":
      return [{ label: t("control.finishMatch"), nextStatus: "finished", eventType: "match_finished", variant: "brand" }];
    default:
      return [];
  }
}
