import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import TopBar from "@/components/cookbook/TopBar";
import SettingsMembers from "@/components/cookbook/SettingsMembers";
import SettingsProfile from "@/components/cookbook/SettingsProfile";

export default async function SettingsPage({
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
        members: {
          orderBy: { joinedAt: "asc" },
          select: {
            userId: true,
            role: true,
            joinedAt: true,
            user: { select: { name: true, email: true } },
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

  const members = cookbook.members.map((m) => ({
    ...m,
    joinedAt: m.joinedAt.toISOString(),
  }));

  const pendingInvites = isOwner
    ? await db.invite.findMany({
        where: { cookbookId: cookbook.id, status: "PENDING", expiresAt: { gt: new Date() } },
        select: { id: true, email: true },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <div className="min-h-screen paper">
      <TopBar
        userName={user?.name ?? ""}
        userEmail={user?.email ?? session.user.email ?? ""}
        userImage={user?.image}
        cookbookSlug={cookbook.slug}
      />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <div className="mb-8">
          <Link
            href={`/${slug}`}
            className="font-mono text-xs eyebrow tracking-widest text-ink/40 hover:text-ink/70 transition-colors"
          >
            ← Back
          </Link>
        </div>

        <h1 className="font-slab text-3xl font-bold text-ink mb-10">Settings</h1>

        <SettingsProfile
          currentName={user?.name ?? null}
          email={user?.email ?? session.user.email ?? ""}
        />

        <SettingsMembers
          cookbookSlug={cookbook.slug}
          cookbookName={cookbook.name}
          cookbooks={cookbooks}
          members={members}
          pendingInvites={pendingInvites}
          isOwner={isOwner}
          currentUserId={session.user.id}
        />
      </main>
    </div>
  );
}
