// Phase 5: Add recipe form
export default function NewRecipePage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen paper flex items-center justify-center p-6">
      <p className="font-hand text-3xl text-ink-soft">
        Add recipe to <em>{params.slug}</em> — coming in Phase 5
      </p>
    </div>
  );
}
