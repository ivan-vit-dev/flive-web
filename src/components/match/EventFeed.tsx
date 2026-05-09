"use client";

import { useEffect, useRef, useState } from "react";
import { collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { db } from "@/lib/firebase";
import { EventFeedItem } from "./EventFeedItem";
import type { Match, MatchEvent } from "@/types";

interface Props {
  match: Match;
}

// This is the ONLY component in the app that uses onSnapshot.
// For finished matches it falls back to a one-time getDocs fetch.
export function EventFeed({ match }: Props) {
  const t = useTranslations("match");
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
