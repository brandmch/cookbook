import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const recipe = await db.recipe.findUnique({
    where: { id },
    select: { contributorId: true },
  });
  if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (recipe.contributorId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: {
    title?: string;
    category?: string;
    emoji?: string;
    story?: string;
    yieldQuantity?: number;
    yieldUnit?: string;
    time?: string;
    ingredients?: { quantity: string; unit: string; label: string }[];
    steps?: { text: string }[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, category, emoji, story, yieldQuantity, yieldUnit, time, ingredients, steps } = body;

  const updated = await db.$transaction(async (tx) => {
    if (ingredients !== undefined) {
      await tx.ingredient.deleteMany({ where: { recipeId: id } });
      if (ingredients.filter((i) => i.label?.trim()).length > 0) {
        await tx.ingredient.createMany({
          data: ingredients
            .filter((i) => i.label?.trim())
            .map((i, idx) => ({
              recipeId: id,
              quantity: i.quantity?.trim() || null,
              unit: i.unit?.trim() || null,
              label: i.label.trim(),
              order: idx,
            })),
        });
      }
    }

    if (steps !== undefined) {
      await tx.step.deleteMany({ where: { recipeId: id } });
      if (steps.filter((s) => s.text?.trim()).length > 0) {
        await tx.step.createMany({
          data: steps
            .filter((s) => s.text?.trim())
            .map((s, idx) => ({ recipeId: id, text: s.text.trim(), order: idx })),
        });
      }
    }

    return tx.recipe.update({
      where: { id },
      data: {
        ...(title?.trim() && { title: title.trim() }),
        ...(category && { category }),
        ...(emoji !== undefined && { emoji: emoji?.trim() || null }),
        ...(story !== undefined && { story: story.trim() || null }),
        ...(yieldQuantity !== undefined && { yieldQuantity: Number(yieldQuantity) || 4 }),
        ...(yieldUnit !== undefined && { yieldUnit: yieldUnit.trim() || "servings" }),
        ...(time !== undefined && { time: time.trim() || null }),
      },
      select: { id: true, slug: true },
    });
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const recipe = await db.recipe.findUnique({
    where: { id },
    select: { contributorId: true, cookbook: { select: { slug: true } } },
  });
  if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (recipe.contributorId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.recipe.delete({ where: { id } });

  return NextResponse.json({ cookbookSlug: recipe.cookbook.slug });
}
