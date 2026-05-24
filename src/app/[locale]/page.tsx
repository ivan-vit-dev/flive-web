"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Search, Radio, Zap, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MatchCard } from "@/components/match/MatchCard";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { getPublicMatches } from "@/lib/firebaseServices";
import type { Match, MatchStatus } from "@/types";
import { LIVE_STATUSES } from "@/types";

const FINISHED: MatchStatus[] = ["finished", "cancelled", "postponed"];

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 8000);
    getPublicMatches()
      .then(setMatches)
      .catch((err) => console.error("getPublicMatches:", err))
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const live = filtered.filter((m) => LIVE_STATUSES.includes(m.status));
  const upcoming = filtered.filter((m) => m.status === "scheduled");
  const finishedToday = filtered.filter((m) => {
    if (!FINISHED.includes(m.status)) return false;
    const d = m.scheduledAt?.toDate?.();
    return d != null && d >= today && d < tomorrow;
  });

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

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">

        {/* Search + New match */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-10 h-11 rounded-xl shadow-sm"
              placeholder={t("home.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {user && (
            <Link
              href={`/${locale}/dashboard/match/new`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl gradient-brand text-white px-4 h-11 text-sm font-semibold shadow-md hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              {t("home.newMatch")}
            </Link>
          )}
        </div>

        {/* Live section */}
        {live.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-primary animate-live-pulse shrink-0" />
              <h2 className="text-base font-semibold">{t("home.liveMatches")}</h2>
              <span className="rounded-full gradient-brand text-white px-2.5 py-0.5 text-xs font-bold shadow-sm">
                {live.length}
              </span>
            </div>
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
              {live.map((m, i) => <MatchCard key={m.id} match={m} variant="public" index={i} />)}
            </div>
          </section>
        )}

        {/* Upcoming section */}
        {upcoming.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-semibold">{t("home.upcomingMatches")}</h2>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {upcoming.length}
              </span>
            </div>
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
              {upcoming.map((m, i) => <MatchCard key={m.id} match={m} variant="public" index={i} />)}
            </div>
          </section>
        )}

        {/* Finished today */}
        {finishedToday.length > 0 && (
          <section className="space-y-3">
            {live.length > 0 ? (
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground font-medium px-1">
                  {t("home.finishedToday")}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-semibold">{t("home.finishedMatches")}</h2>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {finishedToday.length}
                </span>
              </div>
            )}
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
              {finishedToday.map((m, i) => <MatchCard key={m.id} match={m} variant="public" index={i} />)}
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
