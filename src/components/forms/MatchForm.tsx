"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Match, MatchEventType } from "@/types";
import { GAMEPLAY_EVENTS, EVENT_GROUPS } from "@/types";
import { useState } from "react";
import { cn } from "@/lib/utils";

const schema = z.object({
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  venue: z.string().optional(),
  competition: z.string().optional(),
  scheduledAt: z.string().min(1),
  description: z.string().optional(),
  homePlayers: z.string().optional(),
  awayPlayers: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<Match>;
  onSubmit: (values: FormValues, enabledEventTypes: MatchEventType[]) => Promise<void>;
  mode: "create" | "edit";
}

function toDatetimeLocal(ts: { toDate?: () => Date } | undefined): string {
  if (!ts?.toDate) return "";
  const d = ts.toDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function MatchForm({ defaultValues, onSubmit, mode }: Props) {
  const t = useTranslations();
  const [enabledEventTypes, setEnabledEventTypes] = useState<MatchEventType[]>(
    defaultValues?.enabledEventTypes ?? GAMEPLAY_EVENTS
  );

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      homeTeam: defaultValues?.homeTeam ?? "",
      awayTeam: defaultValues?.awayTeam ?? "",
      venue: defaultValues?.venue ?? "",
      competition: defaultValues?.competition ?? "",
      scheduledAt: toDatetimeLocal(defaultValues?.scheduledAt),
      description: defaultValues?.description ?? "",
      homePlayers: defaultValues?.homePlayers?.join("\n") ?? "",
      awayPlayers: defaultValues?.awayPlayers?.join("\n") ?? "",
    },
  });

  const toggleEventType = (type: MatchEventType) => {
    setEnabledEventTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit(values, enabledEventTypes);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t("match.homeTeam")} *</Label>
          <Input {...register("homeTeam")} placeholder={t("matchForm.homeTeamPlaceholder")} />
          {errors.homeTeam && <p className="text-xs text-destructive">{t("matchForm.validation.homeTeamRequired")}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>{t("match.awayTeam")} *</Label>
          <Input {...register("awayTeam")} placeholder={t("matchForm.awayTeamPlaceholder")} />
          {errors.awayTeam && <p className="text-xs text-destructive">{t("matchForm.validation.awayTeamRequired")}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t("match.competition")}</Label>
          <Input {...register("competition")} placeholder={t("matchForm.competitionPlaceholder")} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("match.venue")}</Label>
          <Input {...register("venue")} placeholder={t("matchForm.venuePlaceholder")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>{t("match.scheduledAt")} *</Label>
        <Input type="datetime-local" {...register("scheduledAt")} />
        {errors.scheduledAt && <p className="text-xs text-destructive">{t("matchForm.validation.scheduledAtRequired")}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>{t("match.description")}</Label>
        <Textarea {...register("description")} placeholder={t("matchForm.descriptionPlaceholder")} rows={2} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t("match.homePlayers")}</Label>
          <Textarea {...register("homePlayers")} placeholder={t("matchForm.homePlayersPlaceholder")} rows={4} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("match.awayPlayers")}</Label>
          <Textarea {...register("awayPlayers")} placeholder={t("matchForm.awayPlayersPlaceholder")} rows={4} />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">{t("matchForm.eventConfig")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t("matchForm.eventConfigDesc")}</p>
        </div>
        {Object.entries(EVENT_GROUPS).map(([group, types]) => (
          <div key={group}>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              {t(`control.eventGroups.${group}` as Parameters<typeof t>[0])}
            </p>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleEventType(type)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                    enabledEventTypes.includes(type)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-foreground"
                  )}
                >
                  {t(`events.${type}` as Parameters<typeof t>[0])}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? mode === "create" ? t("matchForm.creating") : t("matchForm.saving")
          : mode === "create" ? t("matchForm.create") : t("matchForm.saveChanges")}
      </Button>
    </form>
  );
}
