"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserDoc } from "@/lib/firebaseServices";
import { getFirebaseErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

const schema = z.object({
  displayName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const t = useTranslations("auth");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(cred.user, { displayName: values.displayName });
      await createUserDoc(cred.user.uid, values.email, values.displayName);
      onSuccess();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      toast.error(getFirebaseErrorMessage(code));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">{t("displayName")}</Label>
        <Input id="name" placeholder={t("namePlaceholder")} {...register("displayName")} />
        {errors.displayName && <p className="text-xs text-destructive">{t("validation.nameRequired")}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" type="email" placeholder={t("emailPlaceholder")} {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{t("validation.emailInvalid")}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">{t("password")}</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{t("validation.passwordMin")}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "..." : t("register")}
      </Button>
    </form>
  );
}
