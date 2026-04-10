/**
 * One-time migration script: copy lead/intake submissions from a legacy
 * Supabase project into the CRM Supabase project.
 *
 * Run AFTER applying supabase/migrations/030_marketing_tables.sql.
 *
 * Required environment variables:
 *   OLD_SUPABASE_URL              — Legacy project URL (e.g. https://xxxx.supabase.co)
 *   OLD_SUPABASE_SERVICE_ROLE_KEY — Legacy project service role key (server-only; never commit)
 *   SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL — Target CRM project URL
 *   SUPABASE_SERVICE_ROLE_KEY     — Target CRM service role key
 *
 * If this key was ever committed to git, rotate it in the Supabase dashboard immediately.
 *
 * Usage (PowerShell):
 *   $env:OLD_SUPABASE_URL="https://....supabase.co"
 *   $env:OLD_SUPABASE_SERVICE_ROLE_KEY="..."
 *   $env:SUPABASE_SERVICE_ROLE_KEY="..."
 *   node scripts/migrate-old-supabase.js
 *
 * Safe to re-run — uses upsert with id as conflict key.
 */

const { createClient } = require("@supabase/supabase-js");

const OLD_URL = process.env.OLD_SUPABASE_URL;
const OLD_KEY = process.env.OLD_SUPABASE_SERVICE_ROLE_KEY;

const NEW_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const NEW_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!OLD_URL || !OLD_KEY) {
  console.error(
    "Missing OLD_SUPABASE_URL or OLD_SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Set both to the legacy website project's URL and service role key."
  );
  process.exit(1);
}

if (!NEW_URL || !NEW_KEY) {
  console.error(
    "Missing target credentials. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const oldDb = createClient(OLD_URL, OLD_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const newDb = createClient(NEW_URL, NEW_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TABLES = [
  "intake_submissions",
  "crm_intake_submissions",
  "lead_submissions",
  "website_leads",
];

async function migrateTable(tableName) {
  console.log(`\n→ Migrating ${tableName}...`);

  const { data: rows, error: fetchError } = await oldDb
    .from(tableName)
    .select("*");

  if (fetchError) {
    if (fetchError.code === "PGRST116" || fetchError.message?.includes("does not exist")) {
      console.log(`  Skipped — table not found in old project.`);
      return;
    }
    throw new Error(`Fetch error on ${tableName}: ${fetchError.message}`);
  }

  if (!rows || rows.length === 0) {
    console.log(`  No rows found.`);
    return;
  }

  console.log(`  Found ${rows.length} rows. Upserting into new project...`);

  const BATCH = 100;
  let upserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error: upsertError } = await newDb
      .from(tableName)
      .upsert(batch, { onConflict: "id" });

    if (upsertError) {
      throw new Error(`Upsert error on ${tableName}: ${upsertError.message}`);
    }
    upserted += batch.length;
    console.log(`  Upserted ${upserted}/${rows.length}`);
  }

  console.log(`  ✓ Done.`);
}

async function main() {
  console.log("Starting migration from legacy Supabase → CRM Supabase...");
  console.log(`Old: ${OLD_URL}`);
  console.log(`New: ${NEW_URL}`);

  for (const table of TABLES) {
    await migrateTable(table);
  }

  console.log("\n✓ Migration complete.");
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
