"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LayoutDashboard, PlusCircle, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "dashboard.title" },
  { href: "/dashboard/match/new", icon: PlusCircle, label: "dashboard.newMatch" },
];

export function AppSidebar() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-card">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand text-white shadow-sm">
          <Radio className="h-3.5 w-3.5" />
        </div>
        <span className="font-bold text-base gradient-text">{t("common.appName")}</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map(({ href, icon: Icon, label }) => {
          const full = `/${locale}${href}`;
          const active = pathname === full || pathname.startsWith(`${full}/`);
          return (
            <Link
              key={href}
              href={full}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "gradient-brand text-white shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(label as Parameters<typeof t>[0])}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
