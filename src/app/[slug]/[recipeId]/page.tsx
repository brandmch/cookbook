// Phase 5: Recipe detail — story, ingredients, steps, serving scaler
export default function RecipeDetailPage({
  params,
}: {
  params: { slug: string; recipeId: string };
}) {
  return (
    <div className="min-h-screen paper flex items-center justify-center p-6">
      <p className="font-hand text-3xl text-ink-soft">
        Recipe <em>{params.recipeId}</em> — coming in Phase 5
      </p>
    </div>
  );
}
