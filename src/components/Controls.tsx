interface ControlsProps {
  index: number
  total: number
  onFlip: () => void
  onPrev: () => void
  onNext: () => void
  onShuffle: () => void
  showVowelKey: boolean
  onToggleVowelKey: () => void
}

export function Controls({
  index,
  total,
  onFlip,
  onPrev,
  onNext,
  onShuffle,
  showVowelKey,
  onToggleVowelKey,
}: ControlsProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-full px-2">
      <div className="flex items-center gap-4 text-zinc-500 text-sm font-mono">
        <span>
          {index + 1} / {total}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 w-full">
        {/* Primary navigation */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPrev()
            }}
            className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-all active:scale-95"
            title="Previous (Left Arrow)"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onFlip()
            }}
            className="px-8 py-4 rounded-2xl bg-zinc-100 text-zinc-950 font-bold hover:bg-white transition-all active:scale-95 min-w-30"
          >
            FLIP
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-all active:scale-95"
            title="Next (Right Arrow)"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Secondary tools */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onShuffle()
            }}
            className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-all active:scale-95"
            title="Shuffle (S)"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleVowelKey()
            }}
            className={`px-6 py-4 rounded-2xl border transition-all active:scale-95 font-bold text-sm ${
              showVowelKey
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
            }`}
            title="Vowel Key (V)"
          >
            VOWEL TABLE
          </button>
        </div>
      </div>

      <div className="text-[10px] text-zinc-600 mt-2 tracking-widest uppercase font-mono text-center hidden sm:block space-y-1">
        <p>Space: Flip • Arrows: Navigate • S: Shuffle • A: Audio • V: Vowels</p>
        <p>M: Master • D: Drill • Z: Undo</p>
      </div>
    </div>
  )
}
