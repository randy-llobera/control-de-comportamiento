"use client";

import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Algo salió mal</h1>
        <p role="alert" className="text-sm text-muted-foreground">
          No se pudo cargar esta página. Inténtalo de nuevo.
        </p>
        <Button type="button" onClick={reset}>
          Intentar de nuevo
        </Button>
      </div>
    </main>
  );
}
