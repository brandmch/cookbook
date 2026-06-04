import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import TopBar from "@/components/cookbook/TopBar";

export default async function CookbookWallPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const cookbook = await db.cookbook.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });
  if (!cookbook) notFound();

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

      {/* Phase 4: recipe grid goes here */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <p className="font-hand text-3xl text-ink-soft">
          {cookbook.name} — recipes coming in Phase 4
        </p>
      </main>
    </div>
  );
}
