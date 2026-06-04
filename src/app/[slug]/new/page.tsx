import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import TopBar from "@/components/cookbook/TopBar";
import AddRecipeForm from "@/components/cookbook/AddRecipeForm";

export default async function NewRecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

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

  return (
    <div className="min-h-screen paper">
      <TopBar
        userName={user?.name ?? ""}
        userEmail={user?.email ?? session.user.email ?? ""}
        userImage={user?.image}
        cookbookSlug={cookbook.slug}
      />
      <AddRecipeForm cookbookSlug={cookbook.slug} />
    </div>
  );
}
