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
import { getUserDoc } from "@/lib/firebaseServices";
import { useAuth } from "@/components/providers/AuthProvider";
import { getFirebaseErrorMessage } from "@/lib/utils";
import { Radio, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, values.email, values.password);
      const idToken = await cred.user.getIdToken();
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const userDoc = await getUserDoc(cred.user.uid);
      setUser(userDoc);
      router.push(`/${locale}/dashboard`);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      toast.error(getFirebaseErrorMessage(code));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero px-4">
      {/* Top-right controls */}
      <div className="fixed top-4 right-4 flex items-center gap-1 z-50">
        <ThemeToggle />
        <LocaleSwitcher />
      </div>

      <Card className="w-full max-w-sm p-6 space-y-6">
        {/* Logo + heading */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-white shadow-md">
              <Radio className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{t("loginTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("loginSubtitle")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
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
          <div className="space-y-1.5">
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
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
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
                aria-label={showPassword ? "Hide password" : "Show password"}
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
            size="lg"
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
      </Card>
    </div>
  );
}
