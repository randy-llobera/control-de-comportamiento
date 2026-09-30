import type { z } from "zod";

import type { loginSchema, signupSchema } from "@/validation/auth";

export type LoginInput = z.output<typeof loginSchema>;
export type SignupInput = z.output<typeof signupSchema>;
