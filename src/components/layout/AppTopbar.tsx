"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useAuth } from "@/components/providers/AuthProvider";
import toast from "react-hot-toast";

export function AppTopbar() {
  const t = useTranslations();
  const locale = useLocale();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success(t("auth.logout"));
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 gap-4">
      <div className="flex items-center gap-2.5 text-sm min-w-0">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-brand text-white text-xs font-bold shadow-sm">
          {user?.displayName?.charAt(0).toUpperCase() ?? "U"}
        </div>
        <span className="truncate hidden sm:block font-medium">{user?.displayName ?? user?.email}</span>
      </div>

      <div className="flex items-center gap-1">
        <Link
          href={`/${locale}`}
          className="hidden sm:inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
        >
          ← {t("home.title")}
        </Link>
        <div className="hidden sm:block mx-1 h-4 w-px bg-border" />
        <LocaleSwitcher />
        <ThemeToggle />
        <div className="mx-1 h-4 w-px bg-border" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="gap-1.5 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{t("auth.logout")}</span>
        </Button>
      </div>
    </header>
  );
}
