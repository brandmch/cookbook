"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import RecipeCard from "./RecipeCard";
import InviteDialog from "./InviteDialog";

const CATEGORIES = ["All", "Mains", "Sides", "Desserts", "Breakfast", "Holiday", "Drinks", "Baking"];

type Recipe = {
  id: string;
  slug: string;
  title: string;
  category: string;
  story: string | null;
  serves: number;
  time: string | null;
  contributor: { name: string | null };
};

type Cookbook = { name: string; slug: string };

type CookbookWallProps = {
  cookbookSlug: string;
  cookbookName: string;
  cookbooks: Cookbook[];
  recipes: Recipe[];
  isOwner: boolean;
};

export default function CookbookWall({ cookbookSlug, cookbookName, cookbooks, recipes, isOwner }: CookbookWallProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    document.cookie = `last-cookbook=${cookbookSlug}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
  }, [cookbookSlug]);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      const matchesCategory = activeCategory === "All" || r.category === activeCategory;
      const matchesSearch =
        !search.trim() ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        (r.story ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (r.contributor.name ?? "").toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [recipes, search, activeCategory]);

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 view-enter">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex items-baseline gap-2 mr-auto">
          {cookbooks.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 font-hand text-3xl text-ink leading-none
                                   hover:text-accent transition-colors focus-visible:outline-none
                                   focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
                                   focus-visible:ring-offset-cream-1 rounded-sm">
                  {cookbookName}
                  <ChevronDown className="h-4 w-4 text-ink/40 shrink-0 mb-0.5" />
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
                      className={`h-3.5 w-3.5 shrink-0 ${cb.slug === cookbookSlug ? "text-accent" : "opacity-0"}`}
                    />
                    <span className="font-hand text-lg leading-tight">{cb.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <h1 className="font-hand text-3xl text-ink leading-none">{cookbookName}</h1>
          )}
          <span className="font-mono text-xs text-ink-faint">
            {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="search"
            placeholder="Search recipes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 sm:w-56 bg-cream-0 border-ink/20 font-sans text-sm text-ink
                       placeholder:text-ink/30 focus-visible:ring-accent/40 focus-visible:border-accent h-8"
          />
          {isOwner && (
            <Button
              variant="ghost"
              onClick={() => setInviteOpen(true)}
              className="font-slab text-sm h-8 px-3 text-ink-soft hover:text-ink shrink-0"
            >
              Invite
            </Button>
          )}
          <Button
            asChild
            className="bg-accent hover:bg-accent/90 text-cream-0 font-slab text-sm h-8 px-3 shadow-btn-primary shrink-0"
          >
            <Link href={`/${cookbookSlug}/new`}>+ Add recipe</Link>
          </Button>
        </div>

        {isOwner && (
          <InviteDialog
            open={inviteOpen}
            onOpenChange={setInviteOpen}
            cookbookSlug={cookbookSlug}
            cookbookName={cookbookName}
          />
        )}
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-1.5 mb-7">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`font-mono text-[11px] tracking-wide uppercase px-3 py-1 rounded-pill transition-colors ${
              activeCategory === cat
                ? "bg-ink text-cream-0"
                : "bg-cream-0 text-ink-soft hover:bg-cream-2 border border-line"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recipe grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} cookbookSlug={cookbookSlug} recipe={recipe} />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <EmptyState cookbookSlug={cookbookSlug} />
      ) : (
        <NoResults onClear={() => { setSearch(""); setActiveCategory("All"); }} />
      )}
    </main>
  );
}

function EmptyState({ cookbookSlug }: { cookbookSlug: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="idxcard w-48 h-56 flex flex-col items-center justify-center gap-3 mb-8 rotate-[-2deg]">
        <div className="photo-slot w-full h-28 rounded-t-[3px]" />
        <div className="px-3 pb-3 w-full">
          <div className="h-3 bg-line rounded-full w-3/4 mb-2" />
          <div className="h-2 bg-line/60 rounded-full w-1/2" />
        </div>
      </div>
      <h2 className="font-hand text-3xl text-ink mb-2">No recipes yet</h2>
      <p className="font-sans text-sm text-ink-soft max-w-xs mb-6">
        Add your first recipe and start building your family&apos;s collection.
      </p>
      <Button
        asChild
        className="bg-accent hover:bg-accent/90 text-cream-0 font-slab shadow-btn-primary"
      >
        <Link href={`/${cookbookSlug}/new`}>Add your first recipe →</Link>
      </Button>
    </div>
  );
}

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="font-hand text-2xl text-ink mb-2">Nothing matches</p>
      <p className="font-sans text-sm text-ink-soft mb-5">
        Try a different search or category.
      </p>
      <button
        onClick={onClear}
        className="font-sans text-sm text-accent underline hover:text-accent/80"
      >
        Clear filters
      </button>
    </div>
  );
}
