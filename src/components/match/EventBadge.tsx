import {
  Goal,
  Square,
  ArrowLeftRight,
  Flag,
  AlertTriangle,
  Siren,
  CircleDot,
  Crosshair,
  Shield,
  MessageSquare,
  Video,
  Activity,
  Clock,
  Play,
  CheckCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MatchEventType } from "@/types";

interface EventStyle {
  icon: React.ElementType;
  color: string;
}

const EVENT_STYLES: Partial<Record<MatchEventType, EventStyle>> = {
  match_start:            { icon: Play,          color: "text-primary" },
  first_half_end:         { icon: Clock,         color: "text-muted-foreground" },
  second_half_start:      { icon: Play,          color: "text-primary" },
  full_time:              { icon: Clock,         color: "text-muted-foreground" },
  extra_time_start:       { icon: Zap,           color: "text-orange-500" },
  extra_time_end:         { icon: Clock,         color: "text-muted-foreground" },
  penalty_shootout_start: { icon: CircleDot,     color: "text-red-500" },
  match_finished:         { icon: CheckCircle,   color: "text-muted-foreground" },
  goal:                   { icon: Goal,          color: "text-primary" },
  own_goal:               { icon: Goal,          color: "text-destructive" },
  yellow_card:            { icon: Square,        color: "text-yellow-500" },
  second_yellow:          { icon: Square,        color: "text-orange-500" },
  red_card:               { icon: Square,        color: "text-red-600" },
  substitution:           { icon: ArrowLeftRight, color: "text-blue-500" },
  corner:                 { icon: Flag,          color: "text-muted-foreground" },
  free_kick:              { icon: CircleDot,     color: "text-muted-foreground" },
  penalty_awarded:        { icon: CircleDot,     color: "text-orange-500" },
  penalty_scored:         { icon: Goal,          color: "text-primary" },
  penalty_missed:         { icon: Crosshair,     color: "text-destructive" },
  penalty_kick:           { icon: CircleDot,     color: "text-red-500" },
  offside:                { icon: AlertTriangle,  color: "text-yellow-600" },
  foul:                   { icon: AlertTriangle,  color: "text-muted-foreground" },
  injury:                 { icon: Siren,         color: "text-red-500" },
  injury_time_announced:  { icon: Clock,         color: "text-muted-foreground" },
  shot_on_target:         { icon: Crosshair,     color: "text-primary" },
  shot_off_target:        { icon: Crosshair,     color: "text-muted-foreground" },
  save:                   { icon: Shield,        color: "text-blue-500" },
  var_review:             { icon: Video,         color: "text-purple-500" },
  var_goal_disallowed:    { icon: Video,         color: "text-destructive" },
  var_goal_confirmed:     { icon: Video,         color: "text-primary" },
  custom_note:            { icon: MessageSquare,  color: "text-muted-foreground" },
};

const FALLBACK: EventStyle = { icon: Activity, color: "text-muted-foreground" };

export function EventBadge({ type, size = "md" }: { type: MatchEventType; size?: "sm" | "md" }) {
  const { icon: Icon, color } = EVENT_STYLES[type] ?? FALLBACK;
  return (
    <Icon className={cn(color, size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5")} />
  );
}
