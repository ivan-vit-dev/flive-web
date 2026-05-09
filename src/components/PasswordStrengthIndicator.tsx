"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

const requirements = [
  { label: "At least 6 characters", test: (p: string) => p.length >= 6 },
  { label: "Contains at least one letter", test: (p: string) => /[a-zA-Z]/.test(p) },
  { label: "Contains at least one number", test: (p: string) => /\d/.test(p) },
];

export function PasswordStrengthIndicator({ password, className = "" }: { password: string; className?: string }) {
  const [strength, setStrength] = useState(0);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    if (!password) { setStrength(0); setLabel(""); setColor(""); return; }
    const met = requirements.filter((r) => r.test(password)).length;
    const pct = (met / requirements.length) * 100;
    setStrength(pct);
    if (pct < 50) { setLabel("Weak"); setColor("bg-red-500"); }
    else if (pct < 100) { setLabel("Medium"); setColor("bg-amber-500"); }
    else { setLabel("Strong"); setColor("bg-primary"); }
  }, [password]);

  if (!password) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-muted-foreground">Password strength</span>
          <span className={`text-xs font-semibold ${strength < 50 ? "text-red-500" : strength < 100 ? "text-amber-500" : "text-primary"}`}>
            {label}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5">
          <div className={`h-1.5 rounded-full transition-all duration-300 ${color}`} style={{ width: `${strength}%` }} />
        </div>
      </div>
      <div className="space-y-1.5">
        {requirements.map((req, i) => {
          const met = req.test(password);
          return (
            <div key={i} className="flex items-center gap-2">
              {met
                ? <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                : <X className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
              <span className={`text-xs ${met ? "text-primary" : "text-muted-foreground"}`}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
