import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import TopBar from "@/components/cookbook/TopBar";
import RecipeDetail from "@/components/cookbook/RecipeDetail";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ slug: string; recipeId: string }>;
}) {
  const { slug, recipeId } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const cookbook = await db.cookbook.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, members: { select: { userId: true } } },
  });
  if (!cookbook) notFound();

  const isMember = cookbook.members.some((m) => m.userId === session.user.id);
  if (!isMember) redirect("/onboarding");

  const recipe = await db.recipe.findFirst({
    where: { id: recipeId, cookbookId: cookbook.id },
    select: {
      id: true,
      title: true,
      category: true,
      story: true,
      serves: true,
      time: true,
      contributor: { select: { name: true } },
      ingredients: {
        orderBy: { order: "asc" },
        select: { id: true, quantity: true, unit: true, label: true, order: true },
      },
      steps: {
        orderBy: { order: "asc" },
        select: { id: true, text: true, order: true },
      },
    },
  });
  if (!recipe) notFound();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true },
  });

  return (
    <div className="min-h-screen paper">
      <TopBar
        cookbookName={cookbook.name}
        userName={user?.name ?? ""}
        userEmail={user?.email ?? session.user.email ?? ""}
        userImage={user?.image}
      />
      <RecipeDetail
        cookbookSlug={cookbook.slug}
        cookbookName={cookbook.name}
        recipe={recipe}
      />
    </div>
  );
}
