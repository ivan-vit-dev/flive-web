import { useTranslations } from "next-intl";
import { MatchStatusBadge } from "./MatchStatusBadge";
import type { Match } from "@/types";
import { LIVE_STATUSES } from "@/types";

export function ScoreBoard({ match }: { match: Match }) {
  const t = useTranslations("match");
  const isLive = LIVE_STATUSES.includes(match.status);

  return (
    <div className="rounded-xl border bg-card p-6 text-center space-y-3">
      <div className="flex items-center justify-center gap-2">
        <MatchStatusBadge status={match.status} />
        {isLive && match.currentMinute > 0 && (
          <span className="text-sm text-muted-foreground font-mono">
            {match.currentMinute}&apos;
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
    </div>
  );
}
