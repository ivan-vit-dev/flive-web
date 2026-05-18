"use client";

import { useEffect, useRef, useState } from "react";
import { collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { db } from "@/lib/firebase";
import { EventBadge } from "./EventBadge";
import { EventFeedItem } from "./EventFeedItem";
import { formatMinute } from "@/lib/utils";
import type { Match, MatchEvent } from "@/types";
import { TIMELINE_EVENTS } from "@/types";

interface Props {
  match: Match;
  variant?: "feed" | "broadcast";
}

// This is the ONLY component in the app that uses onSnapshot.
// For finished matches it falls back to a one-time getDocs fetch.
export function EventFeed({ match, variant = "feed" }: Props) {
  const t = useTranslations("match");
  const tEvents = useTranslations("events");
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, "matches", match.id, "events"),
      orderBy("createdAt", "asc")
    );

    if (match.status === "finished") {
      getDocs(q).then((snap) => {
        setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MatchEvent)));
      });
      return;
    }

    const unsubscribe = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MatchEvent)));
    });

    return unsubscribe;
  }, [match.id, match.status]);

  // Auto-scroll to latest event
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        {match.status === "scheduled" ? t("waitingForStart") : t("noEvents")}
      </div>
    );
  }

  if (variant === "broadcast") {
    return (
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Team headers */}
        <div className="grid grid-cols-[1fr_3rem_1fr] gap-1 px-4 py-3 border-b bg-muted">
          <p className="text-sm font-semibold truncate">{match.homeTeam}</p>
          <div />
          <p className="text-sm font-semibold text-right truncate">{match.awayTeam}</p>
        </div>

        <ul className="divide-y px-4">
          {events.map((event) => {
            const isTimeline = TIMELINE_EVENTS.includes(event.type);

            if (isTimeline) {
              return (
                <li key={event.id} className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                  <div className="h-px flex-1 bg-border" />
                  <EventBadge type={event.type} size="sm" />
                  <span className="font-medium">{tEvents(event.type as Parameters<typeof tEvents>[0])}</span>
                  <div className="h-px flex-1 bg-border" />
                </li>
              );
            }

            return (
              <li key={event.id} className="grid grid-cols-[1fr_3rem_1fr] items-start gap-1 py-1.5">
                {/* Home cell — right-aligned */}
                <div>
                  {event.team === "home" && (
                    <div className="flex items-start justify-end gap-1.5 text-right">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{tEvents(event.type as Parameters<typeof tEvents>[0])}</p>
                        {event.playerName && (
                          <p className="text-xs text-muted-foreground">{event.playerName}</p>
                        )}
                      </div>
                      <EventBadge type={event.type} size="sm" />
                    </div>
                  )}
                </div>

                {/* Centre — minute, or full neutral event */}
                <div className="flex flex-col items-center justify-center gap-0.5 pt-0.5">
                  {event.team !== null ? (
                    <span className="text-xs text-muted-foreground font-mono tabular-nums">
                      {formatMinute(event.minute, event.addedTime)}
                    </span>
                  ) : (
                    <>
                      <EventBadge type={event.type} size="sm" />
                      <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                        {formatMinute(event.minute, event.addedTime)}
                      </span>
                      <p className="text-xs text-center leading-tight">
                        {tEvents(event.type as Parameters<typeof tEvents>[0])}
                      </p>
                    </>
                  )}
                </div>

                {/* Away cell — left-aligned */}
                <div>
                  {event.team === "away" && (
                    <div className="flex items-start gap-1.5">
                      <EventBadge type={event.type} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{tEvents(event.type as Parameters<typeof tEvents>[0])}</p>
                        {event.playerName && (
                          <p className="text-xs text-muted-foreground">{event.playerName}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <div ref={bottomRef} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <ul className="divide-y px-4">
        {events.map((event) => (
          <EventFeedItem
            key={event.id}
            event={event}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
          />
        ))}
      </ul>
      <div ref={bottomRef} />
    </div>
  );
}
