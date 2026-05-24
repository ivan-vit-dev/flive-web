"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTeams, getTeamPlayers, getTeamPitches, getTeamCompetitions } from "@/lib/firebaseServices";
import type { Team, TeamPlayer, TeamPitch, TeamCompetition } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  reporterUid: string;
  onApply: (
    team: Team,
    players: TeamPlayer[],
    pitch: TeamPitch | null,
    competition: TeamCompetition | null,
    side: "home" | "away"
  ) => void;
}

export function MyTeamPicker({ reporterUid, onApply }: Props) {
  const t = useTranslations("settings");
  const locale = useLocale();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  const [side, setSide] = useState<"home" | "away">("home");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [pitches, setPitches] = useState<TeamPitch[]>([]);
  const [competitions, setCompetitions] = useState<TeamCompetition[]>([]);
  const [checkedPlayerIds, setCheckedPlayerIds] = useState<Set<string>>(new Set());
  const [selectedPitchId, setSelectedPitchId] = useState<string>("");
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>("");
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    getTeams(reporterUid)
      .then(setTeams)
      .finally(() => setLoadingTeams(false));
  }, [reporterUid]);

  function handleApply() {
    if (!selectedTeamId || loadingDetail) return;
    const team = teams.find((t) => t.id === selectedTeamId);
    if (!team) return;
    const chosenPlayers = players.filter((p) => checkedPlayerIds.has(p.id));
    const pitch = pitches.find((p) => p.id === selectedPitchId) ?? null;
    const competition = competitions.find((c) => c.id === selectedCompetitionId) ?? null;
    onApply(team, chosenPlayers, pitch, competition, side);
  }

  async function handleTeamSelect(teamId: string) {
    setSelectedTeamId(teamId);
    setCheckedPlayerIds(new Set());
    setSelectedPitchId("");
    setSelectedCompetitionId("");
    setLoadingDetail(true);
    try {
      const [p, pi, co] = await Promise.all([
        getTeamPlayers(reporterUid, teamId),
        getTeamPitches(reporterUid, teamId),
        getTeamCompetitions(reporterUid, teamId),
      ]);
      setPlayers(p);
      setPitches(pi);
      setCompetitions(co);
      setCheckedPlayerIds(new Set(p.map((pl) => pl.id)));
    } finally {
      setLoadingDetail(false);
    }
  }

  function togglePlayer(id: string) {
    setCheckedPlayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loadingTeams) return null;

  if (teams.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
        <Users className="h-4 w-4 shrink-0" />
        <span>
          {t("noTeamsHint")}{" "}
          <Link href={`/${locale}/dashboard/settings`} className="underline underline-offset-2 hover:text-foreground">
            {t("title")}
          </Link>
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Home / Away toggle */}
      <div className="flex gap-2">
        {(["home", "away"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSide(s)}
            className={cn(
              "flex-1 rounded-full border py-1.5 text-sm font-medium transition-colors",
              side === s
                ? "bg-primary text-primary-foreground border-transparent"
                : "border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-accent"
            )}
          >
            {t(s === "home" ? "sideHome" : "sideAway")}
          </button>
        ))}
      </div>

      {/* Team list */}
      <div className="space-y-1">
        {teams.map((team) => (
          <button
            key={team.id}
            type="button"
            onClick={() => handleTeamSelect(team.id)}
            className={cn(
              "w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors",
              selectedTeamId === team.id
                ? "bg-primary text-primary-foreground border-transparent"
                : "border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-accent"
            )}
          >
            {team.name}
          </button>
        ))}
      </div>

      {/* Players checklist */}
      {selectedTeamId && !loadingDetail && players.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{t("selectPlayersHint")}</p>
          <div className="max-h-44 overflow-y-auto space-y-1 rounded-lg border border-border bg-background p-2">
            {players.map((p) => (
              <label key={p.id} className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1 text-sm hover:bg-muted">
                <input
                  type="checkbox"
                  checked={checkedPlayerIds.has(p.id)}
                  onChange={() => togglePlayer(p.id)}
                  className="h-4 w-4 accent-primary"
                />
                <span>
                  {p.jerseyNumber != null && (
                    <span className="mr-1 text-xs text-muted-foreground">{p.jerseyNumber}.</span>
                  )}
                  {p.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Pitch selector */}
      {selectedTeamId && !loadingDetail && pitches.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{t("selectPitch")}</p>
          {pitches.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPitchId(p.id === selectedPitchId ? "" : p.id)}
              className={cn(
                "w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors",
                selectedPitchId === p.id
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-accent"
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Competition selector */}
      {selectedTeamId && !loadingDetail && competitions.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{t("selectCompetition")}</p>
          {competitions.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCompetitionId(c.id === selectedCompetitionId ? "" : c.id)}
              className={cn(
                "w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors",
                selectedCompetitionId === c.id
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-accent"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <Button
        type="button"
        size="lg"
        disabled={!selectedTeamId || loadingDetail}
        onClick={handleApply}
        className="w-full gradient-brand text-white border-0 shadow-md hover:opacity-90 transition-opacity"
      >
        {t("applyToForm")}
      </Button>
    </div>
  );
}
