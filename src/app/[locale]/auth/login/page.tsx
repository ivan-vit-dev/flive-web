"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFirebaseErrorMessage } from "@/lib/utils";
import { Radio, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import toast from "react-hot-toast";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      router.push(`/${locale}/dashboard`);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      toast.error(getFirebaseErrorMessage(code));
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Hero panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-brand flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Radio className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">FLive</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Welcome back,<br />reporter.
          </h1>
          <p className="text-white/70 text-lg max-w-sm leading-relaxed">
            Broadcast live football matches for clubs with no TV budget — parents follow every moment.
          </p>
        </div>

        <div className="flex gap-6 text-white/50 text-sm">
          <span>Live events</span>
          <span>·</span>
          <span>Offline queue</span>
          <span>·</span>
          <span>PWA ready</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-end gap-2 p-4">
          <ThemeToggle />
          <LocaleSwitcher />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm space-y-8">

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-brand text-white shadow-sm">
                <Radio className="h-4 w-4" />
              </div>
              <span className="font-bold gradient-text">FLive</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">{t("loginTitle")}</h2>
              <p className="text-muted-foreground text-sm">{t("loginSubtitle")}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    className="pl-9"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("password")}</Label>
                  <Link
                    href={`/${locale}/auth/reset`}
                    className="text-xs text-primary hover:underline"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-9"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gradient-brand text-white border-0 shadow-md hover:opacity-90 transition-opacity"
              >
                {isSubmitting ? t("login") + "..." : t("login")}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {t("noAccount")}{" "}
              <Link href={`/${locale}/auth/register`} className="font-medium text-primary hover:underline">
                {t("register")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
