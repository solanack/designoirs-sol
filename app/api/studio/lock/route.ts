import { and, eq } from "drizzle-orm";
import { assets, products, productVariants } from "@/db/schema";
import { apiError, resolveProjectContext } from "@/lib/project-context";

export async function POST(request: Request) {
  try {
    const { db, projectId } = await resolveProjectContext();
    const { assetId } = await request.json() as { assetId?: string };
    if (!assetId) return Response.json({ error: "assetId is required" }, { status: 400 });
    const [asset] = await db.select().from(assets).where(and(eq(assets.id, assetId), eq(assets.projectId, projectId), eq(assets.kind, "generated-design"))).limit(1);
    if (!asset) return Response.json({ error: "Design not found" }, { status: 404 });
    const meta = JSON.parse(asset.prompt || "{}") as { name?: string; productType?: string; basePrice?: number };
    const existing = await db.select().from(products).where(and(eq(products.projectId, projectId), eq(products.id, `product_${asset.id}`))).limit(1);
    if (existing.length) return Response.json({ product: existing[0], alreadyLocked: true });
    const productId = `product_${asset.id}`;
    const [product] = await db.insert(products).values({ id: productId, projectId, name: meta.name || "Locked design", basePrice: meta.basePrice || 40, inventoryMode: "pre-order", status: "draft" }).returning();
    const sizes = meta.productType === "hat" || meta.productType === "beanie" ? ["One size"] : ["S", "M", "L", "XL"];
    await db.insert(productVariants).values(sizes.flatMap(size => [
      { id: crypto.randomUUID(), projectId, productId, tier: "Standard", size, priceDelta: 0, productionDays: 4 },
      { id: crypto.randomUUID(), projectId, productId, tier: "Premium", size, priceDelta: meta.productType === "hoodie" ? 18 : 10, productionDays: 6 },
    ]));
    await db.update(assets).set({ locked: true }).where(and(eq(assets.id, asset.id), eq(assets.projectId, projectId)));
    return Response.json({ product, imageUrl: `/api/assets/${asset.id}` }, { status: 201 });
  } catch (error) { return apiError(error); }
}
