import { asc, eq, inArray } from "drizzle-orm";
import { assets, products, productVariants } from "@/db/schema";
import { apiError, resolveProjectContext } from "@/lib/project-context";

export async function GET() {
  try {
    const { db, projectId } = await resolveProjectContext();
    const catalog = await db.select().from(products).where(eq(products.projectId, projectId)).orderBy(asc(products.name));
    const variants = catalog.length ? await db.select().from(productVariants).where(inArray(productVariants.productId, catalog.map(p => p.id))) : [];
    const lockedAssets = await db.select().from(assets).where(eq(assets.projectId, projectId));
    return Response.json({ products: catalog.map(product => {
      const asset = lockedAssets.find(a => product.id === `product_${a.id}`);
      return { ...product, imageUrl: asset ? `/api/assets/${asset.id}` : null, variants: variants.filter(v => v.productId === product.id) };
    }) });
  } catch (error) { return apiError(error); }
}
