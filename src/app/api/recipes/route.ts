import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50)
    .replace(/-$/, "");
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cookbookId = req.nextUrl.searchParams.get("cookbookId");
  if (!cookbookId) return NextResponse.json({ error: "cookbookId required" }, { status: 400 });

  const membership = await db.cookbookMember.findUnique({
    where: { cookbookId_userId: { cookbookId, userId: session.user.id } },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const recipes = await db.recipe.findMany({
    where: { cookbookId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, slug: true, title: true, category: true,
      story: true, serves: true, time: true,
      contributor: { select: { name: true } },
    },
  });

  return NextResponse.json(recipes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    cookbookSlug: string;
    title: string;
    category: string;
    story?: string;
    serves: number;
    time?: string;
    ingredients: { quantity: string; unit: string; label: string }[];
    steps: { text: string }[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { cookbookSlug, title, category, story, serves, time, ingredients, steps } = body;

  if (!cookbookSlug || !title?.trim() || !category) {
    return NextResponse.json({ error: "cookbookSlug, title, and category are required" }, { status: 400 });
  }

  const cookbook = await db.cookbook.findUnique({ where: { slug: cookbookSlug }, select: { id: true } });
  if (!cookbook) return NextResponse.json({ error: "Cookbook not found" }, { status: 404 });

  const membership = await db.cookbookMember.findUnique({
    where: { cookbookId_userId: { cookbookId: cookbook.id, userId: session.user.id } },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Generate unique slug within the cookbook
  const base = slugify(title) || "recipe";
  let slug = base;
  let suffix = 1;
  while (await db.recipe.findFirst({ where: { cookbookId: cookbook.id, slug } })) {
    suffix++;
    slug = `${base}-${suffix}`;
  }

  const recipe = await db.recipe.create({
    data: {
      cookbookId: cookbook.id,
      contributorId: session.user.id,
      title: title.trim(),
      slug,
      category,
      story: story?.trim() || null,
      serves: Number(serves) || 4,
      time: time?.trim() || null,
      ingredients: {
        create: ingredients
          .filter((i) => i.label?.trim())
          .map((i, idx) => ({
            quantity: i.quantity?.trim() || null,
            unit: i.unit?.trim() || null,
            label: i.label.trim(),
            order: idx,
          })),
      },
      steps: {
        create: steps
          .filter((s) => s.text?.trim())
          .map((s, idx) => ({
            text: s.text.trim(),
            order: idx,
          })),
      },
    },
    select: { id: true, slug: true },
  });

  return NextResponse.json(recipe, { status: 201 });
}
