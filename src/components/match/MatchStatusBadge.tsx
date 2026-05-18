import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MatchStatus } from "@/types";

const STATUS_STYLES: Record<MatchStatus, string> = {
  scheduled: "bg-secondary text-secondary-foreground",
  live_first: "bg-amber text-amber-foreground",
  half_time: "bg-secondary text-secondary-foreground",
  live_second: "bg-amber text-amber-foreground",
  extra_time: "bg-amber text-amber-foreground",
  penalty_shootout: "bg-amber text-amber-foreground",
  finished: "border border-border bg-transparent text-muted-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
  postponed: "bg-secondary text-secondary-foreground",
  live_part: "bg-amber text-amber-foreground",
  break: "bg-secondary text-secondary-foreground",
};

const LIVE_STATUSES: MatchStatus[] = ["live_first", "live_second", "extra_time", "penalty_shootout", "live_part"];

export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  const t = useTranslations("match");
  const isLive = LIVE_STATUSES.includes(status);

  const label = {
    scheduled: t("scheduled"),
    live_first: t("liveNow"),
    half_time: t("halfTime"),
    live_second: t("liveNow"),
    extra_time: t("extraTime"),
    penalty_shootout: t("penaltyShootout"),
    finished: t("finished"),
    cancelled: t("cancelled"),
    postponed: t("postponed"),
    live_part: t("liveNow"),
    break: t("halfTime"),
  }[status];

  return (
    <Badge className={cn("gap-1.5 font-semibold text-xs tracking-wide", STATUS_STYLES[status])}>
      {isLive && (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-live-pulse" />
      )}
      {label}
    </Badge>
  );
}
