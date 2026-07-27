import { IncidentsView } from "@/components/IncidentsView";
import { getIncidentPageData } from "@/lib/incidents";

export default async function IncidentsPage() {
  const initialData = await getIncidentPageData();

  return <IncidentsView initialData={initialData} />;
}
