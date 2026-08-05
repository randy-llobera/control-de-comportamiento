import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-app-text">
            Control de Comportamiento
          </h1>
          <p className="mt-2 text-app-text-subtle">
            Sistema de gestión de incidentes estudiantiles
          </p>
        </div>
        <div className="space-y-4">
          <Link
            href="/auth"
            className="flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-2"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </main>
  );
}
