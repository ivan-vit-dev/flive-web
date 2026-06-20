"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight, Settings, Play, Copy, CopyPlus, Ban } from "lucide-react";
import { MatchStatusBadge } from "./MatchStatusBadge";
import { cn } from "@/lib/utils";
import { duplicateMatch, cancelMatch } from "@/lib/firebaseServices";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import type { Match } from "@/types";
import { LIVE_STATUSES } from "@/types";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  match: Match;
  variant: "public" | "reporter";
  index?: number;
  onRefresh?: () => void;
}

export function MatchCard({ match, variant, index = 0, onRefresh }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const isLive = LIVE_STATUSES.includes(match.status);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const scheduled = match.scheduledAt?.toDate?.();
  const dateTimeStr = scheduled
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(scheduled)
    : null;

  const copyMatchLink = async () => {
    const href = isLive ? `/${locale}/broadcast/${match.id}` : `/${locale}/match/${match.id}`;
    const url = `${window.location.origin}${href}`;
    await navigator.clipboard.writeText(url);
    toast.success(t("common.linkCopied"));
  };

  const handleDuplicate = async () => {
    if (!user) return;
    try {
      const newId = await duplicateMatch(match, user.uid);
      toast.success(t("dashboard.duplicateSuccess"));
      router.push(`/${locale}/dashboard/match/${newId}/edit`);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelMatch(match.id);
      toast.success(t("dashboard.cancelSuccess"));
      setShowCancelDialog(false);
      onRefresh?.();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setCancelling(false);
    }
  };

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
    const isOwner = !!user && user.uid === match.reporterId;
    return (
      <>
        <div className={cn(
          "flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted",
          rowBg,
          isLive && "border-l-2 border-primary"
        )}>
          <Link href={href} className="flex flex-1 items-center gap-3 min-w-0">
            {inner}
          </Link>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={copyMatchLink}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              title={t("common.copyLink")}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            {isOwner && match.status === "scheduled" && (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                title={t("dashboard.cancelMatch")}
              >
                <Ban className="h-3.5 w-3.5" />
              </button>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {isOwner && (
          <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>{t("dashboard.cancelConfirmTitle")}</DialogTitle>
                <DialogDescription>{t("dashboard.cancelConfirmDesc")}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  {t("common.back")}
                </DialogClose>
                <Button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t("dashboard.cancelMatch")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  return (
    <>
      <div className={cn(
        "flex items-center gap-3 px-4 py-2.5",
        rowBg,
        isLive && "border-l-2 border-primary"
      )}>
        {inner}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={copyMatchLink}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            title={t("common.copyLink")}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDuplicate}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            title={t("dashboard.duplicateMatch")}
          >
            <CopyPlus className="h-3.5 w-3.5" />
          </button>
          {match.status === "scheduled" && (
            <button
              onClick={() => setShowCancelDialog(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
              title={t("dashboard.cancelMatch")}
            >
              <Ban className="h-3.5 w-3.5" />
            </button>
          )}
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

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t("dashboard.cancelConfirmTitle")}</DialogTitle>
            <DialogDescription>{t("dashboard.cancelConfirmDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t("common.back")}
            </DialogClose>
            <Button
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("dashboard.cancelMatch")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
