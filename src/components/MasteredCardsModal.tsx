import type { Word } from '../types';

interface MasteredCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  masteredWords: Word[];
  masteredCount: number;
  filteredWordsCount: number;
  onUnmasterCard: (id: string) => void;
  onUnmasterAll: () => void;
}

export function MasteredCardsModal({
  isOpen,
  onClose,
  masteredWords,
  masteredCount,
  filteredWordsCount,
  onUnmasterCard,
  onUnmasterAll,
}: MasteredCardsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-zinc-100 mb-2">
          Mastered Cards
        </h2>
        <p className="text-sm text-zinc-500 mb-2">
          {masteredCount} / {filteredWordsCount} cards mastered
        </p>
        <p className="text-xs text-zinc-600 mb-6 italic">
          Showing mastered cards for your filtered categories only
        </p>

        <div className="flex-1 overflow-y-auto mb-6 pr-2">
          {masteredWords.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-zinc-500">
                No mastered cards yet. Keep drilling!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {masteredWords.map((word) => (
                <div
                  key={word.id}
                  className="flex items-center justify-between bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-100 truncate">
                      {word.word}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {word.definition_en}
                    </p>
                  </div>
                  <button
                    onClick={() => onUnmasterCard(word.id)}
                    className="ml-2 px-3 py-1 rounded-lg bg-zinc-700 hover:bg-red-600 text-zinc-100 text-xs font-semibold transition-colors active:scale-95 flex-shrink-0"
                    title="Unmaster this card"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onUnmasterAll}
            className="flex-1 py-3 rounded-2xl bg-red-900 hover:bg-red-800 text-red-100 font-bold transition-all active:scale-95 border border-red-800"
            disabled={masteredWords.length === 0}
          >
            Unmaster All
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-zinc-100 text-zinc-950 font-bold hover:bg-white transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
