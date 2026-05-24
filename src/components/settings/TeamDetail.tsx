"use client";

import { PlayersPanel } from "./PlayersPanel";
import { PitchesPanel } from "./PitchesPanel";
import { CompetitionsPanel } from "./CompetitionsPanel";

interface Props {
  uid: string;
  teamId: string;
}

export function TeamDetail({ uid, teamId }: Props) {
  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <PlayersPanel uid={uid} teamId={teamId} />
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <PitchesPanel uid={uid} teamId={teamId} />
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <CompetitionsPanel uid={uid} teamId={teamId} />
      </div>
    </div>
  );
}
