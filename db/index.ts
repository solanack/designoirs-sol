import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

async function bindingEnv() { const moduleName="cloudflare:workers"; return (await import(moduleName)).env as any; }

export async function getDb() {
  const env = await bindingEnv();
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(env.DB, { schema });
}

let schemaReady: Promise<unknown> | null = null;
export function ensureCoreSchema() {
  if (!schemaReady) schemaReady = (async()=>{const env=await bindingEnv();if(!env.DB)throw new Error("Cloudflare D1 binding `DB` is unavailable.");return env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS projects (id text PRIMARY KEY NOT NULL, name text NOT NULL, ticker text, owner_wallet text NOT NULL, payout_wallet text NOT NULL, storefront_config text, created_at integer NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS project_admins (id text PRIMARY KEY NOT NULL, project_id text NOT NULL, wallet text NOT NULL, role text NOT NULL)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS project_admin_wallet_idx ON project_admins (wallet)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS assets (id text PRIMARY KEY NOT NULL, project_id text NOT NULL, kind text NOT NULL, storage_key text NOT NULL, prompt text, locked integer NOT NULL)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS assets_project_idx ON assets (project_id)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS products (id text PRIMARY KEY NOT NULL, project_id text NOT NULL, name text NOT NULL, base_price real NOT NULL, inventory_mode text NOT NULL, status text NOT NULL)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS products_project_idx ON products (project_id)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS product_variants (id text PRIMARY KEY NOT NULL, project_id text NOT NULL, product_id text NOT NULL, tier text NOT NULL, size text NOT NULL, price_delta real NOT NULL, production_days integer NOT NULL, provider_sku text)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS variants_project_product_idx ON product_variants (project_id, product_id)"),
  ])})();
  return schemaReady;
}
