"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LogOut, Radio, Settings2 } from "lucide-react";
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
      {/* Logo — visible on mobile where sidebar is hidden, links to home */}
      <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0 group md:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand text-white shadow-sm transition-shadow group-hover:shadow-md">
          <Radio className="h-3.5 w-3.5" />
        </div>
        <span className="font-bold text-sm gradient-text">{t("common.appName")}</span>
      </Link>

      {/* User info — links to dashboard on desktop */}
      <Link
        href={`/${locale}/dashboard`}
        className="hidden md:flex items-center gap-2.5 text-sm min-w-0 rounded-md px-2 py-1 hover:bg-accent transition-colors"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-brand text-white text-xs font-bold shadow-sm">
          {user?.displayName?.charAt(0).toUpperCase() ?? "U"}
        </div>
        <span className="truncate font-medium">{user?.displayName ?? user?.email}</span>
      </Link>

      <div className="flex items-center gap-1 ml-auto">
        <LocaleSwitcher />
        <ThemeToggle />
        <div className="mx-1 h-4 w-px bg-border" />
        <Link
          href={`/${locale}/dashboard/settings`}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">{t("settings.title")}</span>
        </Link>
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
