"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Match, MatchEventType } from "@/types";
import { GAMEPLAY_EVENTS, EVENT_GROUPS } from "@/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  venue: z.string().optional(),
  competition: z.string().optional(),
  scheduledAt: z.string().min(1),
  parts: z.coerce.number().int().min(1).max(8),
  partDuration: z.coerce.number().int().min(1).max(90),
  description: z.string().optional(),
  homePlayers: z.string().optional(),
  awayPlayers: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<Match>;
  onSubmit: (values: FormValues, enabledEventTypes: MatchEventType[]) => Promise<void>;
  mode: "create" | "edit";
  /** When provided the form renders with this id and omits the internal submit button. */
  formId?: string;
}

function toDatetimeLocal(ts: { toDate?: () => Date } | undefined): string {
  if (!ts?.toDate) return "";
  const d = ts.toDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nowDatetimeLocal(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function MatchForm({ defaultValues, onSubmit, mode, formId }: Props) {
  const t = useTranslations();
  const [enabledEventTypes, setEnabledEventTypes] = useState<MatchEventType[]>(
    defaultValues?.enabledEventTypes ?? GAMEPLAY_EVENTS
  );
  const [infoGroup, setInfoGroup] = useState<string | null>(null);
  const lastAutoDescRef = useRef<string>("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      homeTeam: defaultValues?.homeTeam ?? "",
      awayTeam: defaultValues?.awayTeam ?? "",
      venue: defaultValues?.venue ?? "",
      competition: defaultValues?.competition ?? "",
      scheduledAt: toDatetimeLocal(defaultValues?.scheduledAt) || (mode === "create" ? nowDatetimeLocal() : ""),
      parts: defaultValues?.parts ?? 2,
      partDuration: defaultValues?.partDuration ?? 45,
      description: defaultValues?.description ?? "",
      homePlayers: defaultValues?.homePlayers?.join("\n") ?? "",
      awayPlayers: defaultValues?.awayPlayers?.join("\n") ?? "",
    },
  });

  const homeTeam = watch("homeTeam");
  const awayTeam = watch("awayTeam");
  const venue = watch("venue");
  const competition = watch("competition");
  const scheduledAt = watch("scheduledAt");

  useEffect(() => {
    if (mode !== "create") return;
    if (!homeTeam || !awayTeam || !venue || !competition || !scheduledAt) return;

    const d = new Date(scheduledAt);
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const date = d.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
    const autoDesc = t("matchForm.descriptionTemplate", { homeTeam, awayTeam, venue, competition, time, date });

    const currentDesc = getValues("description");
    if (!currentDesc || currentDesc === lastAutoDescRef.current) {
      lastAutoDescRef.current = autoDesc;
      setValue("description", autoDesc, { shouldDirty: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeTeam, awayTeam, venue, competition, scheduledAt]);

  const toggleEventType = (type: MatchEventType) => {
    setEnabledEventTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <>
      <form
        id={formId}
        onSubmit={handleSubmit(async (values) => { await onSubmit(values, enabledEventTypes); })}
        className="space-y-6"
      >
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("matchForm.parts")}</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setValue("parts", n);
                    const suggested = n === 1 ? 20 : n === 4 ? 20 : n === 3 ? 30 : 45;
                    setValue("partDuration", suggested);
                  }}
                  className={cn(
                    "flex-1 rounded-full border py-1.5 text-sm font-medium transition-colors",
                    watch("parts") === n
                      ? "bg-primary text-primary-foreground border-transparent"
                      : "border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-accent"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t(`matchForm.partsHint${watch("parts")}` as Parameters<typeof t>[0])}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>{t("matchForm.partDuration")}</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={90}
                {...register("partDuration")}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">min</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t("match.description")}</Label>
          <Textarea
            {...register("description")}
            placeholder={t("matchForm.descriptionPlaceholder")}
            rows={3}
          />
          {mode === "create" && (
            <p className="text-xs text-muted-foreground">{t("matchForm.descriptionAutoHint")}</p>
          )}
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
              <div className="flex items-center gap-1.5 mb-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  {t(`control.eventGroups.${group}` as Parameters<typeof t>[0])}
                </p>
                {/* Mobile-only info trigger */}
                <button
                  type="button"
                  onClick={() => setInfoGroup(group)}
                  className="sm:hidden text-muted-foreground opacity-50 hover:opacity-100 transition-opacity"
                  aria-label={t("matchForm.eventInfo")}
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <div key={type} className="relative group/tip">
                    <button
                      type="button"
                      onClick={() => toggleEventType(type)}
                      className={cn(
                        "rounded-full border px-3.5 py-1 text-sm transition-colors",
                        enabledEventTypes.includes(type)
                          ? "bg-primary text-primary-foreground border-transparent"
                          : "border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-accent"
                      )}
                    >
                      {t(`events.${type}` as Parameters<typeof t>[0])}
                    </button>

                    {/* Desktop tooltip — hidden on mobile */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-52 -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity sm:block group-hover/tip:opacity-100">
                      {t(`eventDescriptions.${type}` as Parameters<typeof t>[0])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Internal submit button — only when no external formId is provided */}
        {!formId && (
          <Button type="submit" className="w-full gradient-brand text-white border-0 shadow-md hover:opacity-90 transition-opacity" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "create" ? t("matchForm.creating") : t("matchForm.saving")
              : mode === "create" ? t("matchForm.create") : t("matchForm.saveChanges")}
          </Button>
        )}
      </form>

      {/* Mobile: per-group event description dialog */}
      <Dialog open={!!infoGroup} onOpenChange={(open) => { if (!open) setInfoGroup(null); }}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {infoGroup && t(`control.eventGroups.${infoGroup}` as Parameters<typeof t>[0])}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            {infoGroup && EVENT_GROUPS[infoGroup]?.map((type) => (
              <div key={type} className="space-y-0.5">
                <p className="text-sm font-medium">
                  {t(`events.${type}` as Parameters<typeof t>[0])}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(`eventDescriptions.${type}` as Parameters<typeof t>[0])}
                </p>
              </div>
            ))}
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </>
  );
}
