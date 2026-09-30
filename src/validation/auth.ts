import { z } from "zod";

const REQUIRED_ERROR = "Este campo es obligatorio.";
const EMAIL_ERROR = "Introduce un email válido.";

const emailSchema = z
  .string({ error: REQUIRED_ERROR })
  .trim()
  .min(1, { error: REQUIRED_ERROR })
  .pipe(z.email({ error: EMAIL_ERROR }));
const requiredStringSchema = z
  .string({ error: REQUIRED_ERROR })
  .trim()
  .min(1, { error: REQUIRED_ERROR });
const passwordSchema = z
  .string({ error: REQUIRED_ERROR })
  .min(1, { error: REQUIRED_ERROR });

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export const signupSchema = loginSchema.extend({
  displayName: requiredStringSchema,
  schoolRole: requiredStringSchema,
});
