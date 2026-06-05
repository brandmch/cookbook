import Link from "next/link";

type RecipeCardProps = {
  cookbookSlug: string;
  recipe: {
    id: string;
    slug: string;
    title: string;
    category: string;
    story: string | null;
    serves: number;
    time: string | null;
    contributor: { name: string | null };
  };
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

export default function RecipeCard({ cookbookSlug, recipe }: RecipeCardProps) {
  const stampClass = CATEGORY_STAMPS[recipe.category] ?? "stamp-mains";

  return (
    <Link
      href={`/${cookbookSlug}/${recipe.id}`}
      className="group block idxcard hover:shadow-card-hover transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream-1 rounded-[3px]"
    >
      {/* Photo slot */}
      <div className="photo-slot h-36 rounded-t-[3px]">
        {/* Category stamp in bottom-left */}
        <span className={`cat-stamp ${stampClass} m-2`}>{recipe.category}</span>
        {/* Serves + time in bottom-right */}
        <div className="flex flex-col items-end gap-0.5 m-2">
          {recipe.time && (
            <span className="font-mono text-[10px] text-white/80 leading-none">
              {recipe.time}
            </span>
          )}
          <span className="font-mono text-[10px] text-white/80 leading-none">
            serves {recipe.serves}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3 pt-2.5">
        <h3 className="font-hand text-[22px] leading-tight text-ink group-hover:text-accent transition-colors line-clamp-2">
          {recipe.title}
        </h3>
        {recipe.story && (
          <p className="font-sans text-xs text-ink-soft mt-1 line-clamp-2 leading-snug">
            {recipe.story}
          </p>
        )}
        <p className="font-mono text-[10px] text-ink-faint mt-2 tracking-wide">
          by {recipe.contributor.name ?? "Anonymous"}
        </p>
      </div>
    </Link>
  );
}
