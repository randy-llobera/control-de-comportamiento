import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationError } from "@/lib/application-error";
import {
  createCategory,
  deleteCategory,
  getCategoryList,
  updateCategory,
} from "@/lib/categories";

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

const ACTOR_ID = "11111111-1111-4111-8111-111111111111";
const CATEGORY_ID = "22222222-2222-4222-8222-222222222222";

const setActorRole = (role: "admin" | "coordinator" | "teacher") => {
  if (role === "teacher") {
    mocks.requirePermission.mockRejectedValue(
      new ApplicationError("forbidden"),
    );
    return;
  }

  mocks.requirePermission.mockResolvedValue({
    id: ACTOR_ID,
    displayName: "Ada Lovelace",
    schoolRole: "Tecnología",
    role,
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getCategoryList", () => {
  it("maps category rows into neutral contracts", async () => {
    setActorRole("coordinator");
    const order = vi.fn().mockResolvedValue({
      data: [
        {
          id: CATEGORY_ID,
          name: "Convivencia",
          users: { display_name: "Ada Lovelace" },
        },
      ],
      error: null,
    });
    const from = vi.fn(() => ({
      select: vi.fn(() => ({ order })),
    }));
    mocks.createClient.mockResolvedValue({ from });

    await expect(getCategoryList()).resolves.toEqual([
      {
        id: CATEGORY_ID,
        name: "Convivencia",
        createdByDisplayName: "Ada Lovelace",
      },
    ]);
    expect(mocks.requirePermission).toHaveBeenCalledWith(
      expect.objectContaining({ from }),
      "categories:manage",
    );
  });

  it("uses an empty display name when the creator relation is unavailable", async () => {
    setActorRole("admin");
    const from = vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({
          data: [{ id: CATEGORY_ID, name: "Convivencia", users: null }],
          error: null,
        }),
      })),
    }));
    mocks.createClient.mockResolvedValue({ from });

    await expect(getCategoryList()).resolves.toEqual([
      {
        id: CATEGORY_ID,
        name: "Convivencia",
        createdByDisplayName: "",
      },
    ]);
  });

  it("rejects teachers before querying categories", async () => {
    setActorRole("teacher");
    const from = vi.fn();
    mocks.createClient.mockResolvedValue({ from });

    await expect(getCategoryList()).rejects.toEqual(
      new ApplicationError("forbidden"),
    );
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated requests before querying categories", async () => {
    mocks.requirePermission.mockRejectedValue(
      new ApplicationError("unauthenticated"),
    );
    const from = vi.fn();
    mocks.createClient.mockResolvedValue({ from });

    await expect(getCategoryList()).rejects.toEqual(
      new ApplicationError("unauthenticated"),
    );
    expect(from).not.toHaveBeenCalled();
  });
});

describe("category mutations", () => {
  it.each([
    ["create", () => createCategory({ name: "Convivencia" })],
    ["update", () => updateCategory({ id: CATEGORY_ID, name: "Convivencia" })],
    ["delete", () => deleteCategory(CATEGORY_ID)],
  ])(
    "rejects teacher %s operations before querying categories",
    async (_operation, run) => {
      setActorRole("teacher");
      const from = vi.fn();
      mocks.createClient.mockResolvedValue({ from });

      await expect(run()).rejects.toEqual(new ApplicationError("forbidden"));
      expect(from).not.toHaveBeenCalled();
    },
  );

  it("derives the creator from the authorized actor", async () => {
    setActorRole("coordinator");
    const nameMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi
      .fn()
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ maybeSingle: nameMaybeSingle })),
        })),
      })
      .mockReturnValueOnce({ insert });
    mocks.createClient.mockResolvedValue({ from });

    await expect(
      createCategory({ name: "Convivencia" }),
    ).resolves.toBeUndefined();
    expect(insert).toHaveBeenCalledWith({
      name: "Convivencia",
      created_by: ACTOR_ID,
    });
  });

  it("maps duplicate category names to a conflict", async () => {
    setActorRole("admin");
    const from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: CATEGORY_ID },
            error: null,
          }),
        })),
      })),
    }));
    mocks.createClient.mockResolvedValue({ from });

    await expect(createCategory({ name: "Convivencia" })).rejects.toEqual(
      new ApplicationError("conflict"),
    );
  });

  it("rethrows unexpected category creation failures", async () => {
    setActorRole("admin");
    const error = new Error("unexpected create failure");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const from = vi
      .fn()
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      })
      .mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error }),
      });
    mocks.createClient.mockResolvedValue({ from });

    await expect(createCategory({ name: "Convivencia" })).rejects.toBe(error);
  });

  it("renames an available existing category", async () => {
    setActorRole("admin");
    const nameMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const updateMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: CATEGORY_ID },
      error: null,
    });
    const neq = vi.fn(() => ({ maybeSingle: nameMaybeSingle }));
    const from = vi
      .fn()
      .mockReturnValueOnce({
        select: vi.fn(() => ({ eq: vi.fn(() => ({ neq })) })),
      })
      .mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({ maybeSingle: updateMaybeSingle })),
          })),
        })),
      });
    mocks.createClient.mockResolvedValue({ from });

    await expect(
      updateCategory({ id: CATEGORY_ID, name: "Respeto" }),
    ).resolves.toBeUndefined();
    expect(neq).toHaveBeenCalledWith("id", CATEGORY_ID);
  });

  it("rejects a rename when another category has the requested name", async () => {
    setActorRole("admin");
    const update = vi.fn();
    const from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          neq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: "33333333-3333-4333-8333-333333333333",
              error: null,
            }),
          })),
        })),
      })),
      update,
    }));
    mocks.createClient.mockResolvedValue({ from });

    await expect(
      updateCategory({ id: CATEGORY_ID, name: "Respeto" }),
    ).rejects.toEqual(new ApplicationError("conflict"));
    expect(from).toHaveBeenCalledOnce();
    expect(update).not.toHaveBeenCalled();
  });

  it("returns not-found when the category to rename does not exist", async () => {
    setActorRole("admin");
    const from = vi
      .fn()
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            neq: vi.fn(() => ({
              maybeSingle: vi
                .fn()
                .mockResolvedValue({ data: null, error: null }),
            })),
          })),
        })),
      })
      .mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              maybeSingle: vi
                .fn()
                .mockResolvedValue({ data: null, error: null }),
            })),
          })),
        })),
      });
    mocks.createClient.mockResolvedValue({ from });

    await expect(
      updateCategory({ id: CATEGORY_ID, name: "Respeto" }),
    ).rejects.toEqual(new ApplicationError("not-found"));
  });

  it("rejects deletion when incidents reference the category", async () => {
    setActorRole("coordinator");
    const from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({
            data: [{ id: "33333333-3333-4333-8333-333333333333" }],
            error: null,
          }),
        })),
      })),
    }));
    mocks.createClient.mockResolvedValue({ from });

    await expect(deleteCategory(CATEGORY_ID)).rejects.toEqual(
      new ApplicationError("conflict"),
    );
    expect(from).toHaveBeenCalledOnce();
    expect(from).toHaveBeenCalledWith("incidents");
  });

  it("rethrows unexpected category deletion failures", async () => {
    setActorRole("coordinator");
    const error = new Error("unexpected delete failure");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const from = vi
      .fn()
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
        })),
      })
      .mockReturnValueOnce({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error,
              }),
            })),
          })),
        })),
      });
    mocks.createClient.mockResolvedValue({ from });

    await expect(deleteCategory(CATEGORY_ID)).rejects.toBe(error);
  });

  it("deletes an unused existing category", async () => {
    setActorRole("coordinator");
    const deleteCategoryRow = vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: CATEGORY_ID },
            error: null,
          }),
        })),
      })),
    }));
    const from = vi
      .fn()
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
        })),
      })
      .mockReturnValueOnce({ delete: deleteCategoryRow });
    mocks.createClient.mockResolvedValue({ from });

    await expect(deleteCategory(CATEGORY_ID)).resolves.toBeUndefined();
    expect(from.mock.calls.map(([table]) => table)).toEqual([
      "incidents",
      "categories",
    ]);
  });
});
