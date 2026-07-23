import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationError } from "@/lib/application-error";
import { getUserPageData, updateUserRole } from "@/lib/users";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  loadCurrentUserWithRole: vi.fn(),
}));

vi.mock("@/lib/supabase-server", () => ({
  createClient: mocks.createClient,
}));

vi.mock("@/lib/auth", () => ({
  loadCurrentUserWithRole: mocks.loadCurrentUserWithRole,
}));

const ACTOR_ID = "11111111-1111-4111-8111-111111111111";
const USER_ID = "22222222-2222-4222-8222-222222222222";
const ROLE_ID = "33333333-3333-4333-8333-333333333333";

const setActorRole = (role: "admin" | "coordinator" | "teacher") => {
  mocks.loadCurrentUserWithRole.mockResolvedValue({
    profile: { id: ACTOR_ID, roles: { name: role } },
    reason: null,
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getUserPageData", () => {
  it("maps admin user-management data into neutral contracts", async () => {
    setActorRole("admin");
    const usersQuery = Promise.resolve({
      data: [
        {
          id: USER_ID,
          display_name: "Ada Lovelace",
          school_role: "Tecnología",
          roles: { id: ROLE_ID, name: "teacher" },
        },
      ],
      error: null,
    });
    const rolesQuery = Promise.resolve({
      data: [{ id: ROLE_ID, name: "teacher" }],
      error: null,
    });
    const from = vi.fn((table: string) => {
      if (table === "users") {
        return {
          select: vi.fn(() => ({
            order: vi.fn(() => usersQuery),
          })),
        };
      }

      return {
        select: vi.fn(() => ({
          order: vi.fn(() => rolesQuery),
        })),
      };
    });
    mocks.createClient.mockResolvedValue({ from });

    await expect(getUserPageData()).resolves.toEqual({
      users: [
        {
          id: USER_ID,
          displayName: "Ada Lovelace",
          schoolRole: "Tecnología",
          role: { id: ROLE_ID, name: "teacher" },
        },
      ],
      roles: [{ id: ROLE_ID, name: "teacher" }],
    });
  });

  it.each(["teacher", "coordinator"] as const)(
    "rejects a %s before querying managed users",
    async (role) => {
      setActorRole(role);
      const from = vi.fn();
      mocks.createClient.mockResolvedValue({ from });

      await expect(getUserPageData()).rejects.toMatchObject({
        code: "forbidden",
      });
      expect(from).not.toHaveBeenCalled();
    },
  );
});

describe("updateUserRole", () => {
  it("updates a user after admin authorization and role validation", async () => {
    setActorRole("admin");
    const roleMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: ROLE_ID },
      error: null,
    });
    const userMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: USER_ID },
      error: null,
    });
    const roleEq = vi.fn(() => ({ maybeSingle: roleMaybeSingle }));
    const userSelect = vi.fn(() => ({ maybeSingle: userMaybeSingle }));
    const userEq = vi.fn(() => ({ select: userSelect }));
    const update = vi.fn(() => ({ eq: userEq }));
    const from = vi.fn((table: string) =>
      table === "roles"
        ? {
            select: vi.fn(() => ({
              eq: roleEq,
            })),
          }
        : {
            update,
          },
    );
    mocks.createClient.mockResolvedValue({ from });

    await expect(
      updateUserRole({ userId: USER_ID, roleId: ROLE_ID }),
    ).resolves.toBeUndefined();
    expect(from).toHaveBeenCalledWith("roles");
    expect(from).toHaveBeenCalledWith("users");
    expect(roleEq).toHaveBeenCalledWith("id", ROLE_ID);
    expect(update).toHaveBeenCalledWith({ role_id: ROLE_ID });
    expect(userEq).toHaveBeenCalledWith("id", USER_ID);
  });

  it.each(["teacher", "coordinator"] as const)(
    "rejects a %s before updating a managed user",
    async (role) => {
      setActorRole(role);
      const from = vi.fn();
      mocks.createClient.mockResolvedValue({ from });

      await expect(
        updateUserRole({ userId: USER_ID, roleId: ROLE_ID }),
      ).rejects.toMatchObject({ code: "forbidden" });
      expect(from).not.toHaveBeenCalled();
    },
  );

  it("maps an unknown role to a known not-found error", async () => {
    setActorRole("admin");
    const from = vi.fn((table: string) => {
      if (table !== "roles") {
        throw new Error("Users must not be updated for an unknown role.");
      }

      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      };
    });
    mocks.createClient.mockResolvedValue({ from });

    await expect(
      updateUserRole({ userId: USER_ID, roleId: ROLE_ID }),
    ).rejects.toEqual(new ApplicationError("not-found"));
  });

  it("maps an unknown user to a known not-found error", async () => {
    setActorRole("admin");
    const from = vi.fn((table: string) =>
      table === "roles"
        ? {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi
                  .fn()
                  .mockResolvedValue({ data: { id: ROLE_ID }, error: null }),
              })),
            })),
          }
        : {
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => ({
                  maybeSingle: vi
                    .fn()
                    .mockResolvedValue({ data: null, error: null }),
                })),
              })),
            })),
          },
    );
    mocks.createClient.mockResolvedValue({ from });

    await expect(
      updateUserRole({ userId: USER_ID, roleId: ROLE_ID }),
    ).rejects.toEqual(new ApplicationError("not-found"));
  });
});
