import { StudentsView } from "@/components/StudentsView";
import { getStudentPageData } from "@/lib/students";

export default async function StudentsPage() {
  const data = await getStudentPageData();

  return (
    <div className="min-h-screen bg-app-background">
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <StudentsView {...data} />
        </div>
      </div>
    </div>
  );
}
