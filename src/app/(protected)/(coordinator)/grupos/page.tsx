import { GroupsView } from "@/components/GroupsView";
import { getGroupList } from "@/lib/groups";

export default async function GruposPage() {
  const groups = await getGroupList();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <GroupsView groups={groups} />
        </div>
      </div>
    </div>
  );
}
