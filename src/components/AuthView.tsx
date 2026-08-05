"use client";

import { useState } from "react";

import { AuthLoginForm } from "@/components/AuthLoginForm";
import { AuthSignupForm } from "@/components/AuthSignupForm";

type AuthMode = "login" | "signup";

export function AuthView() {
  const [mode, setMode] = useState<AuthMode>("login");
  const isLogin = mode === "login";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-app-text">
          {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
        </h1>
        <p className="mt-2 text-center text-sm text-app-text-subtle">
          {isLogin ? "Accede a tu cuenta" : "Regístrate en el sistema"}
        </p>
      </div>

      {isLogin ? (
        <AuthLoginForm onShowSignup={() => setMode("signup")} />
      ) : (
        <AuthSignupForm onShowLogin={() => setMode("login")} />
      )}
    </div>
  );
}
