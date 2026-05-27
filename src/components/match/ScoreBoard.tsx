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

export function ScoreBoard({ match, liveSeconds, liveVariant }: { match: Match; liveSeconds?: number; liveVariant?: "red" }) {
  const t = useTranslations("match");
  const isLive = LIVE_STATUSES.includes(match.status);
  const isRunning = RUNNING_STATUSES.includes(match.status);

  const [seconds, setSeconds] = useState(() => liveSeconds ?? computeSeconds(match));

  // Re-sync whenever the reporter pushes a clock update to Firestore (every 30 s).
  // currentMinuteAtMs changes on every updateMatchClock write, triggering a correction.
  const currentMinuteAtMs = match.currentMinuteAt?.toMillis() ?? 0;
  useEffect(() => {
    if (liveSeconds !== undefined) {
      setSeconds(liveSeconds);
    } else {
      setSeconds(computeSeconds(match));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveSeconds, match.currentMinute, match.status, currentMinuteAtMs]);

  useEffect(() => {
    if (liveSeconds !== undefined) return;
    if (!isRunning) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [liveSeconds, isRunning]);

  const partDuration = match.partDuration ?? 45;
  const currentPart = match.currentPart ?? 1;
  const CAPPED_STATUSES: MatchStatus[] = ["live_first", "live_second", "live_part"];
  const isRunningPart = CAPPED_STATUSES.includes(match.status);
  const partEndSecs = currentPart * partDuration * 60;
  const clampedSecs = isRunningPart ? Math.min(seconds, partEndSecs) : seconds;
  const extraSecs   = isRunningPart ? Math.max(0, seconds - partEndSecs) : 0;
  const mm = String(Math.floor(clampedSecs / 60)).padStart(2, "0");
  const ss = String(clampedSecs % 60).padStart(2, "0");
  const exMm = Math.floor(extraSecs / 60);
  const exSs = String(extraSecs % 60).padStart(2, "0");

  return (
    <div className="rounded-xl border bg-card p-6 text-center space-y-3">
      <div className="flex items-center justify-center gap-2">
        <MatchStatusBadge
          status={match.status}
          afterLastPart={
            (match.status === "half_time" && (match.currentPart ?? 1) >= 2) ||
            (match.status === "break" && (match.currentPart ?? 0) >= (match.parts ?? 2))
          }
          liveVariant={liveVariant}
        />
        {isLive && seconds > 0 && (
          <span className="text-sm text-muted-foreground font-mono">
            {mm}:{ss}{extraSecs > 0 && ` +${exMm > 0 ? `${exMm}:` : ""}${exSs}`}
          </span>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        <span className="text-lg font-semibold flex-1 min-w-0 text-right">{match.homeTeam}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-5xl font-bold tabular-nums">{match.homeScore}</span>
          <span className="text-3xl text-muted-foreground">:</span>
          <span className="text-5xl font-bold tabular-nums">{match.awayScore}</span>
        </div>
        <span className="text-lg font-semibold flex-1 min-w-0 text-left">{match.awayTeam}</span>
      </div>

      {(match.status === "penalty_shootout" || match.homeShootoutScore > 0 || match.awayShootoutScore > 0) && (
        <div className="border-t border-border pt-3 space-y-1">
          <p className="text-xs text-muted-foreground">{t("penaltyShoots")}</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold tabular-nums">{match.homeShootoutScore}</span>
            <span className="text-lg text-muted-foreground">:</span>
            <span className="text-2xl font-bold tabular-nums">{match.awayShootoutScore}</span>
          </div>
        </div>
      )}

      {(match.competition || match.venue) && (
        <p className="text-xs text-muted-foreground">
          {[match.competition, match.venue].filter(Boolean).join(" · ")}
        </p>
      )}
      {match.description && (
        <div className="text-sm text-muted-foreground border-t border-border pt-3 mt-1 space-y-0.5">
          {match.description.split("\n").filter(l => l.trim()).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}
