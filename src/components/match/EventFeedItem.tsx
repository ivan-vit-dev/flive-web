import { useTranslations } from "next-intl";
import { EventBadge } from "./EventBadge";
import { formatMinute } from "@/lib/utils";
import type { MatchEvent } from "@/types";
import { TIMELINE_EVENTS } from "@/types";

interface Props {
  event: MatchEvent;
  homeTeam: string;
  awayTeam: string;
}

export function EventFeedItem({ event, homeTeam, awayTeam }: Props) {
  const t = useTranslations("events");
  const isTimeline = TIMELINE_EVENTS.includes(event.type);

  if (isTimeline) {
    return (
      <li className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        <EventBadge type={event.type} size="sm" />
        <span className="font-medium">{t(event.type as Parameters<typeof t>[0])}</span>
        <div className="h-px flex-1 bg-border" />
      </li>
    );
  }

  const teamLabel = event.team === "home" ? homeTeam : event.team === "away" ? awayTeam : null;

  return (
    <li className="flex items-start gap-3 py-2">
      <span className="w-10 shrink-0 text-right text-xs text-muted-foreground font-mono pt-0.5">
        {formatMinute(event.minute, event.addedTime)}
      </span>
      <EventBadge type={event.type} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">
          {t(event.type as Parameters<typeof t>[0])}
          {teamLabel && <span className="ml-1 text-muted-foreground">({teamLabel})</span>}
        </p>
        {event.playerName && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {event.playerName}
            {event.assistName && <span> · {event.assistName}</span>}
            {event.playerOutName && <span> ⇄ {event.playerOutName}</span>}
          </p>
        )}
        {event.description && (
          <p className="text-xs text-muted-foreground mt-0.5 italic">{event.description}</p>
        )}
        {event.shootoutResult && (
          <p className={`text-xs font-medium mt-0.5 ${
            event.shootoutResult === "scored" ? "text-primary" : "text-destructive"
          }`}>
            {event.shootoutResult === "scored" ? "✓ Scored" : event.shootoutResult === "saved" ? "✗ Saved" : "✗ Missed"}
          </p>
        )}
      </div>
    </li>
  );
}
