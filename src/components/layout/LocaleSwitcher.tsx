"use client";

import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const locales = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "cs", name: "Čeština", flag: "🇨🇿" },
];

export function LocaleSwitcher() {
  const locale = useLocale();

  const handleSwitch = (newLocale: string) => {
    if (newLocale === locale) return;
    const clean = window.location.pathname.replace(/^\/(cs|en)/, "") || "/";
    window.location.href = `/${newLocale}${clean}`;
  };

  const current = locales.find((l) => l.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-sm font-medium text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground transition-colors">
        <Globe className="h-4 w-4" />
        <span className="text-base leading-none">{current?.flag}</span>
        <span className="hidden sm:inline text-xs">{current?.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px] rounded-xl">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => handleSwitch(l.code)}
            className={cn(
              "gap-2 rounded-lg",
              locale === l.code && "bg-accent text-accent-foreground font-medium"
            )}
          >
            <span className="text-base leading-none">{l.flag}</span>
            {l.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
