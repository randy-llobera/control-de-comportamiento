import { randomUUID } from "node:crypto";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Database } from "@/types/supabase";

type TestClient = SupabaseClient<Database>;
type TestRole = "admin" | "coordinator" | "teacher";

interface TestActor {
  client: TestClient;
  id: string;
  role: TestRole;
}

interface CleanupOperationResult {
  error: { message: string } | null;
}

const requireEnvironmentValue = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing integration-test environment value: ${name}`);
  }

  return value;
};

const supabaseUrl = requireEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = requireEnvironmentValue(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
);
const supabaseServiceRoleKey = requireEnvironmentValue(
  "SUPABASE_SERVICE_ROLE_KEY",
);
const localHostname = new URL(supabaseUrl).hostname;

if (localHostname !== "localhost" && localHostname !== "127.0.0.1") {
  throw new Error(
    `Integration tests refuse non-local Supabase URL: ${localHostname}`,
  );
}

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
} as const;

const adminFixtureClient = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  clientOptions,
);

const runId = randomUUID();
const password = `Local-${randomUUID()}-Aa1!`;
const actors: TestActor[] = [];
const actorIds: string[] = [];

let teacherOwner: TestActor;
let teacherOther: TestActor;
let coordinator: TestActor;
let admin: TestActor;
let teacherRoleId: string;
let coordinatorRoleId: string;
let groupId: string;
let categoryId: string;
let studentId: string;

const createActor = async (
  label: string,
  role: TestRole,
  roleId: string,
): Promise<TestActor> => {
  const email = `${label}-${runId}@integration.local`;
  const { data: createdUser, error: createError } =
    await adminFixtureClient.auth.admin.createUser({
      email,
      email_confirm: true,
      password,
      user_metadata: {
        display_name: `Integration ${label}`,
        school_role: "Integration test",
      },
    });

  if (createError || !createdUser.user) {
    throw createError ?? new Error(`Could not create ${label} fixture.`);
  }

  actorIds.push(createdUser.user.id);

  if (role !== "teacher") {
    const { error: roleError } = await adminFixtureClient
      .from("users")
      .update({ role_id: roleId })
      .eq("id", createdUser.user.id);

    if (roleError) {
      throw roleError;
    }
  }

  const client = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    clientOptions,
  );
  const { data: session, error: signInError } =
    await client.auth.signInWithPassword({ email, password });

  if (signInError || !session.user) {
    throw signInError ?? new Error(`Could not sign in ${label} fixture.`);
  }

  const actor = { client, id: session.user.id, role };
  actors.push(actor);
  return actor;
};

const expectNoAffectedRows = async (
  operation: PromiseLike<{
    data: { id: string }[] | null;
    error: { message: string } | null;
  }>,
) => {
  const { data, error } = await operation;

  expect(error).toBeNull();
  expect(data).toEqual([]);
};

const createIncident = async (
  actor: TestActor,
  description: string,
): Promise<string> => {
  const { data, error } = await actor.client
    .from("incidents")
    .insert({
      category_id: categoryId,
      date: "2026-08-04",
      description,
      severity: "medium",
      student_id: studentId,
      teacher_id: actor.id,
    })
    .select("id")
    .single();

  expect(error).toBeNull();
  expect(data).not.toBeNull();
  return data!.id;
};

const runCleanupOperation = async (
  label: string,
  operation: () => PromiseLike<CleanupOperationResult>,
  cleanupErrors: Error[],
) => {
  try {
    const { error } = await operation();

    if (error) {
      cleanupErrors.push(new Error(`${label}: ${error.message}`));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    cleanupErrors.push(new Error(`${label}: ${message}`));
  }
};

const cleanupFixtures = async () => {
  const cleanupErrors: Error[] = [];

  for (const actor of actors) {
    await runCleanupOperation(
      `Sign out ${actor.role} ${actor.id}`,
      () => actor.client.auth.signOut(),
      cleanupErrors,
    );
  }

  if (actorIds.length > 0) {
    await runCleanupOperation(
      "Delete fixture incidents",
      () =>
        adminFixtureClient
          .from("incidents")
          .delete()
          .in("teacher_id", actorIds),
      cleanupErrors,
    );

    let fixtureGroupIds: string[] = [];
    await runCleanupOperation(
      "Load fixture groups",
      async () => {
        const { data, error } = await adminFixtureClient
          .from("groups")
          .select("id")
          .in("created_by", actorIds);

        fixtureGroupIds = data?.map(({ id }) => id) ?? [];
        return { error };
      },
      cleanupErrors,
    );

    if (fixtureGroupIds.length > 0) {
      await runCleanupOperation(
        "Delete fixture students",
        () =>
          adminFixtureClient
            .from("students")
            .delete()
            .in("group_id", fixtureGroupIds),
        cleanupErrors,
      );
    }

    await runCleanupOperation(
      "Delete fixture categories",
      () =>
        adminFixtureClient
          .from("categories")
          .delete()
          .in("created_by", actorIds),
      cleanupErrors,
    );
    await runCleanupOperation(
      "Delete fixture groups",
      () =>
        adminFixtureClient.from("groups").delete().in("created_by", actorIds),
      cleanupErrors,
    );

    for (const actorId of actorIds) {
      await runCleanupOperation(
        `Delete Auth user ${actorId}`,
        () => adminFixtureClient.auth.admin.deleteUser(actorId),
        cleanupErrors,
      );
    }
  }

  if (cleanupErrors.length > 0) {
    throw new AggregateError(
      cleanupErrors,
      "Integration fixture cleanup failed.",
    );
  }
};

describe.sequential("local Supabase RLS permission matrix", () => {
  beforeAll(async () => {
    const { data: roles, error: rolesError } = await adminFixtureClient
      .from("roles")
      .select("id, name");

    if (rolesError) {
      throw rolesError;
    }

    const roleIds = new Map(roles.map(({ id, name }) => [name, id]));
    teacherRoleId = roleIds.get("teacher") ?? "";
    coordinatorRoleId = roleIds.get("coordinator") ?? "";
    const adminRoleId = roleIds.get("admin") ?? "";

    if (!teacherRoleId || !coordinatorRoleId || !adminRoleId) {
      throw new Error(
        "Local role fixtures are incomplete. Reset Supabase first.",
      );
    }

    teacherOwner = await createActor("teacher-owner", "teacher", teacherRoleId);
    teacherOther = await createActor("teacher-other", "teacher", teacherRoleId);
    coordinator = await createActor(
      "coordinator",
      "coordinator",
      coordinatorRoleId,
    );
    admin = await createActor("admin", "admin", adminRoleId);

    const { data: group, error: groupError } = await adminFixtureClient
      .from("groups")
      .insert({ created_by: admin.id, name: `Integration group ${runId}` })
      .select("id")
      .single();
    const { data: category, error: categoryError } = await adminFixtureClient
      .from("categories")
      .insert({ created_by: admin.id, name: `Integration category ${runId}` })
      .select("id")
      .single();

    if (groupError || !group || categoryError || !category) {
      throw (
        groupError ?? categoryError ?? new Error("Could not create fixtures.")
      );
    }

    groupId = group.id;
    categoryId = category.id;

    const { data: student, error: studentError } = await adminFixtureClient
      .from("students")
      .insert({ group_id: groupId, name: `Integration student ${runId}` })
      .select("id")
      .single();

    if (studentError || !student) {
      throw studentError ?? new Error("Could not create student fixture.");
    }

    studentId = student.id;
  });

  afterAll(cleanupFixtures);

  it("allows every authenticated role to read and create students", async () => {
    for (const actor of actors) {
      const { data: visible, error: readError } = await actor.client
        .from("students")
        .select("id")
        .eq("id", studentId);
      const studentName = `Student ${actor.role} ${actor.id}`;
      const { data: created, error: createError } = await actor.client
        .from("students")
        .insert({ group_id: groupId, name: studentName })
        .select("id")
        .single();

      expect(readError).toBeNull();
      expect(visible).toEqual([{ id: studentId }]);
      expect(createError).toBeNull();
      expect(created).not.toBeNull();

      const { error: duplicateError } = await actor.client
        .from("students")
        .insert({ group_id: groupId, name: studentName });

      expect(duplicateError).not.toBeNull();
    }
  });

  it("allows only admins to update and delete students", async () => {
    for (const actor of [teacherOwner, coordinator]) {
      await expectNoAffectedRows(
        actor.client
          .from("students")
          .update({ name: `Denied ${actor.role} update ${runId}` })
          .eq("id", studentId)
          .select("id"),
      );
      await expectNoAffectedRows(
        actor.client.from("students").delete().eq("id", studentId).select("id"),
      );
    }

    const { data: updated, error: updateError } = await admin.client
      .from("students")
      .update({ name: `Admin updated student ${runId}` })
      .eq("id", studentId)
      .select("id")
      .single();

    expect(updateError).toBeNull();
    expect(updated?.id).toBe(studentId);

    const { data: disposable, error: createError } = await teacherOwner.client
      .from("students")
      .insert({ group_id: groupId, name: `Disposable student ${runId}` })
      .select("id")
      .single();

    expect(createError).toBeNull();

    const { data: deleted, error: deleteError } = await admin.client
      .from("students")
      .delete()
      .eq("id", disposable!.id)
      .select("id")
      .single();

    expect(deleteError).toBeNull();
    expect(deleted?.id).toBe(disposable!.id);
  });

  it("enforces group, category, and user-role management by role", async () => {
    const { error: teacherGroupError } = await teacherOwner.client
      .from("groups")
      .insert({
        created_by: teacherOwner.id,
        name: `Denied teacher group ${runId}`,
      });
    const { error: teacherCategoryError } = await teacherOwner.client
      .from("categories")
      .insert({
        created_by: teacherOwner.id,
        name: `Denied teacher category ${runId}`,
      });

    expect(teacherGroupError).not.toBeNull();
    expect(teacherCategoryError).not.toBeNull();

    const { data: coordinatorGroup, error: coordinatorGroupError } =
      await coordinator.client
        .from("groups")
        .insert({
          created_by: coordinator.id,
          name: `Coordinator group ${runId}`,
        })
        .select("id")
        .single();
    const { data: coordinatorCategory, error: coordinatorCategoryError } =
      await coordinator.client
        .from("categories")
        .insert({
          created_by: coordinator.id,
          name: `Coordinator category ${runId}`,
        })
        .select("id")
        .single();

    expect(coordinatorGroupError).toBeNull();
    expect(coordinatorCategoryError).toBeNull();

    await expectNoAffectedRows(
      teacherOther.client
        .from("groups")
        .update({ name: `Denied group rename ${runId}` })
        .eq("id", coordinatorGroup!.id)
        .select("id"),
    );
    await expectNoAffectedRows(
      teacherOther.client
        .from("categories")
        .delete()
        .eq("id", coordinatorCategory!.id)
        .select("id"),
    );
    await expectNoAffectedRows(
      teacherOwner.client
        .from("users")
        .update({ role_id: coordinatorRoleId })
        .eq("id", teacherOther.id)
        .select("id"),
    );
    await expectNoAffectedRows(
      coordinator.client
        .from("users")
        .update({ role_id: coordinatorRoleId })
        .eq("id", teacherOther.id)
        .select("id"),
    );

    const { data: roleUpdated, error: adminRoleError } = await admin.client
      .from("users")
      .update({ role_id: coordinatorRoleId })
      .eq("id", teacherOther.id)
      .select("id")
      .single();

    expect(adminRoleError).toBeNull();
    expect(roleUpdated?.id).toBe(teacherOther.id);

    const {
      data: coordinatorGroupUpdated,
      error: coordinatorGroupUpdateError,
    } = await coordinator.client
      .from("groups")
      .update({ name: `Coordinator group updated ${runId}` })
      .eq("id", coordinatorGroup!.id)
      .select("id")
      .single();
    const {
      data: coordinatorCategoryUpdated,
      error: coordinatorCategoryUpdateError,
    } = await coordinator.client
      .from("categories")
      .update({ name: `Coordinator category updated ${runId}` })
      .eq("id", coordinatorCategory!.id)
      .select("id")
      .single();

    expect(coordinatorGroupUpdateError).toBeNull();
    expect(coordinatorGroupUpdated?.id).toBe(coordinatorGroup!.id);
    expect(coordinatorCategoryUpdateError).toBeNull();
    expect(coordinatorCategoryUpdated?.id).toBe(coordinatorCategory!.id);

    const { error: restoreRoleError } = await admin.client
      .from("users")
      .update({ role_id: teacherRoleId })
      .eq("id", teacherOther.id);

    expect(restoreRoleError).toBeNull();

    const { error: deleteCategoryError } = await coordinator.client
      .from("categories")
      .delete()
      .eq("id", coordinatorCategory!.id);
    const { error: deleteGroupError } = await coordinator.client
      .from("groups")
      .delete()
      .eq("id", coordinatorGroup!.id);

    expect(deleteCategoryError).toBeNull();
    expect(deleteGroupError).toBeNull();

    const { data: adminGroup, error: adminGroupError } = await admin.client
      .from("groups")
      .insert({
        created_by: admin.id,
        name: `Admin managed group ${runId}`,
      })
      .select("id")
      .single();
    const { data: adminCategory, error: adminCategoryError } =
      await admin.client
        .from("categories")
        .insert({
          created_by: admin.id,
          name: `Admin managed category ${runId}`,
        })
        .select("id")
        .single();

    expect(adminGroupError).toBeNull();
    expect(adminCategoryError).toBeNull();

    const { error: adminGroupDeleteError } = await admin.client
      .from("groups")
      .delete()
      .eq("id", adminGroup!.id);
    const { error: adminCategoryDeleteError } = await admin.client
      .from("categories")
      .delete()
      .eq("id", adminCategory!.id);

    expect(adminGroupDeleteError).toBeNull();
    expect(adminCategoryDeleteError).toBeNull();
  });

  it("allows other roles to read a teacher incident and its teacher profile", async () => {
    const incidentId = await createIncident(
      teacherOwner,
      `Cross-role read target ${runId}`,
    );

    for (const reader of [teacherOther, coordinator, admin]) {
      const { data, error } = await reader.client
        .from("incidents")
        .select("id, teacher_id, users(display_name)")
        .eq("id", incidentId)
        .single();

      expect(error).toBeNull();
      expect(data).toEqual({
        id: incidentId,
        teacher_id: teacherOwner.id,
        users: { display_name: "Integration teacher-owner" },
      });
    }
  });

  it("enforces incident ownership while allowing coordinator and admin management", async () => {
    for (const actor of actors) {
      const incidentId = await createIncident(
        actor,
        `Created by ${actor.role} ${actor.id}`,
      );
      const { data: visible, error: readError } = await actor.client
        .from("incidents")
        .select("id")
        .eq("id", incidentId);

      expect(readError).toBeNull();
      expect(visible).toEqual([{ id: incidentId }]);
    }

    const { error: impersonationError } = await teacherOther.client
      .from("incidents")
      .insert({
        category_id: categoryId,
        date: "2026-08-04",
        description: "Denied impersonation",
        severity: "low",
        student_id: studentId,
        teacher_id: teacherOwner.id,
      });
    const { error: invalidSeverityError } = await teacherOwner.client
      .from("incidents")
      .insert({
        category_id: categoryId,
        date: "2026-08-04",
        description: "Invalid severity",
        severity: "critical",
        student_id: studentId,
        teacher_id: teacherOwner.id,
      });

    expect(impersonationError).not.toBeNull();
    expect(invalidSeverityError).not.toBeNull();

    const ownedUpdateId = await createIncident(
      teacherOwner,
      `Owner update target ${runId}`,
    );
    const { data: ownerUpdated, error: ownerUpdateError } =
      await teacherOwner.client
        .from("incidents")
        .update({ description: `Owner updated ${runId}` })
        .eq("id", ownedUpdateId)
        .select("id")
        .single();

    expect(ownerUpdateError).toBeNull();
    expect(ownerUpdated?.id).toBe(ownedUpdateId);

    const protectedId = await createIncident(
      teacherOwner,
      `Protected owner incident ${runId}`,
    );

    await expectNoAffectedRows(
      teacherOther.client
        .from("incidents")
        .update({ description: `Denied update ${runId}` })
        .eq("id", protectedId)
        .select("id"),
    );
    await expectNoAffectedRows(
      teacherOther.client
        .from("incidents")
        .delete()
        .eq("id", protectedId)
        .select("id"),
    );

    const { data: unchanged, error: unchangedError } = await teacherOwner.client
      .from("incidents")
      .select("description")
      .eq("id", protectedId)
      .single();

    expect(unchangedError).toBeNull();
    expect(unchanged?.description).toBe(`Protected owner incident ${runId}`);

    const coordinatorUpdateTargetId = await createIncident(
      teacherOwner,
      `Coordinator update target ${runId}`,
    );
    const coordinatorDeleteTargetId = await createIncident(
      teacherOwner,
      `Coordinator delete target ${runId}`,
    );
    const adminUpdateTargetId = await createIncident(
      teacherOwner,
      `Admin update target ${runId}`,
    );
    const adminDeleteTargetId = await createIncident(
      teacherOwner,
      `Admin delete target ${runId}`,
    );
    const { data: coordinatorUpdated, error: coordinatorUpdateError } =
      await coordinator.client
        .from("incidents")
        .update({ description: `Coordinator updated ${runId}` })
        .eq("id", coordinatorUpdateTargetId)
        .select("id")
        .single();
    const { data: coordinatorDeleted, error: coordinatorDeleteError } =
      await coordinator.client
        .from("incidents")
        .delete()
        .eq("id", coordinatorDeleteTargetId)
        .select("id")
        .single();
    const { data: adminUpdated, error: adminUpdateError } = await admin.client
      .from("incidents")
      .update({ description: `Admin updated ${runId}` })
      .eq("id", adminUpdateTargetId)
      .select("id")
      .single();
    const { data: adminDeleted, error: adminDeleteError } = await admin.client
      .from("incidents")
      .delete()
      .eq("id", adminDeleteTargetId)
      .select("id")
      .single();

    expect(coordinatorUpdateError).toBeNull();
    expect(coordinatorUpdated?.id).toBe(coordinatorUpdateTargetId);
    expect(coordinatorDeleteError).toBeNull();
    expect(coordinatorDeleted?.id).toBe(coordinatorDeleteTargetId);
    expect(adminUpdateError).toBeNull();
    expect(adminUpdated?.id).toBe(adminUpdateTargetId);
    expect(adminDeleteError).toBeNull();
    expect(adminDeleted?.id).toBe(adminDeleteTargetId);

    const ownerDeleteId = await createIncident(
      teacherOwner,
      `Owner delete target ${runId}`,
    );
    const { data: ownerDeleted, error: ownerDeleteError } =
      await teacherOwner.client
        .from("incidents")
        .delete()
        .eq("id", ownerDeleteId)
        .select("id")
        .single();

    expect(ownerDeleteError).toBeNull();
    expect(ownerDeleted?.id).toBe(ownerDeleteId);
  });

  it("enforces foreign keys for authorized admin deletions", async () => {
    await createIncident(
      teacherOwner,
      `Foreign-key constraint target ${runId}`,
    );

    const { error: groupDeleteError } = await admin.client
      .from("groups")
      .delete()
      .eq("id", groupId);
    const { error: studentDeleteError } = await admin.client
      .from("students")
      .delete()
      .eq("id", studentId);
    const { error: categoryDeleteError } = await admin.client
      .from("categories")
      .delete()
      .eq("id", categoryId);

    expect(groupDeleteError?.code).toBe("23503");
    expect(studentDeleteError?.code).toBe("23503");
    expect(categoryDeleteError?.code).toBe("23503");
  });
});
