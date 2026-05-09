import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Trophy, Calendar } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { MatchStatusBadge } from "./MatchStatusBadge";
import { cn } from "@/lib/utils";
import type { Match } from "@/types";
import { LIVE_STATUSES } from "@/types";

interface Props {
  match: Match;
  variant: "public" | "reporter";
}

export function MatchCard({ match, variant }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const isLive = LIVE_STATUSES.includes(match.status);

  const scheduled = match.scheduledAt?.toDate?.();
  const dateStr = scheduled
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(scheduled)
    : null;

  return (
    <Card className={cn(
      "flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5",
      isLive
        ? "border-border shadow-card-live hover:shadow-glow"
        : "hover:shadow-md"
    )}>
      {/* Top accent bar for live matches */}
      {isLive && (
        <div className="h-0.5 w-full gradient-brand" />
      )}

      <CardContent className="pt-4 pb-2 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <MatchStatusBadge status={match.status} />
          {match.competition && (
            <span className="text-xs text-muted-foreground flex items-center gap-1 min-w-0 truncate">
              <Trophy className="h-3 w-3 shrink-0" />
              {match.competition}
            </span>
          )}
        </div>

        {/* Teams & score */}
        <div className="flex items-center gap-2">
          <div className="flex-1 text-right">
            <p className="font-semibold leading-snug text-sm">{match.homeTeam}</p>
          </div>

          <div className={cn(
            "flex flex-col items-center justify-center rounded-xl px-3 py-1.5 min-w-[4.5rem]",
            isLive ? "bg-secondary" : "bg-muted"
          )}>
            <p className={cn(
              "text-xl font-bold tabular-nums leading-tight",
              isLive && "gradient-text"
            )}>
              {match.homeScore} : {match.awayScore}
            </p>
            {match.status === "penalty_shootout" && (
              <p className="text-[10px] text-muted-foreground leading-tight">
                pen. {match.homeShootoutScore} : {match.awayShootoutScore}
              </p>
            )}
          </div>

          <div className="flex-1">
            <p className="font-semibold leading-snug text-sm">{match.awayTeam}</p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          {match.venue && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 shrink-0" />
              {match.venue}
            </span>
          )}
          {dateStr && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 shrink-0" />
              {dateStr}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-4 gap-2">
        {variant === "public" && (
          <Link
            href={`/${locale}/match/${match.id}`}
            className={cn(
              "w-full justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-opacity text-center",
              isLive
                ? "gradient-brand text-white shadow-sm hover:opacity-90"
                : cn(buttonVariants({ size: "sm" }), "w-full justify-center")
            )}
          >
            {t("match.viewMatch")}
          </Link>
        )}
        {variant === "reporter" && (
          <>
            <Link
              href={`/${locale}/dashboard/match/${match.id}/edit`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 justify-center")}
            >
              {t("dashboard.editMatch")}
            </Link>
            <Link
              href={`/${locale}/dashboard/match/${match.id}`}
              className={cn(
                "flex-1 justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-opacity text-center",
                isLive
                  ? "gradient-brand text-white shadow-sm hover:opacity-90"
                  : cn(buttonVariants({ size: "sm" }), "flex-1 justify-center")
              )}
            >
              {t("dashboard.openControl")}
            </Link>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
