import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight, Settings, Play } from "lucide-react";
import { MatchStatusBadge } from "./MatchStatusBadge";
import { cn } from "@/lib/utils";
import type { Match } from "@/types";
import { LIVE_STATUSES } from "@/types";

interface Props {
  match: Match;
  variant: "public" | "reporter";
  index?: number;
}

export function MatchCard({ match, variant, index = 0 }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const isLive = LIVE_STATUSES.includes(match.status);

  const scheduled = match.scheduledAt?.toDate?.();
  const dateTimeStr = scheduled
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(scheduled)
    : null;

  const inner = (
    <>
      <MatchStatusBadge
        status={match.status}
        afterLastPart={
          (match.status === "half_time" && (match.currentPart ?? 1) >= 2) ||
          (match.status === "break" && (match.currentPart ?? 0) >= (match.parts ?? 2))
        }
      />

      <div className="flex flex-1 items-center gap-2 min-w-0">
        <span className="text-sm font-medium truncate flex-1 text-right">{match.homeTeam}</span>
        <div className={cn(
          "shrink-0 rounded-lg px-2.5 py-0.5 text-sm font-bold tabular-nums text-center",
          isLive ? "bg-secondary" : "bg-muted"
        )}>
          <span className={isLive ? "gradient-text" : undefined}>
            {match.homeScore}:{match.awayScore}
          </span>
          {match.status === "penalty_shootout" && (
            <p className="text-[10px] text-muted-foreground leading-none">
              {match.homeShootoutScore}:{match.awayShootoutScore}
            </p>
          )}
        </div>
        <span className="text-sm font-medium truncate flex-1">{match.awayTeam}</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
        {match.competition && <span className="hidden sm:inline truncate max-w-[130px]">{match.competition}</span>}
        {dateTimeStr && <span className="tabular-nums whitespace-nowrap text-foreground font-medium">{dateTimeStr}</span>}
      </div>
    </>
  );

  const rowBg = index % 2 === 0 ? "bg-card" : "bg-muted";

  if (variant === "public") {
    const href = isLive ? `/${locale}/broadcast/${match.id}` : `/${locale}/match/${match.id}`;
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted",
          rowBg,
          isLive && "border-l-2 border-primary"
        )}
      >
        {inner}
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </Link>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2.5",
      rowBg,
      isLive && "border-l-2 border-primary"
    )}>
      {inner}
      <div className="flex items-center gap-0.5 shrink-0">
        <Link
          href={`/${locale}/dashboard/match/${match.id}/edit`}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          title={t("dashboard.editMatch")}
        >
          <Settings className="h-3.5 w-3.5" />
        </Link>
        <Link
          href={`/${locale}/dashboard/match/${match.id}`}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            isLive
              ? "gradient-brand text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={t("dashboard.openControl")}
        >
          <Play className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
