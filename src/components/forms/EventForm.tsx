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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Match, MatchEvent, MatchEventType, ShootoutResult } from "@/types";

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
  "shot_on_target", "shot_off_target", "save", "offside",
];

const PLAYER_EVENTS: MatchEventType[] = [
  "goal", "own_goal", "yellow_card", "second_yellow", "red_card",
  "substitution", "penalty_kick", "penalty_scored", "penalty_missed", "injury", "foul",
];

export function EventForm({ type, match, minute, onSubmit, onClose }: Props) {
  const t = useTranslations();
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<FormValues>({
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
        <DialogHeader>
          <DialogTitle>{t(`events.${type}` as Parameters<typeof t>[0])}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {needsTeam && (
            <div className="space-y-1.5">
              <Label>{t("eventForm.team")}</Label>
              <Select onValueChange={(v) => setValue("team", v as "home" | "away")}>
                <SelectTrigger>
                  <SelectValue placeholder={t("eventForm.team")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">{match.homeTeam}</SelectItem>
                  <SelectItem value="away">{match.awayTeam}</SelectItem>
                </SelectContent>
              </Select>
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
              <Select onValueChange={(v) => setValue("shootoutResult", v as ShootoutResult)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("eventForm.shootoutResult")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scored">{t("eventForm.scored")}</SelectItem>
                  <SelectItem value="missed">{t("eventForm.missed")}</SelectItem>
                  <SelectItem value="saved">{t("eventForm.saved")}</SelectItem>
                </SelectContent>
              </Select>
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
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? t("eventForm.logging") : t("eventForm.logEvent")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
