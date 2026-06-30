/**
 * Dev-only: creates test admin user via Supabase Auth signUp.
 * Run: node scripts/seed-admin.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

function loadEnv() {
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const EMAIL = "admin@123.local";
const PASSWORD = "aaaaaa"; // Supabase minimum is 6 chars

async function createViaAdmin() {
  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Admin", role: "admin" },
  });

  if (error) throw error;
  return data.user;
}

async function createViaSignUp() {
  const supabase = createClient(url, key);

  const { data, error } = await supabase.auth.signUp({
    email: EMAIL,
    password: PASSWORD,
    options: {
      data: { full_name: "Admin", role: "admin" },
    },
  });

  if (error) throw error;
  return data.user;
}

async function main() {
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or ANON_KEY in .env.local");
    process.exit(1);
  }

  console.log(`Creating test admin: ${EMAIL} / ${PASSWORD}`);

  try {
    let user;
    if (serviceKey && !serviceKey.startsWith("your_")) {
      user = await createViaAdmin();
      console.log("Created via admin API (email auto-confirmed).");
    } else {
      user = await createViaSignUp();
      console.log("Created via signUp.");
      if (!user?.identities?.length) {
        console.log("Note: User may already exist, or email confirmation may be required.");
      }
    }

    console.log("\nLogin at http://localhost:3000/login");
    console.log(`  Email:    ${EMAIL}`);
    console.log(`  Password: ${PASSWORD}`);
  } catch (err) {
    const msg = err?.message ?? String(err);
    if (msg.includes("already registered") || msg.includes("already been registered")) {
      console.log("User already exists. Try signing in with the credentials above.");
    } else {
      console.error("Failed:", msg);
      process.exit(1);
    }
  }
}

main();
