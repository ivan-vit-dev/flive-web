"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Plus, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchCard } from "@/components/match/MatchCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { getReporterMatches } from "@/lib/firebaseServices";
import { getBroadcastSession } from "@/lib/utils";
import type { Match } from "@/types";
import { LIVE_STATUSES } from "@/types";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getReporterMatches(user.uid)
      .then(setMatches)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    const session = getBroadcastSession();
    if (session?.pendingEvents?.length > 0) {
      toast(
        `You have an interrupted broadcast session with ${session.pendingEvents.length} unsent events. Open the match to sync.`,
        { duration: 8000 }
      );
    }
  }, []);

  const live = matches.filter((m) => LIVE_STATUSES.includes(m.status));
  const upcoming = matches.filter((m) => m.status === "scheduled");
  const finished = matches.filter((m) => ["finished", "cancelled", "postponed"].includes(m.status));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">{t("dashboard.title")}</h1>
        <Link
          href={`/${locale}/dashboard/match/new`}
          className={cn(buttonVariants({ size: "lg" }), "gradient-brand text-white border-0 shadow-md hover:opacity-90 transition-opacity gap-1.5")}
        >
          <Plus className="h-4 w-4" />
          {t("dashboard.newMatch")}
        </Link>
      </div>

      <Tabs defaultValue="live">
        <TabsList className="w-full">
          <TabsTrigger value="live" className="flex-1 gap-2">
            {live.length > 0 && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-live-pulse" />
            )}
            {t("dashboard.live")}
            {live.length > 0 && (
              <span className="rounded-full bg-primary text-primary-foreground px-1.5 py-0.5 text-[10px] font-bold leading-none">
                {live.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-1">{t("dashboard.upcoming")}</TabsTrigger>
          <TabsTrigger value="finished" className="flex-1">{t("dashboard.finished")}</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <TabsContent value="live" className="mt-4">
              {live.length === 0 ? (
                <EmptyState message={t("dashboard.noLive")} />
              ) : (
                <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                  {live.map((m, i) => <MatchCard key={m.id} match={m} variant="reporter" index={i} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="mt-4">
              {upcoming.length === 0 ? (
                <EmptyState message={t("dashboard.noUpcoming")} />
              ) : (
                <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                  {upcoming.map((m, i) => <MatchCard key={m.id} match={m} variant="reporter" index={i} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="finished" className="mt-4">
              {finished.length === 0 ? (
                <EmptyState message={t("dashboard.noFinished")} />
              ) : (
                <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                  {finished.map((m, i) => <MatchCard key={m.id} match={m} variant="reporter" index={i} />)}
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
        <Zap className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
