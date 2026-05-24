"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTeamPlayers, addTeamPlayer, removeTeamPlayer } from "@/lib/firebaseServices";
import type { TeamPlayer } from "@/types";

interface Props {
  uid: string;
  teamId: string;
}

export function PlayersPanel({ uid, teamId }: Props) {
  const t = useTranslations("settings");
  const [open, setOpen] = useState(false);
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [jersey, setJersey] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getTeamPlayers(uid, teamId).then(setPlayers);
  }, [uid, teamId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      const jerseyNum = jersey.trim() ? parseInt(jersey.trim(), 10) : null;
      const id = await addTeamPlayer(uid, teamId, name.trim(), jerseyNum);
      setPlayers((prev) => [
        ...prev,
        { id, name: name.trim(), jerseyNumber: jerseyNum, createdAt: null as never },
      ]);
      setName("");
      setJersey("");
      setShowForm(false);
    } catch {
      toast.error("Failed to add player");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(player: TeamPlayer) {
    try {
      await removeTeamPlayer(uid, teamId, player.id);
      setPlayers((prev) => prev.filter((p) => p.id !== player.id));
    } catch {
      toast.error("Failed to remove player");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex flex-1 items-center gap-1.5 text-left text-sm font-medium py-1"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
          {t("players")}
        </button>
        {open && (
          <Button
            size="sm"
            onClick={() => setShowForm((v) => !v)}
            className="gradient-brand text-white border-0 shadow-sm hover:opacity-90 transition-opacity gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("addPlayer")}
          </Button>
        )}
      </div>

      {open && (
        <div className="mt-2">
          {showForm && (
            <form onSubmit={handleAdd} className="mb-3 flex gap-2">
              <Input
                value={jersey}
                onChange={(e) => setJersey(e.target.value)}
                placeholder={t("jerseyNumberPlaceholder")}
                className="w-20 shrink-0"
                type="number"
                min={1}
                max={99}
              />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("playerNamePlaceholder")}
                className="flex-1"
                autoFocus
              />
              <Button
                type="submit"
                size="sm"
                disabled={adding || !name.trim()}
                className="gradient-brand text-white border-0 shadow-sm hover:opacity-90 transition-opacity"
              >
                {t("addPlayer")}
              </Button>
            </form>
          )}

          {players.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">{t("noPlayers")}</p>
          ) : (
            <ul className="space-y-1">
              {players.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-lg px-2 py-1 text-sm hover:bg-muted"
                >
                  <span>
                    {p.jerseyNumber != null && (
                      <span className="mr-1.5 text-xs text-muted-foreground">{p.jerseyNumber}.</span>
                    )}
                    {p.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleRemove(p)}
                    aria-label={t("removePlayer")}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
