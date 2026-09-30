"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  getAuthErrorMessage,
  isAuthApplicationError,
} from "@/lib/application-error";
import { loginUser, logoutUser, signupUser } from "@/lib/auth";
import type { ActionResult } from "@/types/actions";
import type { LoginInput, SignupInput } from "@/types/auth";
import { loginSchema, signupSchema } from "@/validation/auth";
import { fieldErrors } from "@/validation/form-errors";

const validationFailed = (error: z.ZodError): ActionResult => ({
  success: false,
  error: "Revisa los campos marcados.",
  fieldErrors: fieldErrors(error),
});

const authFailed = (error: unknown): ActionResult => {
  if (!isAuthApplicationError(error)) {
    throw error;
  }

  return {
    success: false,
    error: getAuthErrorMessage(error.code),
  };
};

const formDataValues = (
  formData: FormData,
): Record<string, FormDataEntryValue> => Object.fromEntries(formData.entries());

export const loginAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> => {
  const parsed = loginSchema.safeParse(formDataValues(formData));

  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  try {
    const loginInput: LoginInput = parsed.data;
    await loginUser(loginInput);
  } catch (error) {
    return authFailed(error);
  }

  revalidatePath("/", "layout");
  redirect("/incidentes");
};

export const signupAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> => {
  const parsed = signupSchema.safeParse(formDataValues(formData));

  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  try {
    const signupInput: SignupInput = parsed.data;
    await signupUser(signupInput);
  } catch (error) {
    return authFailed(error);
  }

  return { success: true, data: undefined };
};

export const logoutAction = async (
  _previousState: ActionResult | null,
  _formData: FormData,
): Promise<ActionResult> => {
  void _previousState;
  void _formData;

  try {
    await logoutUser();
  } catch (error) {
    return authFailed(error);
  }

  revalidatePath("/", "layout");
  redirect("/auth");
};
