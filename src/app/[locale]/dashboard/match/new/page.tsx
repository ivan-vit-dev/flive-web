"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Timestamp } from "firebase/firestore";
import { PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MatchForm } from "@/components/forms/MatchForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { createMatch } from "@/lib/firebaseServices";
import type { MatchEventType } from "@/types";
import toast from "react-hot-toast";

const FORM_ID = "new-match-form";

export default function NewMatchPage() {
  const t = useTranslations("matchForm");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: {
    homeTeam: string; awayTeam: string; venue?: string; competition?: string;
    scheduledAt: string; parts: number; partDuration: number;
    description?: string; homePlayers?: string; awayPlayers?: string;
  }, enabledEventTypes: MatchEventType[]) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const id = await createMatch({
        reporterId: user.uid,
        reporterName: user.displayName,
        homeTeam: values.homeTeam,
        awayTeam: values.awayTeam,
        venue: values.venue ?? "",
        competition: values.competition ?? "",
        scheduledAt: Timestamp.fromDate(new Date(values.scheduledAt)),
        parts: values.parts,
        partDuration: values.partDuration,
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
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle>{t("createTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <MatchForm mode="create" formId={FORM_ID} onSubmit={handleSubmit} reporterUid={user?.uid} />
        </CardContent>
      </Card>

      <div className="flex justify-center pb-6">
        <Button
          form={FORM_ID}
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="px-10 gap-2 gradient-brand text-white border-0 shadow-md hover:opacity-90 transition-opacity"
        >
          <PlusCircle className="h-4 w-4" />
          {isSubmitting ? t("creating") : t("create")}
        </Button>
      </div>
    </div>
  );
}
