require("dotenv").config({ path: process.env.ENV_FILE || ".env" });

const { createClient } = require("@supabase/supabase-js");

const requiredEnvironment = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "ADMIN_DISPLAY_NAME",
  "ADMIN_SCHOOL_ROLE",
];

const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);

if (missingEnvironment.length > 0) {
  console.error(`ERROR: Missing environment variables: ${missingEnvironment.join(", ")}`);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const adminDisplayName = process.env.ADMIN_DISPLAY_NAME;
const adminSchoolRole = process.env.ADMIN_SCHOOL_ROLE;

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const findUserByEmail = async () => {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) throw error;

  return data.users.find(
    (user) => user.email?.toLowerCase() === adminEmail.toLowerCase(),
  );
};

const waitForProfile = async (userId) => {
  const timeout = Date.now() + 4_000;

  while (Date.now() < timeout) {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    if (data) return;

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error("Timed out waiting for the admin profile created by the auth trigger.");
};

const main = async () => {
  let user = await findUserByEmail();

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        display_name: adminDisplayName,
        school_role: adminSchoolRole,
      },
    });

    if (error || !data.user) throw error || new Error("Admin user was not created.");
    user = data.user;
  }

  await waitForProfile(user.id);

  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "admin")
    .single();

  if (roleError) throw roleError;

  const { error: updateError } = await supabase
    .from("users")
    .update({ role_id: role.id })
    .eq("id", user.id);

  if (updateError) throw updateError;

  console.log(`OK: Admin ensured for ${adminEmail} at ${url}`);
};

main().catch((error) => {
  console.error("ERROR: Failed to bootstrap admin:", error.message || error);
  process.exit(1);
});
