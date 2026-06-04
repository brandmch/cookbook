// Phase 4: Cookbook wall — recipe card grid, search, filters
export default function CookbookWallPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen paper flex items-center justify-center p-6">
      <p className="font-hand text-3xl text-ink-soft">
        Cookbook wall for <em>{params.slug}</em> — coming in Phase 4
      </p>
    </div>
  );
}
