import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { LandingPage } from "@/components/LandingPage";

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    const memberships = await db.cookbookMember.findMany({
      where: { userId: session.user.id },
      include: { cookbook: { select: { slug: true } } },
      orderBy: { joinedAt: "asc" },
    });

    if (memberships.length === 0) {
      redirect("/onboarding");
    }

    // Prefer last-viewed cookbook if the user is still a member
    const lastSlug = cookies().get("last-cookbook")?.value;
    const lastMembership = lastSlug ? memberships.find((m) => m.cookbook.slug === lastSlug) : undefined;
    const target = lastMembership ?? memberships[0];

    redirect(`/${target.cookbook.slug}`);
  }

  return <LandingPage />;
}
