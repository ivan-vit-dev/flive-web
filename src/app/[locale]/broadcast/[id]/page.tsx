"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Copy, QrCode, Bell, BellOff } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ScoreBoard } from "@/components/match/ScoreBoard";
import { MatchProgress } from "@/components/match/MatchProgress";
import { EventFeed } from "@/components/match/EventFeed";
import { getMatch, incrementViewerCount, decrementViewerCount } from "@/lib/firebaseServices";
import type { Match } from "@/types";
import toast from "react-hot-toast";

export default function BroadcastPage() {
  const t = useTranslations();
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(false);

  const handleNotify = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      setNotifyEnabled((prev) => !prev);
      return;
    }
    const result = await Notification.requestPermission();
    if (result === "granted") {
      setNotifyEnabled(true);
    } else {
      toast.error(t("broadcast.notifyDenied"));
    }
  };

  const matchUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    getMatch(id)
      .then(setMatch)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    incrementViewerCount(id).catch(() => {});
    return () => { decrementViewerCount(id).catch(() => {}); };
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
              {match.status !== "finished" && (
                <Button
                  variant={notifyEnabled ? "default" : "outline"}
                  size="sm"
                  className={notifyEnabled ? "gradient-brand text-white border-0 gap-2" : "gap-2"}
                  onClick={handleNotify}
                  title={notifyEnabled ? t("broadcast.notifyEnabled") : t("broadcast.notifyMe")}
                >
                  {notifyEnabled ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                  <span className="hidden sm:inline">
                    {notifyEnabled ? t("broadcast.notifyEnabled") : t("broadcast.notifyMe")}
                  </span>
                </Button>
              )}
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
        <EventFeed match={match} newestFirst notifyOnEvents={notifyEnabled} onMatchUpdate={handleMatchUpdate} />
      </div>
    </>
  );
}
