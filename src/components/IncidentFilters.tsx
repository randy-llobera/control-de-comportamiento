"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  IncidentCategoryOption,
  IncidentGroupOption,
} from "@/types/incidents";

export type IncidentFilterValues = {
  category: string;
  severity: string;
  group: string;
  dateFrom: string;
  dateTo: string;
};

type IncidentFiltersProps = {
  filters: IncidentFilterValues;
  categories: IncidentCategoryOption[];
  groups: IncidentGroupOption[];
  onFiltersChange: (filters: IncidentFilterValues) => void;
};

const selectClassName =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]";

export function IncidentFilters({
  filters,
  categories,
  groups,
  onFiltersChange,
}: IncidentFiltersProps) {
  const updateFilter = (
    field: keyof IncidentFilterValues,
    value: string,
  ) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  return (
    <section
      aria-labelledby="incident-filters-title"
      className="mb-6 rounded-lg bg-white p-4 shadow"
    >
      <h2 id="incident-filters-title" className="mb-4 text-lg font-medium">
        Filtros
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="space-y-2">
          <Label htmlFor="incident-filter-category">Categoría</Label>
          <select
            id="incident-filter-category"
            value={filters.category}
            onChange={(event) =>
              updateFilter("category", event.target.value)
            }
            className={selectClassName}
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="incident-filter-severity">Gravedad</Label>
          <select
            id="incident-filter-severity"
            value={filters.severity}
            onChange={(event) =>
              updateFilter("severity", event.target.value)
            }
            className={selectClassName}
          >
            <option value="">Todas</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="incident-filter-group">Grupo</Label>
          <select
            id="incident-filter-group"
            value={filters.group}
            onChange={(event) => updateFilter("group", event.target.value)}
            className={selectClassName}
          >
            <option value="">Todos</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="incident-filter-date-from">Desde</Label>
          <Input
            id="incident-filter-date-from"
            type="date"
            value={filters.dateFrom}
            onChange={(event) => updateFilter("dateFrom", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="incident-filter-date-to">Hasta</Label>
          <Input
            id="incident-filter-date-to"
            type="date"
            value={filters.dateTo}
            onChange={(event) => updateFilter("dateTo", event.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
