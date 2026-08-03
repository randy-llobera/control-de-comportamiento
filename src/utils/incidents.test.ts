import { describe, expect, it } from "vitest";

import type {
  IncidentFilterCriteria,
  IncidentListItem,
  IncidentSeverity,
} from "@/types/incidents";
import {
  filterIncidents,
  formatIncidentCsvFilename,
  serializeIncidentsToCsv,
} from "@/utils/incidents";

const UTF8_BOM = "\uFEFF";

const EMPTY_FILTERS: IncidentFilterCriteria = {
  category: "",
  severity: "",
  group: "",
  dateFrom: "",
  dateTo: "",
};

function createFilterIncident(
  id: string,
  overrides: {
    category?: string;
    severity?: IncidentSeverity;
    group?: string;
    date?: string;
  } = {},
): IncidentListItem {
  return {
    id,
    date: overrides.date ?? "2026-07-15",
    severity: overrides.severity ?? "medium",
    description: `Description ${id}`,
    canManage: true,
    student: {
      id: `student-${id}`,
      name: `Student ${id}`,
      group: {
        id: overrides.group ?? "group-a",
        name: "Group A",
      },
    },
    category: {
      id: overrides.category ?? "category-a",
      name: "Category A",
    },
    teacher: {
      id: `teacher-${id}`,
      displayName: `Teacher ${id}`,
    },
  };
}

const incidents = [
  createFilterIncident("first", { date: "2026-07-01", severity: "low" }),
  createFilterIncident("second"),
  createFilterIncident("third", {
    category: "category-b",
    severity: "high",
    group: "group-b",
    date: "2026-07-31",
  }),
];

describe("filterIncidents", () => {
  it("returns all incidents in source order when filters are empty", () => {
    expect(
      filterIncidents(incidents, EMPTY_FILTERS).map(({ id }) => id),
    ).toEqual(["first", "second", "third"]);
  });

  it.each([
    ["category", { category: "category-b" }, ["third"]],
    ["severity", { severity: "medium" }, ["second"]],
    ["group", { group: "group-b" }, ["third"]],
    ["start date", { dateFrom: "2026-07-15" }, ["second", "third"]],
    ["end date", { dateTo: "2026-07-15" }, ["first", "second"]],
    [
      "date range",
      { dateFrom: "2026-07-02", dateTo: "2026-07-30" },
      ["second"],
    ],
  ] as const)("applies the %s filter", (_label, criteria, expectedIds) => {
    expect(
      filterIncidents(incidents, { ...EMPTY_FILTERS, ...criteria }).map(
        ({ id }) => id,
      ),
    ).toEqual(expectedIds);
  });

  it("applies combined filters to the same ordered collection", () => {
    const filters: IncidentFilterCriteria = {
      category: "category-b",
      severity: "high",
      group: "group-b",
      dateFrom: "2026-07-01",
      dateTo: "2026-07-31",
    };

    expect(filterIncidents(incidents, filters).map(({ id }) => id)).toEqual([
      "third",
    ]);
  });

  it("returns an empty collection when no incident matches", () => {
    expect(
      filterIncidents(incidents, {
        ...EMPTY_FILTERS,
        category: "missing-category",
      }),
    ).toEqual([]);
  });
});

function createCsvIncident(
  overrides: Partial<IncidentListItem> = {},
): IncidentListItem {
  return {
    id: "incident-1",
    date: "2026-07-31",
    severity: "high",
    description: "Descripción habitual",
    canManage: true,
    student: {
      id: "student-1",
      name: "Álex Pérez",
      group: { id: "group-1", name: "2º A" },
    },
    category: { id: "category-1", name: "Convivencia" },
    teacher: { id: "teacher-1", displayName: "María López" },
    ...overrides,
  };
}

describe("serializeIncidentsToCsv", () => {
  it("writes Spanish headers and mapped display values in source order", () => {
    const csv = serializeIncidentsToCsv([
      createCsvIncident(),
      createCsvIncident({
        id: "incident-2",
        date: "2026-07-30",
        severity: "low",
      }),
    ]);

    expect(csv).toBe(
      UTF8_BOM +
        '"Fecha","Estudiante","Grupo","Categoría","Gravedad","Descripción","Profesor"\r\n' +
        '"31-07-2026","Álex Pérez","2º A","Convivencia","Alta","Descripción habitual","María López"\r\n' +
        '"30-07-2026","Álex Pérez","2º A","Convivencia","Baja","Descripción habitual","María López"',
    );
  });

  it("starts with the UTF-8 BOM used by spreadsheet applications", () => {
    const csv = serializeIncidentsToCsv([createCsvIncident()]);

    expect(Array.from(new TextEncoder().encode(csv).slice(0, 3))).toEqual([
      0xef, 0xbb, 0xbf,
    ]);
    expect(csv).toContain('"Categoría","Gravedad","Descripción"');
    expect(csv).toContain('"Álex Pérez"');
  });

  it("escapes commas, quotes, CR/LF, and empty values consistently", () => {
    const csv = serializeIncidentsToCsv([
      createCsvIncident({
        description: 'Dice "hola", luego sale\r\ny vuelve.',
        teacher: { id: "teacher-1", displayName: "" },
      }),
    ]);

    expect(csv).toContain('"Dice ""hola"", luego sale\r\ny vuelve.",""');
  });

  it("serializes an empty collection as the header row", () => {
    expect(serializeIncidentsToCsv([])).toBe(
      UTF8_BOM +
        '"Fecha","Estudiante","Grupo","Categoría","Gravedad","Descripción","Profesor"',
    );
  });
});

describe("formatIncidentCsvFilename", () => {
  it("uses the local calendar date in YYYYMMDD format", () => {
    expect(formatIncidentCsvFilename(new Date(2026, 0, 9))).toBe(
      "incidentes-20260109.csv",
    );
  });
});
