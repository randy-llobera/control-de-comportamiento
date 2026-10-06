import { z } from 'zod';

const REQUIRED_ERROR = 'Este campo es obligatorio.';
const EMAIL_ERROR = 'Introduce un email válido.';
export const MIN_SIGNUP_PASSWORD_LENGTH = 6;
export const SIGNUP_PASSWORD_REQUIREMENT = `Mínimo ${MIN_SIGNUP_PASSWORD_LENGTH} caracteres`;

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
const signupPasswordSchema = passwordSchema.refine(
  (password) =>
    password.length === 0 || password.length >= MIN_SIGNUP_PASSWORD_LENGTH,
  {
    error: `La contraseña debe tener al menos ${MIN_SIGNUP_PASSWORD_LENGTH} caracteres.`,
  },
);

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export const signupSchema = loginSchema.extend({
  password: signupPasswordSchema,
  displayName: requiredStringSchema,
  schoolRole: requiredStringSchema,
});
