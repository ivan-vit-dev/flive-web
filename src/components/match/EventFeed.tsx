"use client";

import { useEffect, useRef, useState } from "react";
import { collection, doc, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { db } from "@/lib/firebase";
import { EventFeedItem } from "./EventFeedItem";
import type { Match, MatchEvent } from "@/types";

const NOTIFY_TYPES = new Set(["goal", "own_goal", "penalty_scored", "red_card", "second_yellow", "match_finished"]);

interface Props {
  match: Match;
  newestFirst?: boolean;
  notifyOnEvents?: boolean;
  onMatchUpdate?: (match: Match) => void;
}

// This is the ONLY component in the app that uses onSnapshot.
// For finished matches it falls back to a one-time getDocs fetch.
export function EventFeed({ match, newestFirst = false, notifyOnEvents = false, onMatchUpdate }: Props) {
  const t = useTranslations("match");
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number>(-1);

  // Subscribe to events subcollection
  useEffect(() => {
    const q = query(
      collection(db, "matches", match.id, "events"),
      orderBy("createdAt", "asc")
    );

    if (match.status === "finished") {
      getDocs(q).then((snap) => {
        const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MatchEvent));
        prevCountRef.current = fetched.length;
        setEvents(fetched);
      });
      return;
    }

    const unsubscribe = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MatchEvent));

      // Fire browser notifications for new significant events
      if (notifyOnEvents && prevCountRef.current >= 0 && fetched.length > prevCountRef.current) {
        const newEvents = fetched.slice(prevCountRef.current);
        newEvents.forEach((e) => {
          if (!NOTIFY_TYPES.has(e.type)) return;
          if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
          const team = e.team === "home" ? match.homeTeam : e.team === "away" ? match.awayTeam : "";
          const body = [e.playerName, team].filter(Boolean).join(" · ");
          new Notification(`${match.homeTeam} ${match.homeScore}–${match.awayScore} ${match.awayTeam}`, {
            body: body || undefined,
            icon: "/icon-192.png",
          });
        });
      }
      prevCountRef.current = fetched.length;
      setEvents(fetched);
    });

    return unsubscribe;
  }, [match.id, match.status, match.homeTeam, match.awayTeam, match.homeScore, match.awayScore, notifyOnEvents]);

  // Subscribe to the match document for live score/status updates.
  // Only runs when a caller provides onMatchUpdate — keeps all onSnapshot calls in this file.
  useEffect(() => {
    if (!onMatchUpdate) return;
    const matchRef = doc(db, "matches", match.id);
    const unsub = onSnapshot(matchRef, (snap) => {
      if (snap.exists()) {
        onMatchUpdate({ id: snap.id, ...snap.data() } as Match);
      }
    });
    return unsub;
  }, [match.id, onMatchUpdate]);

  useEffect(() => {
    if (newestFirst) {
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [events, newestFirst]);

  if (events.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        {match.status === "scheduled" ? t("waitingForStart") : t("noEvents")}
      </div>
    );
  }

  const displayEvents = newestFirst ? [...events].reverse() : events;

  return (
    <div className="rounded-xl border bg-card">
      <div ref={topRef} />
      <ul className="p-1.5 space-y-0.5">
        {displayEvents.map((event, idx) => (
          <EventFeedItem
            key={event.id}
            event={event}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            index={idx}
          />
        ))}
      </ul>
      <div ref={bottomRef} />
    </div>
  );
}
