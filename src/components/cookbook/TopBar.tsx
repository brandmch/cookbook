"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Cookbook = { name: string; slug: string };

type TopBarProps = {
  currentSlug: string;
  cookbooks: Cookbook[];
  userName: string;
  userEmail: string;
  userImage?: string | null;
};

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

export default function TopBar({
  currentSlug,
  cookbooks,
  userName,
  userEmail,
  userImage,
}: TopBarProps) {
  const router = useRouter();
  const current = cookbooks.find((c) => c.slug === currentSlug) ?? cookbooks[0];

  return (
    <header className="sticky top-0 z-40 bg-cream-0 shadow-topbar">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Left: cookbook name / switcher */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[10px] eyebrow tracking-widest text-ink/40 shrink-0">
            myfamilyrecipes
          </span>
          <span className="text-ink/30 font-sans text-xs shrink-0">/</span>

          {cookbooks.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 font-hand text-xl text-ink truncate
                                   hover:text-accent transition-colors focus-visible:outline-none
                                   focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
                                   focus-visible:ring-offset-cream-0 rounded-sm">
                  {current?.name}
                  <ChevronDown className="h-3.5 w-3.5 text-ink/40 shrink-0 mt-0.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[200px]">
                <DropdownMenuLabel className="font-mono text-[10px] eyebrow text-ink/40 px-3 py-1.5">
                  Your cookbooks
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {cookbooks.map((cb) => (
                  <DropdownMenuItem
                    key={cb.slug}
                    onSelect={() => router.push(`/${cb.slug}`)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Check
                      className={`h-3.5 w-3.5 shrink-0 ${cb.slug === currentSlug ? "text-accent" : "opacity-0"}`}
                    />
                    <span className="font-hand text-lg leading-tight">{cb.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="font-hand text-xl text-ink truncate">{current?.name}</span>
          )}
        </div>

        {/* Right: user menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
                         focus-visible:ring-offset-2 focus-visible:ring-offset-cream-0 rounded-full"
            >
              <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
                {userImage && <AvatarImage src={userImage} alt={userName} />}
                <AvatarFallback>{initials(userName) || "?"}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-normal px-3 py-2">
              <p className="font-slab text-sm text-ink font-semibold leading-none">{userName}</p>
              <p className="font-sans text-xs text-ink-faint mt-1 leading-none">{userEmail}</p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-accent focus:bg-accent/10 focus:text-accent cursor-pointer"
              onSelect={() => signOut({ callbackUrl: "/login" })}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
