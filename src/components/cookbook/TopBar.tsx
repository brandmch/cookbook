"use client";

import { signOut } from "next-auth/react";
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
  cookbookName: string;
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
  cookbookName,
  userName,
  userEmail,
  userImage,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-cream-0 shadow-topbar">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: cookbook name */}
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="font-mono text-[10px] eyebrow tracking-widest text-ink/40 shrink-0">
            myfamilyrecipes
          </span>
          <span className="text-ink/30 font-sans text-xs shrink-0">/</span>
          <span className="font-hand text-xl text-ink truncate">
            {cookbookName}
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
              <p className="font-slab text-sm text-ink font-semibold leading-none">
                {userName}
              </p>
              <p className="font-sans text-xs text-ink-faint mt-1 leading-none">
                {userEmail}
              </p>
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
