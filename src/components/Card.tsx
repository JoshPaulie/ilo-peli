import { useRef, useEffect } from 'react'
import { useToast } from '../contexts/ToastContext'
import type { Word } from '../types'

interface CardProps {
  currentWord: Word | undefined
  backWord: Word | undefined
  isFlipped: boolean
  onFlip: () => void
  masteredIds: Set<string>
  onToggleMastered: (id: string) => void
  onPlayAudio: (word: Word) => void
  disableAnimations: boolean
}

export function Card({
  currentWord,
  backWord,
  isFlipped,
  onFlip,
  masteredIds,
  onToggleMastered,
  onPlayAudio,
  disableAnimations,
}: CardProps) {
  const backFaceRef = useRef<HTMLDivElement>(null)
  const { addToast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    addToast(`Copied: ${text}`)
  }

  useEffect(() => {
    if (backFaceRef.current) {
      backFaceRef.current.scrollTop = 0
    }
  }, [currentWord?.id])

  if (!currentWord || !backWord) return null

  return (
    <div
      onClick={onFlip}
      className="relative w-full aspect-4/3 sm:aspect-video perspective-1000 cursor-pointer group"
    >
      <div
        className={`relative w-full h-full transition-transform ${
          disableAnimations ? 'duration-0' : 'duration-500'
        } transform-style-3d will-change-transform ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-zinc-900 border-2 border-zinc-800 rounded-3xl flex flex-col items-center justify-center p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleMastered(currentWord.id)
              }}
              className={`p-2.5 sm:p-3 rounded-2xl transition-all ${
                masteredIds.has(currentWord.id)
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50'
                  : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 hover:border-zinc-500'
              }`}
              title="Mark as Mastered (M)"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={masteredIds.has(currentWord.id) ? 3 : 2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          </div>
          <h1 
            onClick={(e) => {
              e.stopPropagation()
              copyToClipboard(currentWord.word)
            }}
            className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-zinc-50 text-center wrap-break-word px-4 cursor-pointer hover:opacity-70 transition-opacity"
            title="Click to copy"
          >
            {currentWord.word}
          </h1>
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-zinc-500 font-mono text-[10px] sm:text-xs tracking-[0.2em] uppercase">
              {currentWord.usage}
            </p>
            {currentWord.audio && currentWord.audio.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPlayAudio(currentWord)
                }}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                title="Play Pronunciation (A)"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Back */}
        <div
          ref={backFaceRef}
          className="absolute inset-0 backface-hidden rotate-y-180 bg-zinc-900 border-2 border-zinc-800 rounded-3xl flex flex-col p-6 sm:p-10 shadow-2xl overflow-y-auto"
        >
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-4">
              <h2 
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard(backWord.word)
                }}
                className="text-2xl sm:text-3xl font-bold text-zinc-50 flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity"
                title="Click to copy"
              >
                {backWord.word}
                {backWord.emoji && (
                  <span className="text-xl sm:text-2xl opacity-80" title="Word emoji">
                    {backWord.emoji}
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                <a
                  href={`https://nimi.li/${backWord.word}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="View on nimi.li"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src="/nimi-li.png" alt="nimi.li" className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
                {backWord.audio && backWord.audio.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onPlayAudio(backWord)
                    }}
                    className="p-2 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                    title="Play Pronunciation (A)"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleMastered(backWord.id)
                  }}
                  className={`p-2 rounded-xl transition-all ${
                    masteredIds.has(backWord.id)
                      ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50'
                      : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 hover:border-zinc-500'
                  }`}
                  title="Mark as Mastered (M)"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={masteredIds.has(backWord.id) ? 3 : 2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-zinc-400 mb-4 tracking-tight">
              <div className="flex flex-col">
                <span className="text-zinc-600 uppercase text-[10px] font-bold tracking-wider">Source</span>
                <span>{backWord.source || 'Unknown'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-600 uppercase text-[10px] font-bold tracking-wider">Usage</span>
                <span>{backWord.usage}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <section>
              <h3 className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest mb-1">
                Definition
              </h3>
              <div className="text-sm sm:text-base leading-relaxed text-zinc-200 space-y-2">
                {backWord.pos && backWord.pos.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {backWord.pos.map((p, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded text-[10px] font-bold tracking-wider uppercase"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
                {backWord.definition.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </section>

            {backWord.translations?.ku && (
              <section>
                <h3 className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest mb-1">
                  Common Translations (ku)
                </h3>
                <div className="text-sm text-zinc-400 leading-relaxed italic flex flex-wrap gap-2">
                  {backWord.translations.ku
                    .split(', ')
                    .slice(0, 10)
                    .map((translation, idx) => (
                      <span key={idx}>
                        {translation}
                        {backWord.usage_percentages && backWord.usage_percentages[translation] && (
                          <sup className="text-[10px] ml-0.5">
                            {backWord.usage_percentages[translation]}
                          </sup>
                        )}
                      </span>
                    ))}
                </div>
              </section>
            )}

            {backWord.semantic_space && (
              <section>
                <h3 className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest mb-1">
                  Semantic Space
                </h3>
                <div className="text-sm sm:text-base leading-relaxed text-zinc-400 space-y-3">
                  {backWord.semantic_space.split('\n\n').map((p, i) => (
                    <p key={i}>
                      {p.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
                        part.startsWith('**') && part.endsWith('**') ? (
                          <strong key={j} className="text-zinc-200 font-semibold">
                            {part.slice(2, -2)}
                          </strong>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
