import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const fileEnv = loadEnv("test", process.cwd(), "");
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? fileEnv.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  fileEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? fileEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Integration tests require NEXT_PUBLIC_SUPABASE_URL for local Supabase.",
  );
}

const { hostname } = new URL(supabaseUrl);

if (hostname !== "localhost" && hostname !== "127.0.0.1") {
  throw new Error(
    `Integration tests refuse non-local Supabase URL: ${hostname}`,
  );
}

if (!supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error(
    "Integration tests require local Supabase anon and service-role keys.",
  );
}

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    env: {
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
    },
    fileParallelism: false,
    hookTimeout: 30_000,
    include: ["supabase/**/*.integration.test.ts"],
    maxWorkers: 1,
    testTimeout: 30_000,
  },
});
