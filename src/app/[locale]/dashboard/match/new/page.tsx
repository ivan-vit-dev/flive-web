"use client";

import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Timestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchForm } from "@/components/forms/MatchForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { createMatch } from "@/lib/firebaseServices";
import type { MatchEventType } from "@/types";
import toast from "react-hot-toast";

export default function NewMatchPage() {
  const t = useTranslations("matchForm");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const { user } = useAuth();

  const handleSubmit = async (values: {
    homeTeam: string; awayTeam: string; venue?: string; competition?: string;
    scheduledAt: string; description?: string; homePlayers?: string; awayPlayers?: string;
  }, enabledEventTypes: MatchEventType[]) => {
    if (!user) return;
    try {
      const id = await createMatch({
        reporterId: user.uid,
        reporterName: user.displayName,
        homeTeam: values.homeTeam,
        awayTeam: values.awayTeam,
        venue: values.venue ?? "",
        competition: values.competition ?? "",
        scheduledAt: Timestamp.fromDate(new Date(values.scheduledAt)),
        description: values.description || null,
        homePlayers: values.homePlayers?.split("\n").map((s) => s.trim()).filter(Boolean) ?? [],
        awayPlayers: values.awayPlayers?.split("\n").map((s) => s.trim()).filter(Boolean) ?? [],
        enabledEventTypes,
        isPublic: true,
      });
      toast.success("Match created!");
      router.push(`/${locale}/dashboard/match/${id}`);
    } catch {
      toast.error("Failed to create match.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t("createTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <MatchForm mode="create" onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
