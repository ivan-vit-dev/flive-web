"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, Plus, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { addTeam, deleteTeam } from "@/lib/firebaseServices";
import { TeamDetail } from "./TeamDetail";
import type { Team } from "@/types";

interface Props {
  uid: string;
  initialTeams: Team[];
}

export function TeamsTab({ uid, initialTeams }: Props) {
  const t = useTranslations("settings");
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const id = await addTeam(uid, newName.trim());
      const team: Team = { id, name: newName.trim(), createdAt: null as never };
      setTeams((prev) => [...prev, team]);
      setNewName("");
      setShowAddForm(false);
      setSelectedId(id);
      toast.success(t("addTeam"));
    } catch {
      toast.error("Failed to add team");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      await deleteTeam(uid, deletingId);
      setTeams((prev) => prev.filter((t) => t.id !== deletingId));
      if (selectedId === deletingId) setSelectedId(null);
      setDeletingId(null);
    } catch {
      toast.error("Failed to delete team");
    }
  }

  const teamToDelete = teams.find((t) => t.id === deletingId);

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-base">{t("myTeams")}</h2>
        <Button
          size="sm"
          onClick={() => setShowAddForm((v) => !v)}
          className="gradient-brand text-white border-0 shadow-sm hover:opacity-90 transition-opacity gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("addTeam")}
        </Button>
      </div>

      {/* Add team inline form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="mb-4 flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("teamNamePlaceholder")}
            className="flex-1"
            autoFocus
          />
          <Button
            type="submit"
            disabled={adding || !newName.trim()}
            className="gradient-brand text-white border-0 shadow-sm hover:opacity-90 transition-opacity"
          >
            {t("addTeam")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => { setShowAddForm(false); setNewName(""); }}
          >
            {t("cancel")}
          </Button>
        </form>
      )}

      {/* Teams list */}
      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{t("noTeams")}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
          {teams.map((team) => {
            const isOpen = selectedId === team.id;
            return (
              <div key={team.id}>
                <div className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/50 transition-colors">
                  <button
                    className="flex flex-1 items-center gap-2 text-left min-w-0"
                    onClick={() => setSelectedId(isOpen ? null : team.id)}
                  >
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="font-medium text-sm truncate">{team.name}</span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeletingId(team.id)}
                    aria-label={t("deleteTeam")}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 bg-muted/20">
                    <TeamDetail uid={uid} teamId={team.id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t("deleteTeam")}</DialogTitle>
            <DialogDescription>
              {t("deleteTeamConfirm")}
              {teamToDelete && (
                <span className="block mt-1 font-medium text-foreground">
                  &ldquo;{teamToDelete.name}&rdquo;
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t("cancel")}
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              {t("deleteTeam")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
