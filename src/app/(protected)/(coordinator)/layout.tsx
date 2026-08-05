import { redirect } from "next/navigation";
import { getCurrentUserWithRole } from "@/lib/auth";

export default async function CoordinatorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const auth = await getCurrentUserWithRole();

  if (!auth.profile) redirect("/auth");
  if (auth.profile.role !== "coordinator" && auth.profile.role !== "admin") {
    redirect("/incidentes");
  }

  return children;
}
