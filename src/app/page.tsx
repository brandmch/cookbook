import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { LandingPage } from "@/components/LandingPage";

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    const membership = await db.cookbookMember.findFirst({
      where: { userId: session.user.id },
      include: { cookbook: true },
      orderBy: { joinedAt: "asc" },
    });

    if (membership) {
      redirect(`/${membership.cookbook.slug}`);
    } else {
      redirect("/onboarding");
    }
  }

  return <LandingPage />;
}
