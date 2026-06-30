#!/usr/bin/env node
/**
 * Applies 007_lead_schema_upgrade.sql to the linked Supabase project.
 * Requires SUPABASE_DB_PASSWORD in .env.local (Dashboard → Settings → Database).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i), l.slice(i + 1)];
      })
  );
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const password = env.SUPABASE_DB_PASSWORD ?? process.env.SUPABASE_DB_PASSWORD;

const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
if (!match) {
  console.error("NEXT_PUBLIC_SUPABASE_URL not set in .env.local");
  process.exit(1);
}

if (!password) {
  console.error(
    "Missing SUPABASE_DB_PASSWORD.\n" +
      "Add your database password to .env.local:\n" +
      "  SUPABASE_DB_PASSWORD=your_password\n" +
      "(Supabase Dashboard → Project Settings → Database → Database password)\n\n" +
      "Or paste supabase/migrations/007_lead_schema_upgrade.sql into the SQL Editor manually."
  );
  process.exit(1);
}

const projectRef = match[1];
const encodedPassword = encodeURIComponent(password);
const connectionStrings = [
  `postgresql://postgres:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres`,
  `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
];

const sqlPath = path.join(__dirname, "..", "supabase", "migrations", "007_lead_schema_upgrade.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

let lastError = null;

for (const connectionString of connectionStrings) {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected. Applying lead schema upgrade...");
    await client.query(sql);
    console.log("Done — leads schema upgraded successfully.");
    await client.end();
    process.exit(0);
  } catch (err) {
    lastError = err;
    try {
      await client.end();
    } catch {
      // ignore
    }
  }
}

console.error("Migration failed:", lastError?.message ?? "Could not connect to database.");
process.exit(1);
