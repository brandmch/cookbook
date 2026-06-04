"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Ingredient = { id: string; quantity: string | null; unit: string | null; label: string; order: number };
type Step = { id: string; text: string; order: number };

type Recipe = {
  id: string;
  title: string;
  category: string;
  story: string | null;
  serves: number;
  time: string | null;
  contributor: { name: string | null };
  ingredients: Ingredient[];
  steps: Step[];
};

type Props = {
  cookbookSlug: string;
  cookbookName: string;
  recipe: Recipe;
  isAuthor: boolean;
};

const CATEGORY_STAMPS: Record<string, string> = {
  Mains: "stamp-mains",
  Sides: "stamp-sides",
  Desserts: "stamp-desserts",
  Breakfast: "stamp-breakfast",
  Holiday: "stamp-holiday",
  Drinks: "stamp-drinks",
  Baking: "stamp-baking",
};

// ── Quantity scaling helpers ───────────────────────────────

function parseQty(q: string): number | null {
  const plain = parseFloat(q);
  if (!isNaN(plain) && String(plain) === q.trim()) return plain;

  // "a/b"
  const frac = q.trim().match(/^(\d+)\/(\d+)$/);
  if (frac) return parseInt(frac[1]) / parseInt(frac[2]);

  // "a b/c"
  const mixed = q.trim().match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);

  // plain number with spaces
  const simple = parseFloat(q);
  if (!isNaN(simple)) return simple;

  return null;
}

function formatQty(n: number): string {
  const fracs: [number, string][] = [
    [1 / 8, "⅛"], [1 / 4, "¼"], [1 / 3, "⅓"], [3 / 8, "⅜"],
    [1 / 2, "½"], [5 / 8, "⅝"], [2 / 3, "⅔"], [3 / 4, "¾"], [7 / 8, "⅞"],
  ];
  const whole = Math.floor(n);
  const rem = n - whole;
  if (rem < 0.01) return String(whole === 0 ? "" : whole);
  for (const [val, sym] of fracs) {
    if (Math.abs(rem - val) < 0.03) {
      return whole > 0 ? `${whole}${sym}` : sym;
    }
  }
  return n.toFixed(1).replace(/\.0$/, "");
}

function scaleQty(q: string | null, factor: number): string {
  if (!q) return "";
  const n = parseQty(q);
  if (n === null) return q;
  return formatQty(n * factor);
}

// ── Component ─────────────────────────────────────────────

export default function RecipeDetail({ cookbookSlug, recipe, isAuthor }: Props) {
  const router = useRouter();
  const [servings, setServings] = useState(recipe.serves);
  const factor = recipe.serves > 0 ? servings / recipe.serves : 1;
  const stampClass = CATEGORY_STAMPS[recipe.category] ?? "stamp-mains";
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push(`/${cookbookSlug}`);
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8 view-enter">
      {/* Back link + author controls */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/${cookbookSlug}`}
          className="font-sans text-sm text-ink/50 hover:text-ink transition-colors"
        >
          ← Back to cookbook
        </Link>

        {isAuthor && (
          <div className="flex items-center gap-3">
            <Link
              href={`/${cookbookSlug}/${recipe.id}/edit`}
              className="font-sans text-sm text-ink/50 hover:text-ink transition-colors"
            >
              Edit
            </Link>
            {confirmDelete ? (
              <span className="flex items-center gap-2">
                <span className="font-sans text-xs text-ink/50">Delete this recipe?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="font-sans text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="font-sans text-sm text-ink/40 hover:text-ink transition-colors"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="font-sans text-sm text-ink/50 hover:text-red-600 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Photo slot */}
      <div className="photo-slot w-full h-44 sm:h-56 rounded-[3px] mb-6">
        <span className={`cat-stamp ${stampClass} m-3`}>{recipe.category}</span>
        <div className="flex flex-col items-end gap-1 m-3">
          {recipe.time && (
            <span className="font-mono text-[11px] text-white/80">{recipe.time}</span>
          )}
        </div>
      </div>

      {/* Title + meta */}
      <h1 className="font-hand text-[clamp(36px,5vw,56px)] leading-tight text-ink mb-3">
        {recipe.title}
      </h1>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-6 font-sans text-sm text-ink-soft">
        <span>By {recipe.contributor.name ?? "Anonymous"}</span>
        <span className="text-line">·</span>
        <span>Serves {recipe.serves}</span>
        {recipe.time && (
          <>
            <span className="text-line">·</span>
            <span>{recipe.time}</span>
          </>
        )}
      </div>

      {/* Story */}
      {recipe.story && (
        <p className="font-sans text-sm text-ink-soft italic leading-relaxed mb-8 border-l-2 border-accent-soft pl-4">
          {recipe.story}
        </p>
      )}

      <div className="h-px bg-line mb-8" />

      {/* Two-col layout on sm+ */}
      <div className="grid sm:grid-cols-[220px_1fr] gap-8 sm:gap-12">
        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-slab font-semibold text-ink">Ingredients</h2>
            {/* Serves scaler */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="w-6 h-6 rounded-full bg-cream-2 hover:bg-cream-3 text-ink font-slab text-sm flex items-center justify-center transition-colors"
                aria-label="Reduce servings"
              >
                −
              </button>
              <span className="font-mono text-xs text-ink w-12 text-center">
                {servings} {servings === 1 ? "serving" : "servings"}
              </span>
              <button
                onClick={() => setServings((s) => Math.min(100, s + 1))}
                className="w-6 h-6 rounded-full bg-cream-2 hover:bg-cream-3 text-ink font-slab text-sm flex items-center justify-center transition-colors"
                aria-label="Increase servings"
              >
                +
              </button>
            </div>
          </div>

          <ul className="space-y-2.5">
            {recipe.ingredients.map((ing) => {
              const qty = scaleQty(ing.quantity, factor);
              return (
                <li key={ing.id} className="flex gap-2 font-sans text-sm text-ink leading-snug">
                  <span className="text-ink-soft shrink-0 w-14 text-right tabular-nums">
                    {qty}
                    {ing.unit ? <span className="ml-0.5">{ing.unit}</span> : null}
                  </span>
                  <span>{ing.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Steps */}
        <div>
          <h2 className="font-slab font-semibold text-ink mb-4">How to make it</h2>
          <ol className="space-y-5">
            {recipe.steps.map((step, idx) => (
              <li key={step.id} className="flex gap-3">
                <span className="font-slab text-2xl text-accent/40 leading-none w-7 shrink-0 text-right mt-0.5">
                  {idx + 1}
                </span>
                <p className="font-sans text-sm text-ink leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}
