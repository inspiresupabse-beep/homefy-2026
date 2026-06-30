#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8").split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; })
);
const match = env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/);
const password = env.SUPABASE_DB_PASSWORD;
if (!match || !password) process.exit(1);

const sql = fs.readFileSync(path.join(__dirname, "..", "supabase", "migrations", "009_staff_power.sql"), "utf8");
const client = new pg.Client({
  connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${match[1]}.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});
try {
  await client.connect();
  await client.query(sql);
  console.log("Staff power migration applied.");
} catch (err) {
  console.error(err.message);
  process.exit(1);
} finally {
  await client.end();
}
