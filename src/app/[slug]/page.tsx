import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import TopBar from "@/components/cookbook/TopBar";
import CookbookWall from "@/components/cookbook/CookbookWall";

export default async function CookbookWallPage({
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
      select: {
        id: true,
        name: true,
        slug: true,
        members: { select: { userId: true, role: true } },
        recipes: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            slug: true,
            title: true,
            category: true,
            emoji: true,
            story: true,
            serves: true,
            time: true,
            contributor: { select: { name: true } },
          },
        },
      },
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

  const currentMember = cookbook.members.find((m) => m.userId === session.user.id);
  if (!currentMember) redirect("/onboarding");

  const isOwner = currentMember.role === "OWNER";
  const cookbooks = (user?.memberships ?? []).map((m) => m.cookbook);

  return (
    <div className="min-h-screen paper">
      <TopBar
        userName={user?.name ?? ""}
        userEmail={user?.email ?? session.user.email ?? ""}
        userImage={user?.image}
        cookbookSlug={cookbook.slug}
      />
      <CookbookWall
        cookbookSlug={cookbook.slug}
        cookbookName={cookbook.name}
        cookbooks={cookbooks}
        recipes={cookbook.recipes}
        isOwner={isOwner}
      />
    </div>
  );
}
