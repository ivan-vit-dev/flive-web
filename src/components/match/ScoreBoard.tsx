import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { MatchStatusBadge } from "./MatchStatusBadge";
import type { Match, MatchStatus } from "@/types";
import { LIVE_STATUSES } from "@/types";

const RUNNING_STATUSES: MatchStatus[] = ["live_first", "live_second", "extra_time", "live_part"];

function computeSeconds(m: Match): number {
  const base = m.currentMinute * 60;
  if (!RUNNING_STATUSES.includes(m.status) || !m.currentMinuteAt) return base;
  const elapsed = Math.floor((Date.now() - m.currentMinuteAt.toDate().getTime()) / 1000);
  return base + elapsed;
}

export function ScoreBoard({ match, liveSeconds }: { match: Match; liveSeconds?: number }) {
  const t = useTranslations("match");
  const isLive = LIVE_STATUSES.includes(match.status);
  const isRunning = RUNNING_STATUSES.includes(match.status);

  const [seconds, setSeconds] = useState(() => liveSeconds ?? computeSeconds(match));

  useEffect(() => {
    if (liveSeconds !== undefined) {
      setSeconds(liveSeconds);
    } else {
      setSeconds(computeSeconds(match));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveSeconds, match.currentMinute, match.status]);

  useEffect(() => {
    if (liveSeconds !== undefined) return;
    if (!isRunning) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [liveSeconds, isRunning]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="rounded-xl border bg-card p-6 text-center space-y-3">
      <div className="flex items-center justify-center gap-2">
        <MatchStatusBadge status={match.status} />
        {isLive && seconds > 0 && (
          <span className="text-sm text-muted-foreground font-mono">
            {mm}:{ss}
          </span>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        <span className="text-lg font-semibold w-32 text-right truncate">{match.homeTeam}</span>
        <div className="flex items-center gap-2">
          <span className="text-5xl font-bold tabular-nums">{match.homeScore}</span>
          <span className="text-3xl text-muted-foreground">:</span>
          <span className="text-5xl font-bold tabular-nums">{match.awayScore}</span>
        </div>
        <span className="text-lg font-semibold w-32 text-left truncate">{match.awayTeam}</span>
      </div>

      {match.status === "penalty_shootout" && (
        <p className="text-sm text-muted-foreground">
          {t("shootoutScore", {
            home: match.homeShootoutScore,
            away: match.awayShootoutScore,
          })}
        </p>
      )}

      {match.competition && (
        <p className="text-xs text-muted-foreground">{match.competition}</p>
      )}
      {match.venue && (
        <p className="text-xs text-muted-foreground">{match.venue}</p>
      )}
      {match.description && (
        <p className="text-sm text-muted-foreground border-t border-border pt-3 mt-1">{match.description}</p>
      )}
    </div>
  );
}
