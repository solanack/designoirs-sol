import { and, eq, inArray } from "drizzle-orm";
import { assets } from "@/db/schema";
import { apiError, resolveProjectContext } from "@/lib/project-context";
import { designName, mockDesignSvg } from "@/lib/mockup-generator";

type Body = { brief?: string; assetRefs?: string[]; productTypes?: string[] };
const allowedTypes = new Set(["tee", "hoodie", "hat", "beanie"]);

async function openAiImage(prompt: string) {
  const moduleName="cloudflare:workers"; const env=(await import(moduleName)).env as any;
  const key = env.OPENAI_API_KEY as string | undefined;
  if (!key) return null;
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-image-2", prompt, n: 1, size: "1024x1024", quality: "medium", output_format: "webp" }),
  });
  if (!response.ok) throw new Error(`Image generation failed (${response.status})`);
  const json = await response.json() as { data?: Array<{ b64_json?: string }> };
  const encoded = json.data?.[0]?.b64_json;
  return encoded ? Uint8Array.from(atob(encoded), c => c.charCodeAt(0)) : null;
}

export async function POST(request: Request) {
  try {
    const { db, projectId } = await resolveProjectContext();
    const moduleName="cloudflare:workers"; const env=(await import(moduleName)).env as any;
    const body = await request.json() as Body;
    const brief = body.brief?.trim() || "";
    if (brief.length < 12) return Response.json({ error: "Add a more detailed creative brief." }, { status: 400 });
    const types = (body.productTypes || ["tee", "hoodie", "hat", "beanie"]).filter(type => allowedTypes.has(type)).slice(0, 4);
    if (!types.length) return Response.json({ error: "Choose at least one product type." }, { status: 400 });
    const batch = crypto.randomUUID();
    const requestedRefs = (body.assetRefs || []).slice(0, 8);
    const scopedRefs = requestedRefs.length ? await db.select({ id: assets.id, kind: assets.kind }).from(assets).where(and(eq(assets.projectId, projectId), inArray(assets.id, requestedRefs))) : [];
    const keyAvailable = Boolean(env.OPENAI_API_KEY);
    const designs = [];

    for (let index = 0; index < types.length; index++) {
      const type = types[index];
      const id = crypto.randomUUID();
      const name = designName(brief, type, index);
      const prompt = `Professional ecommerce product mockup of a ${type}. Creative direction: ${brief}. Graffiti streetwear, dramatic studio lighting, centered garment, no human model, readable composition. Use the visual identity represented by ${scopedRefs.length} project-owned reference asset(s).`;
      const generated = await openAiImage(prompt);
      const contentType = generated ? "image/webp" : "image/svg+xml";
      const bytes = generated || new TextEncoder().encode(mockDesignSvg(brief, type, `${batch}_${index}`));
      const storageKey = `${projectId}/studio/${batch}/${id}.${generated ? "webp" : "svg"}`;
      await env.BUCKET.put(storageKey, bytes, { httpMetadata: { contentType } });
      const metadata = JSON.stringify({ name, productType: type, basePrice: type === "hoodie" ? 82 : type === "tee" ? 40 : 34, contentType, batch, provider: generated ? "openai" : "mock" });
      await db.insert(assets).values({ id, projectId, kind: "generated-design", storageKey, prompt: metadata, locked: false });
      designs.push({ id, name, productType: type, basePrice: JSON.parse(metadata).basePrice, imageUrl: `/api/assets/${id}`, locked: false, provider: generated ? "openai" : "mock" });
    }
    return Response.json({ designs, mode: keyAvailable ? "openai" : "mock" }, { status: 201 });
  } catch (error) { return apiError(error); }
}
