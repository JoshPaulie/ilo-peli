interface EmptyStateProps {
  onShowAll: () => void
  onReset: () => void
}

export function EmptyState({ onShowAll, onReset }: EmptyStateProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-zinc-400 bg-zinc-950">
      <h2 className="text-4xl font-bold text-zinc-100 mb-4">pona a!</h2>
      <p className="text-lg">You have mastered all the cards in this selection.</p>
      <button
        onClick={onShowAll}
        className="mt-8 px-8 py-3 rounded-2xl bg-zinc-100 text-zinc-950 font-bold hover:bg-white transition-all active:scale-95"
      >
        Show All Cards
      </button>
      <button
        onClick={onReset}
        className="mt-4 text-sm text-zinc-500 hover:text-red-400 transition-colors"
      >
        Reset Mastered Stats
      </button>
    </div>
  )
}
