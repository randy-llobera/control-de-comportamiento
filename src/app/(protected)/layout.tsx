import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { getCurrentUserWithRole } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const auth = await getCurrentUserWithRole();

  if (!auth.profile) {
    redirect(auth.reason === "missing-profile" ? "/auth?error=profile" : "/auth");
  }

  return (
    <div className="flex h-screen flex-col bg-app-background lg:flex-row">
      <Navigation user={auth.profile} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
