import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import TopBar from "@/components/cookbook/TopBar";
import AddRecipeForm from "@/components/cookbook/AddRecipeForm";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ slug: string; recipeId: string }>;
}) {
  const { slug, recipeId } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [cookbook, user] = await Promise.all([
    db.cookbook.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true, members: { select: { userId: true } } },
    }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        image: true,
        memberships: {
          include: { cookbook: { select: { name: true, slug: true } } },
          orderBy: { joinedAt: "asc" },
        },
      },
    }),
  ]);

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
      contributorId: true,
      ingredients: {
        orderBy: { order: "asc" },
        select: { quantity: true, unit: true, label: true },
      },
      steps: {
        orderBy: { order: "asc" },
        select: { text: true },
      },
    },
  });

  if (!recipe) notFound();
  if (recipe.contributorId !== session.user.id) redirect(`/${slug}/${recipeId}`);

  const cookbooks = (user?.memberships ?? []).map((m) => m.cookbook);

  const initialValues = {
    title: recipe.title,
    category: recipe.category,
    story: recipe.story ?? "",
    serves: recipe.serves,
    time: recipe.time ?? "",
    ingredients: recipe.ingredients.map((i) => ({
      quantity: i.quantity ?? "",
      unit: i.unit ?? "",
      label: i.label,
    })),
    steps: recipe.steps.map((s) => ({ text: s.text })),
  };

  return (
    <div className="min-h-screen paper">
      <TopBar
        currentSlug={slug}
        cookbooks={cookbooks}
        userName={user?.name ?? ""}
        userEmail={user?.email ?? session.user.email ?? ""}
        userImage={user?.image}
      />
      <AddRecipeForm
        cookbookSlug={cookbook.slug}
        recipeId={recipe.id}
        initialValues={initialValues}
      />
    </div>
  );
}
