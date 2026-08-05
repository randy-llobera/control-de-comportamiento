import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationError } from "@/lib/application-error";
import {
  createGroup,
  deleteGroup,
  getGroupList,
  updateGroup,
} from "@/lib/groups";

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
const GROUP_ID = "22222222-2222-4222-8222-222222222222";

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

describe("getGroupList", () => {
  it("maps group rows into neutral contracts", async () => {
    setActorRole("coordinator");
    const order = vi.fn().mockResolvedValue({
      data: [
        {
          id: GROUP_ID,
          name: "1º A",
          users: { display_name: "Ada Lovelace" },
        },
      ],
      error: null,
    });
    const from = vi.fn(() => ({
      select: vi.fn(() => ({ order })),
    }));
    mocks.createClient.mockResolvedValue({ from });

    await expect(getGroupList()).resolves.toEqual([
      {
        id: GROUP_ID,
        name: "1º A",
        createdByDisplayName: "Ada Lovelace",
      },
    ]);
    expect(mocks.requirePermission).toHaveBeenCalledWith(
      expect.objectContaining({ from }),
      "groups:manage",
    );
  });

  it("uses an empty display name when the creator relation is unavailable", async () => {
    setActorRole("admin");
    const from = vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({
          data: [{ id: GROUP_ID, name: "1º A", users: null }],
          error: null,
        }),
      })),
    }));
    mocks.createClient.mockResolvedValue({ from });

    await expect(getGroupList()).resolves.toEqual([
      { id: GROUP_ID, name: "1º A", createdByDisplayName: "" },
    ]);
  });

  it("rejects teachers before querying groups", async () => {
    setActorRole("teacher");
    const from = vi.fn();
    mocks.createClient.mockResolvedValue({ from });

    await expect(getGroupList()).rejects.toEqual(
      new ApplicationError("forbidden"),
    );
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated requests before querying groups", async () => {
    mocks.requirePermission.mockRejectedValue(
      new ApplicationError("unauthenticated"),
    );
    const from = vi.fn();
    mocks.createClient.mockResolvedValue({ from });

    await expect(getGroupList()).rejects.toEqual(
      new ApplicationError("unauthenticated"),
    );
    expect(from).not.toHaveBeenCalled();
  });
});

describe("group mutations", () => {
  it.each([
    ["create", () => createGroup({ name: "1º A" })],
    ["update", () => updateGroup({ id: GROUP_ID, name: "1º A" })],
    ["delete", () => deleteGroup(GROUP_ID)],
  ])(
    "rejects teacher %s operations before querying groups",
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

    await expect(createGroup({ name: "1º A" })).resolves.toBeUndefined();
    expect(insert).toHaveBeenCalledWith({ name: "1º A", created_by: ACTOR_ID });
  });

  it("maps duplicate group names to a conflict", async () => {
    setActorRole("admin");
    const from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: GROUP_ID },
            error: null,
          }),
        })),
      })),
    }));
    mocks.createClient.mockResolvedValue({ from });

    await expect(createGroup({ name: "1º A" })).rejects.toEqual(
      new ApplicationError("conflict"),
    );
  });

  it("renames an available existing group", async () => {
    setActorRole("admin");
    const nameMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const updateMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: GROUP_ID },
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
      updateGroup({ id: GROUP_ID, name: "1º B" }),
    ).resolves.toBeUndefined();
    expect(neq).toHaveBeenCalledWith("id", GROUP_ID);
  });

  it("rejects a rename when another group has the requested name", async () => {
    setActorRole("admin");
    const update = vi.fn();
    const from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          neq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: "33333333-3333-4333-8333-333333333333" },
              error: null,
            }),
          })),
        })),
      })),
      update,
    }));
    mocks.createClient.mockResolvedValue({ from });

    await expect(
      updateGroup({ id: GROUP_ID, name: "1º B" }),
    ).rejects.toEqual(new ApplicationError("conflict"));
    expect(from).toHaveBeenCalledOnce();
    expect(update).not.toHaveBeenCalled();
  });

  it("returns not-found when the group to rename does not exist", async () => {
    setActorRole("admin");
    const nameMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const updateMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const from = vi
      .fn()
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            neq: vi.fn(() => ({ maybeSingle: nameMaybeSingle })),
          })),
        })),
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
      updateGroup({ id: GROUP_ID, name: "1º B" }),
    ).rejects.toEqual(new ApplicationError("not-found"));
  });

  it("rejects deletion when students reference the group", async () => {
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

    await expect(deleteGroup(GROUP_ID)).rejects.toEqual(
      new ApplicationError("conflict"),
    );
    expect(from).toHaveBeenCalledOnce();
    expect(from).toHaveBeenCalledWith("students");
  });

  it("deletes an unused existing group", async () => {
    setActorRole("coordinator");
    const deleteMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: GROUP_ID },
      error: null,
    });
    const deleteGroupRow = vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({ maybeSingle: deleteMaybeSingle })),
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
      .mockReturnValueOnce({ delete: deleteGroupRow });
    mocks.createClient.mockResolvedValue({ from });

    await expect(deleteGroup(GROUP_ID)).resolves.toBeUndefined();
    expect(from.mock.calls.map(([table]) => table)).toEqual([
      "students",
      "groups",
    ]);
    expect(deleteGroupRow).toHaveBeenCalledOnce();
  });

  it("returns not-found when the unused group to delete does not exist", async () => {
    setActorRole("admin");
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
                error: null,
              }),
            })),
          })),
        })),
      });
    mocks.createClient.mockResolvedValue({ from });

    await expect(deleteGroup(GROUP_ID)).rejects.toEqual(
      new ApplicationError("not-found"),
    );
  });
});
