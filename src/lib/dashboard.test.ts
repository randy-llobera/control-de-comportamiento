import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationError } from "@/lib/application-error";
import { getDashboardPageData } from "@/lib/dashboard";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  requirePermission: vi.fn(),
}));

vi.mock("@/lib/supabase-server", () => ({
  createClient: mocks.createClient,
}));

vi.mock("@/lib/auth", () => ({
  requirePermission: mocks.requirePermission,
}));

const setActorRole = (role: "admin" | "coordinator" | "teacher") => {
  if (role === "teacher") {
    mocks.requirePermission.mockRejectedValue(
      new ApplicationError("forbidden"),
    );
    return;
  }

  mocks.requirePermission.mockResolvedValue({
    id: "11111111-1111-4111-8111-111111111111",
    displayName: "Ada Lovelace",
    schoolRole: "Tecnología",
    role,
  });
};

const setIncidentRows = (data: unknown[]) => {
  const order = vi.fn().mockResolvedValue({ data, error: null });
  const from = vi.fn(() => ({
    select: vi.fn(() => ({ order })),
  }));
  mocks.createClient.mockResolvedValue({ from });

  return { from, order };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getDashboardPageData", () => {
  it.each(["coordinator", "admin"] as const)(
    "authorizes %s and maps database rows into dashboard contracts",
    async (role) => {
      setActorRole(role);
      const order = vi.fn().mockResolvedValue({
        data: [
          {
            id: "incident-1",
            created_at: "2026-08-03T09:00:00.000Z",
            date: "2026-08-03",
            severity: "high",
            description: "Interrupción reiterada",
            students: { name: "Ana", groups: { name: "2º A" } },
            categories: { name: "Convivencia" },
          },
        ],
        error: null,
      });
      const select = vi.fn(() => ({ order }));
      const from = vi.fn(() => ({ select }));
      mocks.createClient.mockResolvedValue({ from });

      await expect(getDashboardPageData()).resolves.toEqual({
        summary: {
          total: 1,
          bySeverity: { low: 0, medium: 0, high: 1 },
          byCategory: { Convivencia: 1 },
          byGroup: { "2º A": 1 },
        },
        recentIncidents: [
          {
            id: "incident-1",
            date: "2026-08-03",
            severity: "high",
            description: "Interrupción reiterada",
            studentName: "Ana",
            categoryName: "Convivencia",
            groupName: "2º A",
          },
        ],
      });
      expect(mocks.requirePermission).toHaveBeenCalledWith(
        expect.objectContaining({ from }),
        "dashboard:read",
      );
      expect(from).toHaveBeenCalledTimes(1);
      expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
    },
  );

  it("rejects teachers before querying incidents", async () => {
    setActorRole("teacher");
    const from = vi.fn();
    mocks.createClient.mockResolvedValue({ from });

    await expect(getDashboardPageData()).rejects.toEqual(
      new ApplicationError("forbidden"),
    );
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated requests before querying incidents", async () => {
    mocks.requirePermission.mockRejectedValue(
      new ApplicationError("unauthenticated"),
    );
    const from = vi.fn();
    mocks.createClient.mockResolvedValue({ from });

    await expect(getDashboardPageData()).rejects.toEqual(
      new ApplicationError("unauthenticated"),
    );
    expect(from).not.toHaveBeenCalled();
  });

  it("maps unavailable relationships to neutral missing values", async () => {
    setActorRole("admin");
    const from = vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: "incident-1",
              created_at: null,
              date: "2026-08-03",
              severity: "low",
              description: "",
              students: null,
              categories: null,
            },
          ],
          error: null,
        }),
      })),
    }));
    mocks.createClient.mockResolvedValue({ from });

    const data = await getDashboardPageData();

    expect(data.summary.byCategory).toEqual({ "Sin categoría": 1 });
    expect(data.summary.byGroup).toEqual({ "Sin grupo": 1 });
    expect(data.recentIncidents[0]).toMatchObject({
      studentName: "",
      categoryName: "",
      groupName: "",
    });
  });

  it("returns zero and empty collections when there are no incidents", async () => {
    setActorRole("admin");
    setIncidentRows([]);

    await expect(getDashboardPageData()).resolves.toEqual({
      summary: {
        total: 0,
        bySeverity: { low: 0, medium: 0, high: 0 },
        byCategory: {},
        byGroup: {},
      },
      recentIncidents: [],
    });
  });

  it("produces exact severity, category, and group counts", async () => {
    setActorRole("coordinator");
    setIncidentRows([
      {
        id: "incident-1",
        created_at: "2026-08-01T10:00:00.000Z",
        date: "2026-08-01",
        severity: "low",
        description: "First",
        students: { name: "Ana", groups: { name: "2º A" } },
        categories: { name: "Convivencia" },
      },
      {
        id: "incident-2",
        created_at: "2026-08-02T10:00:00.000Z",
        date: "2026-08-02",
        severity: "high",
        description: "Second",
        students: { name: "Bruno", groups: { name: "3º B" } },
        categories: { name: "Respeto" },
      },
      {
        id: "incident-3",
        created_at: "2026-08-03T10:00:00.000Z",
        date: "2026-08-03",
        severity: "high",
        description: "Third",
        students: null,
        categories: null,
      },
    ]);

    const { summary } = await getDashboardPageData();

    expect(summary).toEqual({
      total: 3,
      bySeverity: { low: 1, medium: 0, high: 2 },
      byCategory: { Convivencia: 1, Respeto: 1, "Sin categoría": 1 },
      byGroup: { "2º A": 1, "3º B": 1, "Sin grupo": 1 },
    });
  });

  it("orders recent incidents newest first and limits them to ten", async () => {
    setActorRole("admin");
    setIncidentRows(
      Array.from({ length: 12 }, (_, index) => {
        const number = index + 1;
        const day = String(number).padStart(2, "0");

        return {
          id: `incident-${number}`,
          created_at: `2026-08-${day}T10:00:00.000Z`,
          date: `2026-08-${day}`,
          severity: "medium",
          description: `Description ${number}`,
          students: { name: `Student ${number}`, groups: { name: "2º A" } },
          categories: { name: "Convivencia" },
        };
      }).reverse(),
    );

    const { recentIncidents } = await getDashboardPageData();

    expect(recentIncidents.map(({ id }) => id)).toEqual([
      "incident-12",
      "incident-11",
      "incident-10",
      "incident-9",
      "incident-8",
      "incident-7",
      "incident-6",
      "incident-5",
      "incident-4",
      "incident-3",
    ]);
  });

  it("rejects an invalid database severity", async () => {
    setActorRole("admin");
    setIncidentRows([
      {
        id: "incident-1",
        created_at: "2026-08-03T10:00:00.000Z",
        date: "2026-08-03",
        severity: "critical",
        description: "Invalid severity",
        students: { name: "Ana", groups: { name: "2º A" } },
        categories: { name: "Convivencia" },
      },
    ]);

    await expect(getDashboardPageData()).rejects.toThrow(
      "Invalid incident severity.",
    );
  });

  it("rethrows database failures", async () => {
    setActorRole("coordinator");
    const error = new Error("unexpected dashboard failure");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const from = vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ data: null, error }),
      })),
    }));
    mocks.createClient.mockResolvedValue({ from });

    await expect(getDashboardPageData()).rejects.toBe(error);
  });
});
