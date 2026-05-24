"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Copy, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ScoreBoard } from "@/components/match/ScoreBoard";
import { MatchProgress } from "@/components/match/MatchProgress";
import { EventFeed } from "@/components/match/EventFeed";
import { getMatch } from "@/lib/firebaseServices";
import type { Match } from "@/types";
import toast from "react-hot-toast";

export default function BroadcastPage() {
  const t = useTranslations();
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);

  const matchUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    getMatch(id)
      .then(setMatch)
      .finally(() => setLoading(false));
  }, [id]);

  // Stable callback — EventFeed calls this whenever the match doc updates in Firestore,
  // keeping score, status, and timer in sync without polling.
  const handleMatchUpdate = useCallback((updated: Match) => {
    setMatch(updated);
  }, []);

  const copyLink = async () => {
    await navigator.clipboard.writeText(matchUrl);
    toast.success(t("common.linkCopied"));
  };

  if (loading) {
    return (
      <>
        <PublicHeader />
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </>
    );
  }

  if (!match) {
    return (
      <>
        <PublicHeader />
        <p className="text-center py-16 text-muted-foreground">{t("common.noData")}</p>
      </>
    );
  }

  return (
    <>
      <PublicHeader />
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-muted-foreground">{t("broadcast.shareWith")}</p>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                className="gradient-brand text-white shadow-sm hover:opacity-90 transition-opacity gap-2"
                onClick={copyLink}
              >
                <Copy className="h-4 w-4" />
                {t("common.copyLink")}
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowQr(!showQr)}>
                <QrCode className="h-4 w-4" />
                QR
              </Button>
            </div>
          </div>
          {showQr && (
            <div className="flex justify-center pt-1 pb-2">
              <QRCodeSVG value={matchUrl} size={180} />
            </div>
          )}
        </div>

        <ScoreBoard match={match} liveVariant="red" />
        <MatchProgress match={match} />
        <EventFeed match={match} newestFirst onMatchUpdate={handleMatchUpdate} />
      </div>
    </>
  );
}
