import { redirect } from "next/navigation";
import { getCurrentUserWithRole } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const auth = await getCurrentUserWithRole();

  if (!auth.profile) redirect("/auth");
  if (auth.profile.role !== "admin") redirect("/incidentes");

  return children;
}
