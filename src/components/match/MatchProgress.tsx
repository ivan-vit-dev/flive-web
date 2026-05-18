"use client";

import { Fragment } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Match, MatchStatus } from "@/types";

type StepState = "completed" | "active" | "upcoming";

interface PartStep {
  label: string;
  sublabel: string;
  state: StepState;
}

const POST_FIRST: MatchStatus[] = ["half_time", "live_second", "extra_time", "penalty_shootout", "finished"];
const POST_SECOND: MatchStatus[] = ["extra_time", "penalty_shootout", "finished"];
const SHOW_STATUSES: MatchStatus[] = [
  "live_first", "half_time", "live_second", "extra_time", "penalty_shootout",
  "live_part", "break", "finished",
];

function getSteps(match: Match): PartStep[] {
  const parts = match.parts ?? 2;
  const duration = match.partDuration ?? 45;
  const currentPart = match.currentPart;
  const status = match.status;

  const kickoff: PartStep = { label: "KO", sublabel: "0'", state: "completed" };

  const partSteps = Array.from({ length: parts }, (_, idx) => {
    const i = idx + 1;
    let state: StepState;

    if (currentPart !== undefined && currentPart > 0) {
      if (i < currentPart) {
        state = "completed";
      } else if (i === currentPart) {
        state = (status === "live_part" || status === "live_first" || status === "live_second")
          ? "active"
          : "completed"; // break / half_time = part is done
      } else {
        state = "upcoming";
      }
    } else {
      // Legacy 2-half fallback (no currentPart stored)
      if (i === 1) {
        state = POST_FIRST.includes(status) ? "completed" : status === "live_first" ? "active" : "upcoming";
      } else if (i === 2) {
        state = POST_SECOND.includes(status) ? "completed" : status === "live_second" ? "active" : "upcoming";
      } else {
        state = "upcoming";
      }
    }

    const label = parts === 2
      ? (i === 1 ? "1st" : "2nd")
      : parts === 4 ? `Q${i}` : `P${i}`;
    return { label, sublabel: `${duration}'`, state };
  });

  return [kickoff, ...partSteps];
}

export function MatchProgress({ match }: { match: Match }) {
  if (!SHOW_STATUSES.includes(match.status)) return null;

  const steps = getSteps(match);

  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <div className="flex items-center">
        {steps.map((step, i) => (
          <Fragment key={i}>
            <div
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-center transition-all shrink-0",
                step.state === "completed" && "bg-primary text-primary-foreground",
                step.state === "active" && "gradient-brand text-white shadow-sm",
                step.state === "upcoming" && "border border-border text-muted-foreground opacity-50",
              )}
            >
              <div className="flex items-center justify-center h-3.5 w-3.5 mb-0.5">
                {step.state === "completed" ? (
                  <Check className="h-3 w-3 text-primary-foreground" />
                ) : step.state === "active" ? (
                  <span className="h-2 w-2 rounded-full bg-white animate-live-pulse" />
                ) : (
                  <span className="h-2 w-2 rounded-full border border-current opacity-40" />
                )}
              </div>
              <span className="text-xs font-semibold leading-none">{step.label}</span>
              <span className="text-[10px] opacity-60 leading-none mt-0.5">{step.sublabel}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-1 min-w-[0.5rem] rounded-full transition-all",
                steps[i + 1].state !== "upcoming" ? "bg-primary" : "bg-border"
              )} />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
