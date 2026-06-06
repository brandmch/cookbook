"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type TopBarProps = {
  userName: string;
  userEmail: string;
  userImage?: string | null;
  cookbookSlug?: string;
};

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

export default function TopBar({ userName, userEmail, userImage, cookbookSlug }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-cream-0 shadow-topbar">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Left: brand */}
        <div className="flex items-center gap-2 shrink-0">
          <Image src="/icons/mfr-app-icon-64.png" alt="Fam Cookbook" width={24} height={24} className="rounded-sm" />
          <span className="font-mono text-[10px] eyebrow tracking-widest text-ink/40">
            Fam Cookbook
          </span>
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

            {cookbookSlug && (
              <DropdownMenuItem asChild>
                <Link
                  href={`/${cookbookSlug}/settings`}
                  className="cursor-pointer"
                >
                  Settings
                </Link>
              </DropdownMenuItem>
            )}

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
