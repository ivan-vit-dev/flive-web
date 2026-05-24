"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EventBadge } from "@/components/match/EventBadge";
import type { Match, MatchEvent, MatchEventType, ShootoutResult } from "@/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  team: z.enum(["home", "away"]).nullable().optional(),
  playerName: z.string().optional(),
  playerOutName: z.string().optional(),
  assistName: z.string().optional(),
  addedTime: z.coerce.number().min(0).optional(),
  shootoutResult: z.enum(["scored", "missed", "saved"]).nullable().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  type: MatchEventType;
  match: Match;
  minute: number;
  onSubmit: (data: Omit<MatchEvent, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onClose: () => void;
}

const TEAM_EVENTS: MatchEventType[] = [
  "goal", "own_goal", "yellow_card", "second_yellow", "red_card",
  "substitution", "penalty_kick", "penalty_scored", "penalty_missed",
  "penalty_awarded", "injury", "foul", "var_goal_disallowed", "var_goal_confirmed",
  "shot_on_target", "shot_off_target", "save", "offside", "corner", "free_kick",
];

const PLAYER_EVENTS: MatchEventType[] = [
  "goal", "own_goal", "yellow_card", "second_yellow", "red_card",
  "substitution", "penalty_kick", "penalty_scored", "penalty_missed", "injury", "foul", "save",
];

export function EventForm({ type, match, minute, onSubmit, onClose }: Props) {
  const t = useTranslations();
  const { register, handleSubmit, setValue, watch, setError, formState: { isSubmitting, errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { team: null, shootoutResult: null },
  });

  const needsTeam = TEAM_EVENTS.includes(type);
  const needsPlayer = PLAYER_EVENTS.includes(type);
  const needsAssist = type === "goal" || type === "penalty_scored";
  const needsPlayerOut = type === "substitution";
  const needsShootoutResult = type === "penalty_kick";
  const needsDescription = type === "var_review" || type === "custom_note";
  const needsAddedTime = type === "injury_time_announced";

  const onFormSubmit = async (values: FormValues) => {
    if (needsTeam && !values.team) {
      setError("team", { message: t("eventForm.teamRequired") });
      return;
    }
    if (needsShootoutResult && !values.shootoutResult) {
      setError("shootoutResult", { message: t("eventForm.shootoutResultRequired") });
      return;
    }
    await onSubmit({
      matchId: match.id,
      type,
      minute,
      addedTime: values.addedTime ?? null,
      team: values.team ?? null,
      playerName: values.playerName || null,
      assistName: values.assistName || null,
      playerOutName: values.playerOutName || null,
      shootoutResult: (values.shootoutResult as ShootoutResult) ?? null,
      description: values.description || null,
    });
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center text-center gap-1.5 pb-1">
          <EventBadge type={type} />
          <DialogTitle className="text-xl font-bold tracking-tight">
            {t(`events.${type}` as Parameters<typeof t>[0])}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {needsTeam && (
            <div className="space-y-1.5">
              <Label>{t("eventForm.team")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["home", "away"] as const).map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => { setValue("team", side); setError("team", {}); }}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-medium transition-colors truncate",
                      watch("team") === side
                        ? "gradient-brand text-white border-transparent"
                        : "border-border hover:border-foreground"
                    )}
                  >
                    {side === "home" ? match.homeTeam : match.awayTeam}
                  </button>
                ))}
              </div>
              {errors.team?.message && (
                <p className="text-xs text-destructive">{errors.team.message}</p>
              )}
            </div>
          )}

          {needsPlayer && (
            <div className="space-y-1.5">
              <Label>{t("eventForm.playerName")}</Label>
              <Input {...register("playerName")} placeholder={t("eventForm.playerPlaceholder")} />
            </div>
          )}

          {needsAssist && (
            <div className="space-y-1.5">
              <Label>{t("eventForm.assist")}</Label>
              <Input {...register("assistName")} placeholder={t("eventForm.assistPlaceholder")} />
            </div>
          )}

          {needsPlayerOut && (
            <div className="space-y-1.5">
              <Label>{t("eventForm.playerOut")}</Label>
              <Input {...register("playerOutName")} placeholder={t("eventForm.playerPlaceholder")} />
            </div>
          )}

          {needsShootoutResult && (
            <div className="space-y-1.5">
              <Label>{t("eventForm.shootoutResult")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["scored", "missed"] as const).map((result) => (
                  <button
                    key={result}
                    type="button"
                    onClick={() => { setValue("shootoutResult", result); setError("shootoutResult", {}); }}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      watch("shootoutResult") === result
                        ? "gradient-brand text-white border-transparent"
                        : "border-border hover:border-foreground"
                    )}
                  >
                    {t(`eventForm.${result}` as Parameters<typeof t>[0])}
                  </button>
                ))}
              </div>
              {errors.shootoutResult?.message && (
                <p className="text-xs text-destructive">{errors.shootoutResult.message}</p>
              )}
            </div>
          )}

          {needsAddedTime && (
            <div className="space-y-1.5">
              <Label>{t("eventForm.addedTime")}</Label>
              <Input type="number" min={1} max={20} {...register("addedTime")} />
            </div>
          )}

          {needsDescription && (
            <div className="space-y-1.5">
              <Label>{t("eventForm.description")}</Label>
              <Textarea {...register("description")} placeholder={t("eventForm.descriptionPlaceholder")} rows={2} />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" className="flex-1 gradient-brand text-white border-0" disabled={isSubmitting}>
              {isSubmitting ? t("eventForm.logging") : t("eventForm.logEvent")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
