interface HeaderProps {
  specificCategories: string[];
  activeCategories: Set<string>;
  onCategoryToggle: (category: string) => void;
  onToggleAll: () => void;
  drillOnly: boolean;
  onDrillToggle: () => void;
  lastMasteredId: string | null;
  onUndo: () => void;
  onShowDrillInfo: () => void;
  onShowAbout: () => void;
  onShowOptions: () => void;
  onShowMasteredCards: () => void;
  masteredCount: number;
  filteredWordsCount: number;
}

export function Header({
  specificCategories,
  activeCategories,
  onCategoryToggle,
  onToggleAll,
  drillOnly,
  onDrillToggle,
  lastMasteredId,
  onUndo,
  onShowDrillInfo,
  onShowAbout,
  onShowOptions,
  onShowMasteredCards,
  masteredCount,
  filteredWordsCount,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-md z-10 border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between min-h-8">
          <div className="flex items-center gap-3 flex-shrink-0">
            <h1 className="text-xl font-black text-zinc-100 tracking-tighter whitespace-nowrap">
              ilo Peli
            </h1>
            <button
              onClick={onShowAbout}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-500 hover:text-zinc-200 border border-zinc-800"
              title="About ilo Peli"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <button
              onClick={onShowOptions}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-500 hover:text-zinc-200 border border-zinc-800"
              title="Options"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <button
              onClick={onShowMasteredCards}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-500 hover:text-zinc-200 border border-zinc-800"
              title="Manage Mastered Cards"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </button>
            <div className="hidden md:flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-900 text-zinc-500 border border-zinc-800 uppercase tracking-wider">
              {masteredCount} / {filteredWordsCount} mastered
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onDrillToggle}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-colors ${
                drillOnly
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
              title="Drill Mode: Hide mastered cards (D)"
            >
              {drillOnly ? 'DRILL ON' : 'DRILL OFF'}
            </button>
            {lastMasteredId && (
              <button
                onClick={onUndo}
                className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-zinc-900 text-zinc-300 hover:text-zinc-100 border border-zinc-800"
                title="Undo last master (Z)"
              >
                UNDO
              </button>
            )}
            <button
              onClick={onShowDrillInfo}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-500 hover:text-zinc-200 border border-zinc-800"
              title="What is Drill Mode?"
            >
              ?
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {specificCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryToggle(cat)}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-colors ${
                activeCategories.has(cat)
                  ? 'bg-zinc-100 text-zinc-950'
                  : 'bg-zinc-900 text-zinc-500 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}

          <div className="w-px h-6 bg-zinc-700 mx-1" />

          <button
            onClick={onToggleAll}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-colors ${
              activeCategories.size === specificCategories.length
                ? 'bg-zinc-100 text-zinc-950'
                : 'bg-zinc-900 text-zinc-500 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            ALL
          </button>
        </div>
      </div>
    </header>
  );
}
