import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MatchStatus } from "@/types";

const STATUS_STYLES: Record<MatchStatus, string> = {
  scheduled: "bg-muted text-muted-foreground",
  live_first: "bg-primary text-primary-foreground",
  half_time: "bg-amber-500 text-white",
  live_second: "bg-primary text-primary-foreground",
  extra_time: "bg-orange-500 text-white",
  penalty_shootout: "bg-orange-600 text-white",
  finished: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
  postponed: "bg-muted text-muted-foreground",
};

const LIVE_STATUSES: MatchStatus[] = ["live_first", "live_second", "extra_time", "penalty_shootout"];

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
