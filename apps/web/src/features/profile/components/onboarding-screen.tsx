"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { TextField } from "@/components/atoms/text-field";
import { FormField } from "@/components/molecules/form-field";
import { GoogleAccountCard } from "@/components/molecules/google-account-card";
import { authSubmitClassName } from "@/components/templates/auth-card";
import { WelcomeLayout } from "@/components/templates/welcome-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useUpdateProfile } from "../api/mutations";
import { useProfile } from "../api/queries";
import { updateProfileSchema } from "@bordo/shared/profile";

const nameSchema = updateProfileSchema.pick({ name: true });

const WELCOME_IMAGE =
  "https://images.unsplash.com/photo-1676730056228-7e38cbb88edc?auto=format&fit=crop&w=1400&q=80";

/** Where the onboarding goes next: the second step is creating the first trip. */
const NEXT_STEP = "/viagens/nova";

/** First access: asks how to call the user. With a Google account, shows what came from Google. */
export function OnboardingScreen() {
  const router = useRouter();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ name: string }>({
    resolver: zodResolver(nameSchema),
    values: profile.data ? { name: profile.data.name } : undefined,
  });

  const onSubmit = handleSubmit(({ name }) => {
    if (!profile.data) return;
    updateProfile.mutate(
      { name, currency: profile.data.currency },
      {
        onSuccess: () => router.push(NEXT_STEP),
        onError: () => toast.error("Não foi possível salvar seu nome. Tente de novo."),
      },
    );
  });

  const googleEmail = profile.data?.googleEmail ?? null;

  return (
    <WelcomeLayout
      imageSrc={WELCOME_IMAGE}
      quote="Cada viagem merece um final feliz, inclusive na conta."
      place="Santorini, Grécia"
      footer="Passo 1 de 2 · Leva menos de um minuto"
      compactBanner={googleEmail !== null}
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-1 flex-col gap-6 md:flex-none">
        <div className="flex flex-col gap-2.5 md:gap-3">
          <h1 className="text-[32px] leading-[1.12] font-bold tracking-[-0.8px] text-foreground md:text-[46px] md:leading-[1.08] md:tracking-[-1.2px]">
            Que bom ter você a bordo!
          </h1>
          <p className="text-base leading-[1.45] text-muted-foreground md:text-[17px]">
            Vamos montar o diário financeiro da sua primeira viagem. Antes, só precisamos saber uma
            coisa.
          </p>
        </div>

        {profile.isPending ? (
          <div
            role="status"
            aria-busy="true"
            aria-label="Carregando seus dados"
            className="flex flex-col gap-4"
          >
            <Skeleton className="h-18 rounded-xl" />
          </div>
        ) : (
          <>
            {googleEmail ? (
              <GoogleAccountCard
                name={profile.data?.name ?? ""}
                email={googleEmail}
                photoUrl={profile.data?.photoUrl}
              />
            ) : null}
            <div className="flex flex-col gap-2.5">
              <FormField label="Como podemos te chamar?" error={errors.name?.message}>
                {(control) => (
                  <TextField
                    icon={<User />}
                    autoComplete="given-name"
                    autoFocus={!googleEmail}
                    {...register("name")}
                    {...control}
                  />
                )}
              </FormField>
              <p className={"text-[13px] leading-[1.45] text-muted-foreground"}>
                {googleEmail
                  ? "Pegamos essas informações da sua conta Google. Você pode mudar quando quiser no seu perfil."
                  : "Usaremos esse nome para te cumprimentar no app."}
              </p>
            </div>
          </>
        )}

        <Button
          type="submit"
          variant="cta"
          size="lg"
          disabled={profile.isPending || updateProfile.isPending}
          className={cn(authSubmitClassName, "mt-auto h-13.25 md:mt-0 md:h-13.75 md:px-6")}
        >
          {updateProfile.isPending ? (
            "Salvando..."
          ) : (
            <>
              <ArrowRight aria-hidden />
              Continuar
            </>
          )}
        </Button>
      </form>
    </WelcomeLayout>
  );
}
