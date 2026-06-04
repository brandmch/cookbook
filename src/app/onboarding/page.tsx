import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const existing = await db.cookbook.findFirst({
    where: { ownerId: session.user.id },
    select: { slug: true },
  });
  if (existing) redirect(`/${existing.slug}`);

  return <OnboardingForm userName={session.user.name ?? ""} />;
}
