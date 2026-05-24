"use client";

import { useEffect, useRef, useState } from "react";
import { collection, doc, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { db } from "@/lib/firebase";
import { EventFeedItem } from "./EventFeedItem";
import type { Match, MatchEvent } from "@/types";

interface Props {
  match: Match;
  newestFirst?: boolean;
  onMatchUpdate?: (match: Match) => void;
}

// This is the ONLY component in the app that uses onSnapshot.
// For finished matches it falls back to a one-time getDocs fetch.
export function EventFeed({ match, newestFirst = false, onMatchUpdate }: Props) {
  const t = useTranslations("match");
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Subscribe to events subcollection
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
