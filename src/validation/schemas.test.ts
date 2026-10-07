import { describe, expect, it } from "vitest";

import { loginSchema, signupSchema } from "@/validation/auth";
import { createCategorySchema } from "@/validation/categories";
import { fieldErrors } from "@/validation/form-errors";
import { createGroupSchema } from "@/validation/groups";
import { createIncidentSchema } from "@/validation/incidents";
import { createStudentSchema } from "@/validation/students";

describe("shared form schemas", () => {
  it("provides the same Spanish errors for client and server validation", () => {
    const parsed = signupSchema.safeParse({
      email: "not-an-email",
      password: "",
      displayName: " ",
      schoolRole: " ",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(fieldErrors(parsed.error)).toEqual({
        email: ["Introduce un email válido."],
        password: ["Este campo es obligatorio."],
        displayName: ["Este campo es obligatorio."],
        schoolRole: ["Este campo es obligatorio."],
      });
    }
  });

  it("requires the Supabase minimum length only when signing up", () => {
    const parsed = signupSchema.safeParse({
      email: "ada@example.com",
      password: "short",
      displayName: "Ada Lovelace",
      schoolRole: "Tecnología",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(fieldErrors(parsed.error)).toEqual({
        password: ["La contraseña debe tener al menos 6 caracteres."],
      });
    }

    expect(
      loginSchema.parse({ email: "ada@example.com", password: "short" }),
    ).toEqual({ email: "ada@example.com", password: "short" });
  });

  it("normalizes valid auth and CRUD inputs", () => {
    expect(
      loginSchema.parse({ email: " Ada@example.com ", password: "secret" }),
    ).toEqual({
      email: "Ada@example.com",
      password: "secret",
    });
    expect(createGroupSchema.parse({ name: " 1º A " })).toEqual({
      name: "1º A",
    });
    expect(createCategorySchema.parse({ name: " Convivencia " })).toEqual({
      name: "Convivencia",
    });
    expect(
      createStudentSchema.parse({
        name: " Ada ",
        groupId: "33333333-3333-4333-8333-333333333333",
      }),
    ).toEqual({ name: "Ada", groupId: "33333333-3333-4333-8333-333333333333" });
  });

  it("rejects malformed incident dates before an Action is called", () => {
    const parsed = createIncidentSchema.safeParse({
      studentId: "33333333-3333-4333-8333-333333333333",
      categoryId: "44444444-4444-4444-8444-444444444444",
      severity: "high",
      description: "Interrumpió la clase",
      date: "2026-02-30",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(fieldErrors(parsed.error)).toEqual({
        date: ["Introduce una fecha válida."],
      });
    }
  });
});
