"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Settings2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getTeams } from "@/lib/firebaseServices";
import { TeamsTab } from "@/components/settings/TeamsTab";
import type { Team } from "@/types";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getTeams(user.uid)
      .then(setTeams)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings2 className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-bold">{t("title")}</h1>
      </div>

      {user && <TeamsTab uid={user.uid} initialTeams={teams} />}
    </div>
  );
}
