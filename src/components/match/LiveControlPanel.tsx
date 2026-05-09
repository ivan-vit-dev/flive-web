"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Settings, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventBadge } from "./EventBadge";
import { EventForm } from "@/components/forms/EventForm";
import { addMatchEvent, updateMatchStatus, writeMatchSummary, getMatchEvents } from "@/lib/firebaseServices";
import { getBroadcastSession, setBroadcastSession, clearBroadcastSession } from "@/lib/utils";
import type { Match, MatchEvent, MatchEventType, MatchStatus, BroadcastSession, PendingEvent } from "@/types";
import { EVENT_GROUPS, TIMELINE_EVENTS } from "@/types";
import toast from "react-hot-toast";

// Events that require extra details via dialog
const COMPLEX_EVENTS: MatchEventType[] = [
  "goal", "own_goal", "yellow_card", "second_yellow", "red_card",
  "substitution", "penalty_kick", "penalty_scored", "penalty_missed",
  "penalty_awarded", "injury", "foul", "var_review", "var_goal_disallowed",
  "var_goal_confirmed", "custom_note", "injury_time_announced",
];

interface Props {
  match: Match;
  onMatchUpdated: () => void;
}

export function LiveControlPanel({ match, onMatchUpdated }: Props) {
  const t = useTranslations();
  const [isOnline, setIsOnline] = useState(typeof window !== "undefined" ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const [minute, setMinute] = useState(match.currentMinute);
  const [selectedEventType, setSelectedEventType] = useState<MatchEventType | null>(null);
  const [showEventConfig, setShowEventConfig] = useState(false);

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
  }, []);

  // Write session to localStorage on mount
  useEffect(() => {
    const existing = getBroadcastSession();
    if (!existing || existing.matchId !== match.id) {
      setBroadcastSession({ matchId: match.id, pendingEvents: [] } satisfies BroadcastSession);
    } else {
      setPendingCount(existing.pendingEvents?.length ?? 0);
    }
  }, [match.id]);

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
    setBroadcastSession({ matchId: match.id, pendingEvents: [] });
    setPendingCount(0);
    toast.success(t("control.syncSuccess"));
    onMatchUpdated();
  }, [match.id, t, onMatchUpdated]);

  const logEvent = async (eventData: Omit<MatchEvent, "id" | "createdAt" | "updatedAt">) => {
    if (isOnline) {
      try {
        await addMatchEvent(match.id, eventData);
        onMatchUpdated();
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

  const handleSimpleEvent = async (type: MatchEventType) => {
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
    });
  };

  const handlePhaseChange = async (status: MatchStatus, eventType: MatchEventType) => {
    await updateMatchStatus(match.id, status, { currentMinute: minute });
    await handleSimpleEvent(eventType);
    if (status === "finished") {
      const events = await getMatchEvents(match.id);
      await writeMatchSummary(match.id, events, match);
      clearBroadcastSession();
    }
    onMatchUpdated();
  };

  const phaseButtons = getPhaseButtons(match.status, t);

  return (
    <div className="space-y-4">
      {/* Offline banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>{t("control.offlineWarning")}</span>
          {pendingCount > 0 && (
            <span className="ml-auto font-medium">
              {t("control.pendingEvents", { count: pendingCount })}
            </span>
          )}
        </div>
      )}

      {/* Minute control */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium whitespace-nowrap">{t("control.minuteLabel")}:</label>
        <Input
          type="number"
          min={0}
          max={150}
          value={minute}
          onChange={(e) => setMinute(Number(e.target.value))}
          className="w-20"
        />
      </div>

      {/* Phase controls */}
      {phaseButtons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {phaseButtons.map((btn) => (
            <Button
              key={btn.label}
              variant={btn.primary ? "default" : "outline"}
              size="sm"
              onClick={() => handlePhaseChange(btn.nextStatus, btn.eventType)}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      )}

      {/* Event grid */}
      {match.status !== "scheduled" && match.status !== "finished" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Events</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowEventConfig(!showEventConfig)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {Object.entries(EVENT_GROUPS).map(([group, types]) => {
            const visible = types.filter((type) => match.enabledEventTypes.includes(type));
            if (visible.length === 0) return null;
            return (
              <div key={group}>
                <p className="text-xs text-muted-foreground mb-1.5">
                  {t(`control.eventGroups.${group}` as Parameters<typeof t>[0])}
                </p>
                <div className="flex flex-wrap gap-2">
                  {visible.map((type) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() =>
                        COMPLEX_EVENTS.includes(type)
                          ? setSelectedEventType(type)
                          : handleSimpleEvent(type)
                      }
                    >
                      <EventBadge type={type} size="sm" />
                      {t(`events.${type}` as Parameters<typeof t>[0])}
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
    </div>
  );
}

interface PhaseButton {
  label: string;
  nextStatus: MatchStatus;
  eventType: MatchEventType;
  primary: boolean;
}

function getPhaseButtons(status: MatchStatus, t: ReturnType<typeof useTranslations>): PhaseButton[] {
  switch (status) {
    case "scheduled":
      return [{ label: t("control.startMatch"), nextStatus: "live_first", eventType: "match_start", primary: true }];
    case "live_first":
      return [{ label: t("control.endFirstHalf"), nextStatus: "half_time", eventType: "first_half_end", primary: false }];
    case "half_time":
      return [{ label: t("control.startSecondHalf"), nextStatus: "live_second", eventType: "second_half_start", primary: true }];
    case "live_second":
      return [
        { label: t("control.endMatch"), nextStatus: "finished", eventType: "match_finished", primary: false },
        { label: t("control.startExtraTime"), nextStatus: "extra_time", eventType: "extra_time_start", primary: false },
      ];
    case "extra_time":
      return [
        { label: t("control.endExtraTime"), nextStatus: "finished", eventType: "match_finished", primary: false },
        { label: t("control.startShootout"), nextStatus: "penalty_shootout", eventType: "penalty_shootout_start", primary: false },
      ];
    case "penalty_shootout":
      return [{ label: t("control.finishMatch"), nextStatus: "finished", eventType: "match_finished", primary: true }];
    default:
      return [];
  }
}
