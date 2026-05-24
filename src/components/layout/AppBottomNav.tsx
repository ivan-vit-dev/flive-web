"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LayoutDashboard, PlusCircle, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems: { href: string; icon: React.ElementType; label: string; exact?: boolean }[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "dashboard.title", exact: true },
  { href: "/dashboard/match/new", icon: PlusCircle, label: "dashboard.newMatch" },
  { href: "/dashboard/settings", icon: Settings2, label: "settings.title", exact: true },
];

export function AppBottomNav() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav className="md:hidden flex shrink-0 border-t border-border bg-background-blur">
      {navItems.map(({ href, icon: Icon, label, exact }) => {
        const full = `/${locale}${href}`;
        const active = exact
          ? pathname === full
          : pathname === full || pathname.startsWith(`${full}/`);
        return (
          <Link
            key={href}
            href={full}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {t(label as Parameters<typeof t>[0])}
          </Link>
        );
      })}
    </nav>
  );
}
