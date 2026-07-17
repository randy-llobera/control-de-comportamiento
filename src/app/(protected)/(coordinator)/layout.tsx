import { redirect } from "next/navigation";
import { getCurrentUserWithRole } from "@/lib/auth";

export default async function CoordinatorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const auth = await getCurrentUserWithRole();

  if (!auth.profile) redirect("/auth");
  if (auth.profile.roles?.name !== "coordinator" && auth.profile.roles?.name !== "admin") {
    redirect("/incidentes");
  }

  return children;
}
