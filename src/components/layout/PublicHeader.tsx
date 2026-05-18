"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Radio, LogIn, UserPlus, LayoutDashboard, LogOut, Menu, X, User } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useAuth } from "@/components/providers/AuthProvider";
import toast from "react-hot-toast";

export function PublicHeader() {
  const t = useTranslations();
  const locale = useLocale();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    toast.success(t("auth.logout"));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border glass">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-14 items-center justify-between gap-4">

          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-brand text-white shadow-md transition-shadow group-hover:shadow-lg group-hover:shadow-glow">
              <Radio className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight gradient-text">FLive</span>
          </Link>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-1">
            <ThemeToggle />
            <LocaleSwitcher />

            <div className="mx-2 h-5 w-px bg-border" />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full gradient-brand text-white text-xs font-bold shadow-sm">
                    {user.displayName?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                  <span className="hidden lg:inline max-w-32 truncate">{user.displayName ?? user.email}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-border bg-card shadow-lg py-1.5 z-50">
                    <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border truncate">
                      {user.email}
                    </div>
                    <Link
                      href={`/${locale}/dashboard`}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {t("dashboard.title")}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("auth.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href={`/${locale}/auth/login`}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5")}
                >
                  <LogIn className="h-4 w-4" />
                  {t("auth.login")}
                </Link>
                <Link
                  href={`/${locale}/auth/register`}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium gradient-brand text-white shadow-md transition-opacity hover:opacity-90"
                >
                  <UserPlus className="h-4 w-4" />
                  {t("auth.register")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: theme + locale + burger */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <LocaleSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1">
            {user ? (
              <>
                <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-brand text-white text-xs font-bold">
                    {user.displayName?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                  <span className="truncate">{user.displayName ?? user.email}</span>
                </div>
                <Link
                  href={`/${locale}/dashboard`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t("dashboard.title")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-accent transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {t("auth.logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/auth/login`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  {t("auth.login")}
                </Link>
                <Link
                  href={`/${locale}/auth/register`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium gradient-brand text-white hover:opacity-90 transition-opacity"
                >
                  <UserPlus className="h-4 w-4" />
                  {t("auth.register")}
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
