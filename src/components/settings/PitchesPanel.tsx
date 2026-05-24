"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTeamPitches, addTeamPitch, removeTeamPitch } from "@/lib/firebaseServices";
import type { TeamPitch } from "@/types";

interface Props {
  uid: string;
  teamId: string;
}

export function PitchesPanel({ uid, teamId }: Props) {
  const t = useTranslations("settings");
  const [open, setOpen] = useState(false);
  const [pitches, setPitches] = useState<TeamPitch[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getTeamPitches(uid, teamId).then(setPitches);
  }, [uid, teamId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      const id = await addTeamPitch(uid, teamId, name.trim());
      setPitches((prev) => [
        ...prev,
        { id, name: name.trim(), createdAt: null as never },
      ]);
      setName("");
      setShowForm(false);
    } catch {
      toast.error("Failed to add pitch");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(pitch: TeamPitch) {
    try {
      await removeTeamPitch(uid, teamId, pitch.id);
      setPitches((prev) => prev.filter((p) => p.id !== pitch.id));
    } catch {
      toast.error("Failed to remove pitch");
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
          {t("pitches")}
        </button>
        {open && (
          <Button
            size="sm"
            onClick={() => setShowForm((v) => !v)}
            className="gradient-brand text-white border-0 shadow-sm hover:opacity-90 transition-opacity gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("addPitch")}
          </Button>
        )}
      </div>

      {open && (
        <div className="mt-2">
          {showForm && (
            <form onSubmit={handleAdd} className="mb-3 flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("pitchNamePlaceholder")}
                className="flex-1"
                autoFocus
              />
              <Button
                type="submit"
                size="sm"
                disabled={adding || !name.trim()}
                className="gradient-brand text-white border-0 shadow-sm hover:opacity-90 transition-opacity"
              >
                {t("addPitch")}
              </Button>
            </form>
          )}

          {pitches.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">{t("noPitches")}</p>
          ) : (
            <ul className="space-y-1">
              {pitches.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-lg px-2 py-1 text-sm hover:bg-muted"
                >
                  <span className="truncate">{p.name}</span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleRemove(p)}
                    aria-label={t("removePitch")}
                    className="ml-2 shrink-0"
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
