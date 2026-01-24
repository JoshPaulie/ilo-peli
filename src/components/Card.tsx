import { useRef, useEffect, useState } from 'react'
import { useToast } from '../contexts/ToastContext'
import type { Word } from '../types'
import nimiLiLogo from '../assets/nimi-li.png'

interface CardProps {
  currentWord: Word | undefined
  backWord: Word | undefined
  isFlipped: boolean
  onFlip: () => void
  masteredIds: Set<string>
  onToggleMastered: (id: string) => void
  onPlayAudio: (word: Word) => void
  drillOnly?: boolean
  onProgressCard?: () => void
}

export function Card({
  currentWord,
  backWord,
  isFlipped,
  onFlip,
  masteredIds,
  onToggleMastered,
  onPlayAudio,
  drillOnly = false,
  onProgressCard,
}: CardProps) {
  const backFaceRef = useRef<HTMLDivElement>(null)
  const prevWordIdRef = useRef<string | undefined>(undefined)
  const [showBorderFlash, setShowBorderFlash] = useState(false)
  const { addToast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    addToast(`Copied: ${text}`)
  }

  useEffect(() => {
    if (backFaceRef.current) {
      backFaceRef.current.scrollTop = 0
    }
    prevWordIdRef.current = currentWord?.id
  }, [currentWord?.id])

  useEffect(() => {
    if (showBorderFlash) {
      const timer = setTimeout(() => setShowBorderFlash(false), 600)
      return () => clearTimeout(timer)
    }
  }, [showBorderFlash])

  const handleToggleMastered = (id: string) => {
    setShowBorderFlash(true)
    
    // Delay state update and progression until animation completes
    if (drillOnly && onProgressCard) {
      const timer = setTimeout(() => {
        onToggleMastered(id)
        onProgressCard()
      }, 600)
      return () => clearTimeout(timer)
    } else {
      // In normal mode, delay state update but don't progress
      const timer = setTimeout(() => {
        onToggleMastered(id)
      }, 600)
      return () => clearTimeout(timer)
    }
  }

  if (!currentWord || !backWord) return null

  return (
    <div
      onClick={onFlip}
      className="relative w-full aspect-4/3 sm:aspect-video perspective-1000 cursor-pointer group"
    >
      <div
        className={`relative w-full h-full transform-style-3d will-change-transform ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front */}
        <div className={`absolute inset-0 backface-hidden bg-zinc-900 border-2 rounded-3xl flex flex-col items-center justify-center p-6 sm:p-8 shadow-2xl overflow-hidden border-zinc-800`}>
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleToggleMastered(currentWord.id)
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
              {currentWord.usage_category}
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
          data-card-back
          className={`absolute inset-0 backface-hidden rotate-y-180 bg-zinc-900 border-2 rounded-3xl flex flex-col p-6 sm:p-10 shadow-2xl overflow-y-auto ${
            isFlipped ? 'opacity-100' : 'opacity-0'
          } border-zinc-800`}
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
                {backWord.representations?.ligatures?.[0] && (
                  <span 
                    className="text-2xl sm:text-3xl opacity-80"
                    style={{ fontFamily: 'nasin nanpa' }}
                    title="Word symbol"
                  >
                    {backWord.representations.ligatures[0]}
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-1">
                <a
                  href={`https://nimi.li/${backWord.word}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="View on nimi.li"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src={nimiLiLogo} alt="nimi.li" className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
                {backWord.audio && backWord.audio.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onPlayAudio(backWord)
                    }}
                    className="p-2.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
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
                    handleToggleMastered(backWord.id)
                  }}
                  className={`p-2.5 rounded-lg transition-all ${
                    masteredIds.has(backWord.id)
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
                <span>{backWord.source_language || 'Unknown'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-600 uppercase text-[10px] font-bold tracking-wider">Usage</span>
                <span>
                  {backWord.usage_category}
                  {backWord.usage && (
                    <>
                      {' '}
                      (
                      {Math.max(...Object.values(backWord.usage))}
                      %)
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <section>
              <h3 className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest mb-1">
                Definition
              </h3>
              <div className="text-sm sm:text-base leading-relaxed text-zinc-200 space-y-2">
                {backWord.definition_en.split('\n').map((line: string, i: number) => (
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
                    .sort((a, b) => (backWord.usage_data?.[b] ?? 0) - (backWord.usage_data?.[a] ?? 0))
                    .slice(0, 10)
                    .map((translation, idx) => (
                      <span key={idx}>
                        {translation}
                        {backWord.usage_data && backWord.usage_data[translation] && (
                          <sup className="text-[10px] ml-0.5">
                            {backWord.usage_data[translation]}
                          </sup>
                        )}
                      </span>
                    ))}
                </div>
              </section>
            )}

            {backWord.pu_verbatim_en && backWord.pu_verbatim_en.length > 0 && (
              <section>
                <h3 className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest mb-1">
                  pu verbatim
                </h3>
                <div className="text-sm sm:text-base leading-relaxed text-zinc-200 space-y-2">
                  <div className="space-y-2">
                    {backWord.pu_verbatim_en.map((def, i) => (
                      <div key={i}>
                        <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded text-[10px] font-bold tracking-wider uppercase mr-2">
                          {def.pos}
                        </span>
                        <span className="text-zinc-200">{def.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {backWord.semantic_space_en && (
              <section>
                <h3 className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest mb-1">
                  Semantic Space (by lipamanka)
                </h3>
                <div className="text-sm sm:text-base leading-relaxed text-zinc-400 space-y-3">
                  {backWord.semantic_space_en.split('\n\n').map((p, i) => (
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
            {backWord.commentary_en && (
              <section>
                <h3 className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest mb-1">
                  Commentary
                </h3>
                <div className="text-sm sm:text-base leading-relaxed text-zinc-400 space-y-3">
                  {backWord.commentary_en.split('\n').map((p: string, i: number) => (
                    <p key={i}>{p}</p>
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
