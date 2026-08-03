"use client";

import { useRef, useState } from "react";

import { IncidentFilters } from "@/components/IncidentFilters";
import { IncidentDeleteDialog } from "@/components/IncidentDeleteDialog";
import { IncidentFormDialog } from "@/components/IncidentFormDialog";
import { IncidentList } from "@/components/IncidentList";
import { Button } from "@/components/ui/button";
import type {
  IncidentFilterCriteria,
  IncidentListItem,
  IncidentPageData,
} from "@/types/incidents";
import {
  filterIncidents,
  formatIncidentCsvFilename,
  serializeIncidentsToCsv,
} from "@/utils/incidents";

type IncidentsViewProps = {
  initialData: IncidentPageData;
};

type ActiveDialog =
  | { type: "create" }
  | { type: "edit"; incident: IncidentListItem }
  | { type: "delete"; incident: IncidentListItem };

const EMPTY_FILTERS: IncidentFilterCriteria = {
  category: "",
  severity: "",
  group: "",
  dateFrom: "",
  dateTo: "",
};

export function IncidentsView({ initialData }: IncidentsViewProps) {
  const { incidents, formOptions } = initialData;
  const { groups, categories } = formOptions;
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const createIncidentButtonRef = useRef<HTMLButtonElement>(null);

  const closeDialog = () => {
    setActiveDialog(undefined);
  };

  const closeCreateDialog = () => {
    setActiveDialog(undefined);
    requestAnimationFrame(() => createIncidentButtonRef.current?.focus());
  };

  const filteredIncidents = filterIncidents(incidents, filters);

  const exportCSV = () => {
    const blob = new Blob([serializeIncidentsToCsv(filteredIncidents)], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    try {
      link.href = url;
      link.download = formatIncidentCsvFilename(new Date());
      document.body.appendChild(link);
      link.click();
    } finally {
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Incidentes</h1>
            <div className="flex flex-wrap gap-2">
              <Button
                ref={createIncidentButtonRef}
                onClick={() => setActiveDialog({ type: "create" })}
              >
                Nuevo incidente
              </Button>
              <Button variant="outline" onClick={exportCSV}>
                Exportar CSV
              </Button>
            </div>
          </div>

          <IncidentFilters
            filters={filters}
            categories={categories}
            groups={groups}
            onFiltersChange={setFilters}
          />

          <IncidentList
            incidents={filteredIncidents}
            onEdit={(incident) => setActiveDialog({ type: "edit", incident })}
            onDelete={(incident) =>
              setActiveDialog({ type: "delete", incident })
            }
          />
        </div>
      </div>

      {activeDialog?.type === "create" && (
        <IncidentFormDialog
          mode="create"
          groups={groups}
          categories={categories}
          onClose={closeCreateDialog}
        />
      )}

      {activeDialog?.type === "edit" && activeDialog.incident.canManage && (
        <IncidentFormDialog
          key={activeDialog.incident.id}
          mode="edit"
          incident={activeDialog.incident}
          categories={categories}
          onClose={closeDialog}
        />
      )}

      {activeDialog?.type === "delete" && activeDialog.incident.canManage && (
        <IncidentDeleteDialog
          incident={activeDialog.incident}
          onClose={closeDialog}
        />
      )}
    </div>
  );
}
