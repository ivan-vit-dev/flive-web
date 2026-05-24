"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { EventBadge } from "./EventBadge";
import { formatMinute } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { MatchEvent } from "@/types";
import { TIMELINE_EVENTS } from "@/types";

interface Props {
  event: MatchEvent;
  homeTeam: string;
  awayTeam: string;
  index?: number;
  onRemove?: (event: MatchEvent) => void;
}

function MinutePill({ minute, addedTime }: { minute: number; addedTime: number | null }) {
  return (
    <span className="inline-flex items-center rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground whitespace-nowrap shrink-0">
      {formatMinute(minute, addedTime)}
    </span>
  );
}

export function EventFeedItem({ event, homeTeam, awayTeam, index = 0, onRemove }: Props) {
  const t = useTranslations("events");
  const tForm = useTranslations("eventForm");
  const isTimeline = TIMELINE_EVENTS.includes(event.type);
  const rowBg = index % 2 === 0 ? "bg-muted" : "";

  const removeBtn = onRemove ? (
    <button
      onClick={() => onRemove(event)}
      className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive-subtle transition-colors"
      aria-label="Remove event"
    >
      <X className="h-4 w-4" />
    </button>
  ) : null;

  const timelineLabel = (() => {
    if (event.type === "part_start" && event.partNumber) return t("part_start_n", { n: event.partNumber });
    if (event.type === "part_end" && event.partNumber) return t("part_end_n", { n: event.partNumber });
    return t(event.type as Parameters<typeof t>[0]);
  })();

  // Structural timeline events — centered, no time, no remove
  if (isTimeline) {
    return (
      <li className="flex items-center justify-center gap-2 px-2 py-2 rounded-lg bg-secondary">
        <EventBadge type={event.type} size="sm" />
        <span className="text-xs font-medium text-secondary-foreground">
          {timelineLabel}
        </span>
      </li>
    );
  }

  // Own goal benefits the opponent — display on the scoring team's side
  const displayTeam = event.type === "own_goal"
    ? (event.team === "home" ? "away" : event.team === "away" ? "home" : null)
    : event.team;

  const teamLabel = event.team === "home" ? homeTeam : event.team === "away" ? awayTeam : null;
  const hasDetails = !!(event.playerName || event.assistName || event.playerOutName || event.description);

  const isHome = displayTeam === "home";
  const isAway = displayTeam === "away";

  const contentAlign = isHome ? "justify-start" : isAway ? "justify-end" : "justify-center";
  const detailsAlign = isHome ? "text-left" : isAway ? "text-right" : "text-center";

  return (
    <li className={cn("px-2 py-1.5 rounded-lg", rowBg)}>
      <div className="flex items-center gap-2">
        <MinutePill minute={event.minute} addedTime={event.addedTime} />
        <div className={cn("flex-1 flex items-center gap-1.5 min-w-0", contentAlign)}>
          <EventBadge type={event.type} />
          <span className="text-sm font-medium leading-tight truncate">
            {t(event.type as Parameters<typeof t>[0])}
            {teamLabel && <span className="ml-1 font-normal text-muted-foreground">· {teamLabel}</span>}
          </span>
        </div>
        {removeBtn}
      </div>
      {hasDetails && (
        <p className={cn("mt-0.5 text-xs text-muted-foreground", detailsAlign)}>
          {event.playerName && <span>{event.playerName}</span>}
          {event.assistName && <span> · {event.assistName}</span>}
          {event.playerOutName && <span> ⇄ {event.playerOutName}</span>}
          {event.description && <span className="italic"> {event.description}</span>}
        </p>
      )}
      {event.shootoutResult && (
        <div className={cn("mt-1 flex items-center gap-1.5", contentAlign)}>
          <span className={cn(
            "inline-flex items-center gap-1.5 text-xs font-semibold",
            event.shootoutResult === "scored" ? "text-green-500" : "text-red-500"
          )}>
            <span className={cn(
              "h-2.5 w-2.5 rounded-full shrink-0",
              event.shootoutResult === "scored" ? "bg-green-500" : "bg-red-500"
            )} />
            {event.shootoutResult === "scored" ? tForm("scored") : tForm("missed")}
          </span>
        </div>
      )}
    </li>
  );
}
