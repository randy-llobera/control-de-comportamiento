"use client";

import { useActionState, useEffect } from "react";

import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

type AuthLoginFormProps = {
  onShowSignup: () => void;
};

export function AuthLoginForm({ onShowSignup }: AuthLoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const fieldErrors = state && !state.success ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state && !state.success) {
      toast.add({ title: state.error, type: "error" });
    }
  }, [state]);

  return (
    <form className="space-y-6" action={formAction}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending}
            aria-invalid={Boolean(fieldErrors?.email?.length)}
            aria-describedby={
              fieldErrors?.email?.length ? "login-email-errors" : undefined
            }
            placeholder="tu@email.com"
          />
          {fieldErrors?.email?.length ? (
            <div id="login-email-errors" className="space-y-1">
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
          <Label htmlFor="login-password">Contraseña</Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={isPending}
            aria-invalid={Boolean(fieldErrors?.password?.length)}
            aria-describedby={
              fieldErrors?.password?.length
                ? "login-password-errors"
                : undefined
            }
            placeholder="Tu contraseña"
          />
          {fieldErrors?.password?.length ? (
            <div id="login-password-errors" className="space-y-1">
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
      </div>

      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? "Cargando..." : "Iniciar Sesión"}
      </Button>

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={onShowSignup}
          disabled={isPending}
          className="h-auto p-0"
        >
          ¿No tienes cuenta? Regístrate
        </Button>
      </div>
    </form>
  );
}
