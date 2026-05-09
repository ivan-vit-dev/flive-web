"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Radio, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MatchCard } from "@/components/match/MatchCard";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { getPublicMatches } from "@/lib/firebaseServices";
import type { Match, MatchStatus } from "@/types";
import { LIVE_STATUSES } from "@/types";

const FINISHED: MatchStatus[] = ["finished", "cancelled", "postponed"];

export default function HomePage() {
  const t = useTranslations();
  const [matches, setMatches] = useState<Match[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 8000);
    getPublicMatches()
      .then(setMatches)
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer);
        setLoading(false);
      });
  }, []);

  const filtered = matches.filter(
    (m) =>
      !search ||
      m.homeTeam.toLowerCase().includes(search.toLowerCase()) ||
      m.awayTeam.toLowerCase().includes(search.toLowerCase())
  );

  const live = filtered.filter((m) => LIVE_STATUSES.includes(m.status));
  const upcoming = filtered.filter((m) => m.status === "scheduled");
  const finished = filtered.filter((m) => FINISHED.includes(m.status));

  if (loading) {
    return (
      <>
        <PublicHeader />
        <div className="flex h-64 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </>
    );
  }

  return (
    <>
      <PublicHeader />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 gradient-hero" />
        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-3.5 py-1.5 text-sm font-medium text-muted-foreground shadow-sm mb-5">
            <Radio className="h-3.5 w-3.5 text-primary" />
            {t("home.subtitle")}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t("home.title")}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-10">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-10 h-11 rounded-xl shadow-sm"
            placeholder={t("home.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Live section */}
        {live.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-primary animate-live-pulse shrink-0" />
              <h2 className="text-base font-semibold">{t("home.liveMatches")}</h2>
              <span className="rounded-full gradient-brand text-white px-2.5 py-0.5 text-xs font-bold shadow-sm">
                {live.length}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {live.map((m) => <MatchCard key={m.id} match={m} variant="public" />)}
            </div>
          </section>
        )}

        {/* Upcoming section */}
        {upcoming.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-semibold">{t("home.upcomingMatches")}</h2>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {upcoming.length}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((m) => <MatchCard key={m.id} match={m} variant="public" />)}
            </div>
          </section>
        )}

        {/* Finished section */}
        {finished.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-semibold">{t("home.finishedMatches")}</h2>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {finished.length}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {finished.map((m) => <MatchCard key={m.id} match={m} variant="public" />)}
            </div>
          </section>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Zap className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">{t("home.noLive")}</p>
              <p className="text-sm text-muted-foreground">{t("home.subtitle")}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
