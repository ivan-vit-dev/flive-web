"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Timestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchForm } from "@/components/forms/MatchForm";
import { getMatch, updateMatch } from "@/lib/firebaseServices";
import type { Match, MatchEventType } from "@/types";
import toast from "react-hot-toast";

export default function EditMatchPage() {
  const t = useTranslations("matchForm");
  const { id, locale } = useParams<{ id: string; locale: string }>();
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    getMatch(id).then(setMatch);
  }, [id]);

  const handleSubmit = async (values: {
    homeTeam: string; awayTeam: string; venue?: string; competition?: string;
    scheduledAt: string; description?: string; homePlayers?: string; awayPlayers?: string;
  }, enabledEventTypes: MatchEventType[]) => {
    try {
      await updateMatch(id, {
        homeTeam: values.homeTeam,
        awayTeam: values.awayTeam,
        venue: values.venue ?? "",
        competition: values.competition ?? "",
        scheduledAt: Timestamp.fromDate(new Date(values.scheduledAt)),
        description: values.description || null,
        homePlayers: values.homePlayers?.split("\n").map((s) => s.trim()).filter(Boolean) ?? [],
        awayPlayers: values.awayPlayers?.split("\n").map((s) => s.trim()).filter(Boolean) ?? [],
        enabledEventTypes,
      });
      toast.success("Match updated!");
      router.push(`/${locale}/dashboard`);
    } catch {
      toast.error("Failed to update match.");
    }
  };

  if (!match) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t("editTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <MatchForm mode="edit" defaultValues={match} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
