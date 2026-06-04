import { db } from "@/lib/db";
import { generateSlug } from "@/lib/slug-utils";

export { generateSlug };

export async function createUniqueSlug(name: string): Promise<string> {
  const base = generateSlug(name) || "my-cookbook";

  const existing = await db.cookbook.findUnique({ where: { slug: base } });
  if (!existing) return base;

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base.slice(0, 45)}-${suffix}`;
}
