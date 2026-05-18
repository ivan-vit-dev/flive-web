"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ScoreBoard } from "@/components/match/ScoreBoard";
import { MatchProgress } from "@/components/match/MatchProgress";
import { LiveControlPanel } from "@/components/match/LiveControlPanel";
import { getMatch } from "@/lib/firebaseServices";
import type { Match } from "@/types";

export default function MatchControlPage() {
  const t = useTranslations();
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveSeconds, setLiveSeconds] = useState<number | undefined>(undefined);

  const reload = useCallback(() => {
    getMatch(id).then(setMatch);
  }, [id]);

  useEffect(() => {
    getMatch(id)
      .then(setMatch)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!match) {
    return <p className="text-center py-16 text-muted-foreground">{t("common.noData")}</p>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ScoreBoard match={match} liveSeconds={liveSeconds} />
      <MatchProgress match={match} />
      <LiveControlPanel match={match} onMatchUpdated={reload} onSecondsChange={setLiveSeconds} />
    </div>
  );
}
