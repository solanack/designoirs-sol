import { and, eq } from "drizzle-orm";
import { assets } from "@/db/schema";
import { apiError, resolveProjectContext } from "@/lib/project-context";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { db, projectId } = await resolveProjectContext();
    const moduleName="cloudflare:workers"; const env=(await import(moduleName)).env as any;
    const { id } = await context.params;
    const [asset] = await db.select().from(assets).where(and(eq(assets.id, id), eq(assets.projectId, projectId))).limit(1);
    if (!asset) return new Response("Not found", { status: 404 });
    const object = await env.BUCKET.get(asset.storageKey);
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers(); object.writeHttpMetadata(headers); headers.set("Cache-Control", "private, max-age=3600"); headers.set("X-Content-Type-Options", "nosniff");
    return new Response(object.body, { headers });
  } catch (error) { return apiError(error); }
}
