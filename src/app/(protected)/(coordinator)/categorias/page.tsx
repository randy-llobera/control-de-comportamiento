import { CategoriesView } from "@/components/CategoriesView";
import { getCategoryList } from "@/lib/categories";

export default async function CategoriasPage() {
  const categories = await getCategoryList();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <CategoriesView categories={categories} />
        </div>
      </div>
    </div>
  );
}
