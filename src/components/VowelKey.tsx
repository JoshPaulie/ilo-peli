import { VOWEL_DATA } from '../types'

interface VowelKeyProps {
  onClose: () => void
}

export function VowelKey({ onClose }: VowelKeyProps) {
  return (
    <aside className="w-full lg:w-72 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 shrink-0 max-h-125 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-zinc-50">Vowel Key</h3>
        <button onClick={onClose} className="lg:hidden p-2 text-zinc-500 hover:text-zinc-300">
          <svg
            className="w-5 h-5"
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
      </div>
      <div className="space-y-3">
        {VOWEL_DATA.map((item) => (
          <div
            key={item.vowel}
            className="flex items-start gap-3 pb-3 border-b border-zinc-800 last:border-0 last:pb-0"
          >
            <div className="text-3xl font-bold text-zinc-100 min-w-fit w-8">{item.vowel}</div>
            <div className="flex-1">
              <div className="text-sm text-zinc-400">
                <span className="text-zinc-500 font-mono">{item.pronunciation}</span>
              </div>
              <div className="text-sm text-zinc-400 mt-1">{item.examples}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
