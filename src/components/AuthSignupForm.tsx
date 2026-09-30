"use client";

import {
  useActionState,
  useEffect,
  useState,
  type SubmitEventHandler,
} from "react";

import { signupAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { fieldErrors as flattenFieldErrors } from "@/validation/form-errors";
import { signupSchema } from "@/validation/auth";

type AuthSignupFormProps = {
  onShowLogin: () => void;
};

export function AuthSignupForm({ onShowLogin }: AuthSignupFormProps) {
  const [state, formAction, isPending] = useActionState(signupAction, null);
  const [clientFieldErrors, setClientFieldErrors] =
    useState<Record<string, string[] | undefined>>();
  const actionFieldErrors =
    state && !state.success ? state.fieldErrors : undefined;
  const fieldErrors = clientFieldErrors ?? actionFieldErrors;

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    const parsed = signupSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    setClientFieldErrors(
      parsed.success ? undefined : flattenFieldErrors(parsed.error),
    );
    if (!parsed.success) {
      event.preventDefault();
      return;
    }
  };

  useEffect(() => {
    if (!state) {
      return;
    }

    if (state.success) {
      toast.add({
        title: "Revisa tu email para confirmar tu cuenta.",
        type: "success",
      });
      return;
    }

    toast.add({ title: state.error, type: "error" });
  }, [state]);

  return (
    <form
      className="space-y-6"
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending}
            aria-invalid={Boolean(fieldErrors?.email?.length)}
            aria-describedby={
              fieldErrors?.email?.length ? "signup-email-errors" : undefined
            }
            placeholder="tu@email.com"
          />
          {fieldErrors?.email?.length ? (
            <div id="signup-email-errors" className="space-y-1">
              {fieldErrors.email.map((error, index) => (
                <p
                  key={`${error}-${index}`}
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {error}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password">Contraseña</Label>
          <Input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            disabled={isPending}
            aria-invalid={Boolean(fieldErrors?.password?.length)}
            aria-describedby={
              fieldErrors?.password?.length
                ? "signup-password-errors"
                : undefined
            }
            placeholder="Tu contraseña"
          />
          {fieldErrors?.password?.length ? (
            <div id="signup-password-errors" className="space-y-1">
              {fieldErrors.password.map((error, index) => (
                <p
                  key={`${error}-${index}`}
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {error}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-display-name">Nombre Completo</Label>
          <Input
            id="signup-display-name"
            name="displayName"
            type="text"
            autoComplete="name"
            required
            disabled={isPending}
            aria-invalid={Boolean(fieldErrors?.displayName?.length)}
            aria-describedby={
              fieldErrors?.displayName?.length
                ? "signup-display-name-errors"
                : undefined
            }
            placeholder="Juan Pérez"
          />
          {fieldErrors?.displayName?.length ? (
            <div id="signup-display-name-errors" className="space-y-1">
              {fieldErrors.displayName.map((error, index) => (
                <p
                  key={`${error}-${index}`}
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {error}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-school-role">Cargo en el Centro</Label>
          <Input
            id="signup-school-role"
            name="schoolRole"
            type="text"
            autoComplete="organization-title"
            required
            disabled={isPending}
            aria-invalid={Boolean(fieldErrors?.schoolRole?.length)}
            aria-describedby={
              fieldErrors?.schoolRole?.length
                ? "signup-school-role-errors"
                : undefined
            }
            placeholder="Profesor de Matemáticas"
          />
          {fieldErrors?.schoolRole?.length ? (
            <div id="signup-school-role-errors" className="space-y-1">
              {fieldErrors.schoolRole.map((error, index) => (
                <p
                  key={`${error}-${index}`}
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {error}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? "Cargando..." : "Crear Cuenta"}
      </Button>

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={onShowLogin}
          disabled={isPending}
          className="h-auto p-0"
        >
          ¿Ya tienes cuenta? Inicia sesión
        </Button>
      </div>
    </form>
  );
}
