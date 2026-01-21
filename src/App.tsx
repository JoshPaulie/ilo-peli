import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import wordData from './data.json'

interface Word {
  id: string
  word: string
  usage: string
  source: string
  definition: string
  semantic_space: string
  pos?: string[]
  emoji?: string
  sitelen_sitelen?: string
  creator?: string[]
  audio?: { author: string; link: string }[]
  etymology?: { word?: string; definition?: string }[]
  coined_era?: string
  translations?: Record<string, string>
  usage_percentages?: Record<string, number>
}

function App() {
  const [index, setIndex] = useState<number>(() => {
    const saved = localStorage.getItem('cardIndex')
    if (saved) {
      const parsed = parseInt(saved, 10)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  })
  const [isFlipped, setIsFlipped] = useState(false)
  const [filter, setFilter] = useState<string>(() => {
    return localStorage.getItem('cardFilter') || 'all'
  })
  const [words, setWords] = useState<Word[]>(() => {
    const saved = localStorage.getItem('cardDeckOrder')
    if (saved) {
      try {
        const wordIds = JSON.parse(saved) as string[]
        return wordIds
          .map(id => (wordData as Word[]).find(w => w.id === id))
          .filter((w): w is Word => w !== undefined)
      } catch {
        return []
      }
    }
    return []
  })
  const [showVowelKey, setShowVowelKey] = useState(false)
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('masteredIds')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })
  const [drillOnly, setDrillOnly] = useState<boolean>(() => {
    const saved = localStorage.getItem('drillOnly')
    return saved ? JSON.parse(saved) : false
  })
  const [lastMasteredId, setLastMasteredId] = useState<string | null>(null)
  const [showAbout, setShowAbout] = useState(false)
  const [showDrillInfo, setShowDrillInfo] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [speakerMode, setSpeakerMode] = useState<'random' | 'alternating' | 'specific'>(() => {
    const saved = localStorage.getItem('speakerMode')
    if (saved === 'random' || saved === 'alternating' || saved === 'specific') {
      return saved
    }
    return 'random'
  })
  const [specificSpeaker, setSpecificSpeaker] = useState<string>(() => {
    return localStorage.getItem('specificSpeaker') || ''
  })
  const [lastUsedSpeaker, setLastUsedSpeaker] = useState<string>('')
  const [shuffleOnCategoryChange, setShuffleOnCategoryChange] = useState(() => {
    const saved = localStorage.getItem('shuffleOnCategoryChange')
    return saved ? JSON.parse(saved) : false
  })
  const [disableAnimations, setDisableAnimations] = useState(() => {
    const saved = localStorage.getItem('disableAnimations')
    return saved ? JSON.parse(saved) : false
  })
  const [excludeKijetesantakalu, setExcludeKijetesantakalu] = useState(() => {
    const saved = localStorage.getItem('excludeKijetesantakalu')
    return saved ? JSON.parse(saved) : false
  })
  const backFaceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem('masteredIds', JSON.stringify(Array.from(masteredIds)))
  }, [masteredIds])

  useEffect(() => {
    localStorage.setItem('speakerMode', speakerMode)
  }, [speakerMode])

  useEffect(() => {
    localStorage.setItem('specificSpeaker', specificSpeaker)
  }, [specificSpeaker])

  useEffect(() => {
    localStorage.setItem('shuffleOnCategoryChange', JSON.stringify(shuffleOnCategoryChange))
  }, [shuffleOnCategoryChange])

  useEffect(() => {
    localStorage.setItem('disableAnimations', JSON.stringify(disableAnimations))
  }, [disableAnimations])

  useEffect(() => {
    localStorage.setItem('excludeKijetesantakalu', JSON.stringify(excludeKijetesantakalu))
  }, [excludeKijetesantakalu])

  useEffect(() => {
    localStorage.setItem('cardFilter', filter)
  }, [filter])

  useEffect(() => {
    localStorage.setItem('cardIndex', index.toString())
  }, [index])

  useEffect(() => {
    localStorage.setItem('cardDeckOrder', JSON.stringify(words.map(w => w.id)))
  }, [words])

  useEffect(() => {
    localStorage.setItem('drillOnly', JSON.stringify(drillOnly))
  }, [drillOnly])

  const isNoun = (word: Word) => word.pos?.includes('NOUN')

  const filteredWords = useMemo(() => {
    let baseWords = wordData as Word[]
    if (filter === 'nouns') {
      baseWords = baseWords.filter(isNoun)
    } else if (filter !== 'all') {
      baseWords = baseWords.filter(w => w.usage === filter)
    }
    if (excludeKijetesantakalu) {
      baseWords = baseWords.filter(w => w.id !== 'kijetesantakalu')
    }
    return baseWords
  }, [filter, excludeKijetesantakalu])

  // Use shuffled words if available, otherwise use filtered words
  const baseList = words.length > 0 ? words : filteredWords
  const displayWords = useMemo(() => {
    if (drillOnly) {
      return baseList.filter(w => !masteredIds.has(w.id))
    }
    return baseList
  }, [baseList, drillOnly, masteredIds])

  // Validate and adjust index if out of bounds
  useEffect(() => {
    if (displayWords.length > 0 && index >= displayWords.length) {
      setIndex(displayWords.length - 1)
    }
  }, [displayWords.length, index])

  const currentWord = displayWords[index] || displayWords[0]
  const [backWord, setBackWord] = useState<Word>(currentWord)

  useEffect(() => {
    setBackWord(currentWord)
  }, [currentWord])

  useEffect(() => {
    if (backFaceRef.current) {
      backFaceRef.current.scrollTop = 0
    }
  }, [currentWord?.id])

  const masteredCount = useMemo(() => {
    return filteredWords.filter(w => masteredIds.has(w.id)).length
  }, [filteredWords, masteredIds])

  const toggleMastered = useCallback((id: string) => {
    setMasteredIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        setLastMasteredId(null)
      } else {
        next.add(id)
        setLastMasteredId(id)
      }
      return next
    })
    
    // Reset flip when marking a card (often move to next in drill mode)
    if (drillOnly) {
      setIsFlipped(false)
    }
  }, [drillOnly])

  const undoMastered = useCallback(() => {
    if (lastMasteredId) {
      setMasteredIds(prev => {
        const next = new Set(prev)
        next.delete(lastMasteredId)
        return next
      })
      setLastMasteredId(null)
    }
  }, [lastMasteredId])

  const resetMastered = useCallback(() => {
    if (confirm('Are you sure you want to reset all mastered cards?')) {
      setMasteredIds(new Set())
    }
  }, [])

  const shuffleCard = useCallback(() => {
    const shuffled = [...displayWords].sort(() => Math.random() - 0.5)
    setWords(shuffled)
    setIndex(0)
    setIsFlipped(false)
  }, [displayWords])

  const nextCard = useCallback(() => {
    if (drillOnly && index === displayWords.length - 1 && displayWords.length > 1) {
      shuffleCard()
    } else {
      setIndex((prev) => (prev + 1) % displayWords.length)
      setIsFlipped(false)
    }
  }, [displayWords.length, index, drillOnly, shuffleCard])

  const prevCard = useCallback(() => {
    if (drillOnly && index === 0 && displayWords.length > 1) {
      shuffleCard()
    } else {
      setIndex((prev) => (prev - 1 + displayWords.length) % displayWords.length)
      setIsFlipped(false)
    }
  }, [displayWords.length, index, drillOnly, shuffleCard])

  const toggleFlip = () => setIsFlipped(!isFlipped)

  const handleFilterChange = useCallback((newFilter: string) => {
    setFilter(newFilter)
    setIndex(0)
    setIsFlipped(false)
    setMasteredIds(new Set())
    setLastMasteredId(null)
    
    if (shuffleOnCategoryChange) {
      let baseWords = wordData as Word[]
      if (newFilter === 'nouns') {
        baseWords = baseWords.filter(isNoun)
      } else if (newFilter !== 'all') {
        baseWords = baseWords.filter(w => w.usage === newFilter)
      }
      const shuffled = [...baseWords].sort(() => Math.random() - 0.5)
      setWords(shuffled)
    } else {
      setWords([])
    }
  }, [shuffleOnCategoryChange])

  const handleDrillToggle = useCallback(() => {
    setDrillOnly(prev => !prev)
    setIndex(0)
    setIsFlipped(false)
    setWords([])
    setLastMasteredId(null)
  }, [])

  const playAudio = useCallback((word: Word) => {
    if (!word?.audio || word.audio.length === 0) return
    
    let audioObj = word.audio[0]
    
    if (speakerMode === 'random') {
      audioObj = word.audio[Math.floor(Math.random() * word.audio.length)]
    } else if (speakerMode === 'alternating') {
      const speakers = Array.from(new Set(word.audio.map(a => a.author)))
      if (speakers.length > 1) {
        const nextSpeaker = speakers.find(s => s !== lastUsedSpeaker)
        if (nextSpeaker) {
          const optionsFromSpeaker = word.audio.filter(a => a.author === nextSpeaker)
          audioObj = optionsFromSpeaker[Math.floor(Math.random() * optionsFromSpeaker.length)]
          setLastUsedSpeaker(nextSpeaker)
        } else {
          audioObj = word.audio[Math.floor(Math.random() * word.audio.length)]
        }
      }
    } else if (speakerMode === 'specific' && specificSpeaker) {
      const optionsFromSpeaker = word.audio.filter(a => a.author === specificSpeaker)
      if (optionsFromSpeaker.length > 0) {
        audioObj = optionsFromSpeaker[Math.floor(Math.random() * optionsFromSpeaker.length)]
      } else {
        audioObj = word.audio[Math.floor(Math.random() * word.audio.length)]
      }
    }
    
    const audio = new Audio(audioObj.link)
    audio.play().catch(err => console.error('Audio playback failed:', err))
  }, [speakerMode, specificSpeaker, lastUsedSpeaker])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        setIsFlipped(prev => !prev)
      } else if (e.code === 'ArrowRight' || e.code === 'KeyL') {
        e.preventDefault()
        nextCard()
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyH') {
        e.preventDefault()
        prevCard()
      } else if (e.code === 'ArrowUp' || e.code === 'KeyK') {
        if (isFlipped && backFaceRef.current) {
          e.preventDefault()
          const scrollAmount = 40
          backFaceRef.current.scrollBy(0, -scrollAmount)
        }
      } else if (e.code === 'ArrowDown' || e.code === 'KeyJ') {
        if (isFlipped && backFaceRef.current) {
          e.preventDefault()
          const scrollAmount = 40
          backFaceRef.current.scrollBy(0, scrollAmount)
        }
      } else if (e.code === 'KeyS') {
        shuffleCard()
      } else if (e.code === 'KeyA') {
        e.preventDefault()
        if (currentWord) playAudio(currentWord)
      } else if (e.code === 'KeyM') {
        if (currentWord) {
          toggleMastered(currentWord.id)
        }
      } else if (e.code === 'KeyD') {
        handleDrillToggle()
      } else if (e.code === 'KeyV') {
        setShowVowelKey(prev => !prev)
      } else if (e.code === 'KeyZ') {
        undoMastered()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextCard, prevCard, shuffleCard, isFlipped, playAudio, currentWord, toggleMastered, undoMastered, handleDrillToggle])

  const uniqueSpeakers = useMemo(() => {
    const speakers = new Set<string>()
    wordData.forEach(word => {
      if (word.audio) {
        word.audio.forEach(a => speakers.add(a.author))
      }
    })
    return Array.from(speakers).sort()
  }, [])

  const allUsages = Array.from(new Set(wordData.map(w => w.usage))).filter(Boolean)
  const categories = ['all', 'nouns', ...allUsages.filter(u => u !== 'obscure'), ...allUsages.filter(u => u === 'obscure')]

  if (displayWords.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-zinc-400 bg-zinc-950">
        <h2 className="text-4xl font-bold text-zinc-100 mb-4">pona a!</h2>
        <p className="text-lg">You have mastered all the cards in this selection.</p>
        <button 
          onClick={() => { setDrillOnly(false); handleFilterChange('all'); }}
          className="mt-8 px-8 py-3 rounded-2xl bg-zinc-100 text-zinc-950 font-bold hover:bg-white transition-all active:scale-95"
        >
          Show All Cards
        </button>
        <button 
          onClick={resetMastered}
          className="mt-4 text-sm text-zinc-500 hover:text-red-400 transition-colors"
        >
          Reset Mastered Stats
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-md z-10 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-zinc-100 tracking-tighter">ilo Peli</h1>
              <button
                onClick={() => setShowAbout(true)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-500 hover:text-zinc-200 border border-zinc-800"
                title="About ilo Peli"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
              <button
                onClick={() => setShowOptions(true)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-500 hover:text-zinc-200 border border-zinc-800"
                title="Options"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
              <div className="hidden md:flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-900 text-zinc-500 border border-zinc-800 uppercase tracking-wider">
                {masteredCount} / {filteredWords.length} mastered
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleDrillToggle}
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
                  onClick={undoMastered}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-zinc-900 text-zinc-300 hover:text-zinc-100 border border-zinc-800"
                  title="Undo last master (Z)"
                >
                  UNDO
                </button>
              )}
              <button
                onClick={resetMastered}
                className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-zinc-900 text-red-500/80 hover:text-red-400 border border-zinc-800"
              >
                RESET
              </button>
              <button
                onClick={() => setShowDrillInfo(true)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-500 hover:text-zinc-200 border border-zinc-800"
                title="What is Drill Mode?"
              >
                ?
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleFilterChange(cat)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-colors ${
                  filter === cat 
                    ? 'bg-zinc-100 text-zinc-950' 
                    : 'bg-zinc-900 text-zinc-500 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {showDrillInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button 
              onClick={() => setShowDrillInfo(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-bold text-zinc-100 mb-4">About Drill Mode</h2>
            <div className="space-y-4 text-zinc-400 leading-relaxed text-sm sm:text-base">
              <p>
                <strong className="text-amber-500">Drill Mode</strong> helps you focus on words you haven't mastered yet.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Mark cards as <strong className="text-zinc-100">Mastered (M)</strong> to hide them.</li>
                <li>The deck <strong className="text-zinc-100">shuffles automatically</strong> when you complete a pass.</li>
                <li>Track your progress per category in the header.</li>
                <li>Use <strong className="text-zinc-100">Undo (Z)</strong> if you misclick.</li>
              </ul>
              <p className="text-sm italic">
                Stats are reset automatically when you switch categories to give you a fresh start.
              </p>
            </div>
            <button 
              onClick={() => setShowDrillInfo(false)}
              className="mt-8 w-full py-3 rounded-2xl bg-zinc-100 text-zinc-950 font-bold hover:bg-white transition-all active:scale-95"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {showOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowOptions(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-bold text-zinc-100 mb-6">Options</h2>
            
            <div className="space-y-6">
              {/* Speaker Selection */}
              <div>
                <h3 className="text-lg font-bold text-zinc-100 mb-3">Audio Speaker</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      checked={speakerMode === 'random'}
                      onChange={() => setSpeakerMode('random')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-zinc-200">Random - Pick a random speaker each time</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      checked={speakerMode === 'alternating'}
                      onChange={() => setSpeakerMode('alternating')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-zinc-200">Alternating - Cycle through different speakers</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      checked={speakerMode === 'specific'}
                      onChange={() => setSpeakerMode('specific')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-zinc-200">Specific Speaker</span>
                  </label>
                </div>
                
                {speakerMode === 'specific' && uniqueSpeakers.length > 0 && (
                  <div className="mt-4">
                    <select
                      value={specificSpeaker}
                      onChange={(e) => setSpecificSpeaker(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-zinc-800 text-zinc-100 border border-zinc-700 focus:outline-none focus:border-zinc-500 text-sm"
                    >
                      <option value="">Select a speaker...</option>
                      {uniqueSpeakers.map(speaker => (
                        <option key={speaker} value={speaker}>{speaker}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Shuffle on Category Change */}
              <div className="border-t border-zinc-700 pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleOnCategoryChange}
                    onChange={(e) => setShuffleOnCategoryChange(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-zinc-100">Shuffle on Category Change</span>
                    <p className="text-xs text-zinc-500 mt-1">Automatically shuffle cards when switching categories</p>
                  </div>
                </label>
              </div>

              {/* Disable Animations */}
              <div className="border-t border-zinc-700 pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={disableAnimations}
                    onChange={(e) => setDisableAnimations(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-zinc-100">Instant Flip</span>
                    <p className="text-xs text-zinc-500 mt-1">Disable card flip animation</p>
                  </div>
                </label>
              </div>

              {/* Exclude kijetesantakalu */}
              <div className="border-t border-zinc-700 pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeKijetesantakalu}
                    onChange={(e) => setExcludeKijetesantakalu(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-zinc-100">Exclude kijetesantakalu</span>
                    <p className="text-xs text-zinc-500 mt-1">Hide the April Fools word</p>
                  </div>
                </label>
              </div>
            </div>

            <button 
              onClick={() => setShowOptions(false)}
              className="mt-8 w-full py-3 rounded-2xl bg-zinc-100 text-zinc-950 font-bold hover:bg-white transition-all active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button 
              onClick={() => setShowAbout(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="mb-6">
              <h2 className="text-3xl font-black text-zinc-100 tracking-tighter">ilo Peli</h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Study Tool for Toki Pona</p>
            </div>
            <div className="space-y-4 text-zinc-400 leading-relaxed text-sm sm:text-base">
              <p>
                toki! mi ilo Peli.
              </p>
              <p>
                I'm learning Toki Pona and wanted to combine high-quality community resources into a minimal flashcard app.
              </p>
              
              <div className="pt-6 border-t border-zinc-800 mt-6">
                <h3 className="text-zinc-100 font-bold mb-3 uppercase text-[10px] tracking-[0.2em]">Sources & Citations</h3>
                <ul className="space-y-3">
                  <li className="flex flex-col">
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider mb-1">Semantic Spaces</span>
                    <a href="https://lipamanka.gay/essays/dictionary" target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white underline decoration-zinc-700 underline-offset-4 transition-all">
                      lipamanka.gay/essays/dictionary
                    </a>
                  </li>
                  <li className="flex flex-col">
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider mb-1">Word Definitions & Metadata</span>
                    <a href="https://github.com/lipu-linku/sona" target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white underline decoration-zinc-700 underline-offset-4 transition-all">
                      github.com/lipu-linku/sona
                    </a>
                  </li>
                  <li className="flex flex-col">
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider mb-1">Ku Translations</span>
                    <a href="https://tokipona.org/nimi_pu.txt" target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white underline decoration-zinc-700 underline-offset-4 transition-all">
                      tokipona.org/nimi_pu.txt
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <button 
              onClick={() => setShowAbout(false)}
              className="mt-8 w-full py-3 rounded-2xl bg-zinc-100 text-zinc-950 font-bold hover:bg-white transition-all active:scale-95"
            >
              pona!
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-8 pt-32 sm:pt-28">
        <div className="w-full max-w-6xl flex flex-col items-center gap-6">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 w-full">
            <div className="w-full max-w-2xl flex flex-col items-center">
              <main className="w-full flex flex-col items-center gap-6">
                <div 
                  onClick={toggleFlip}
                  className="relative w-full aspect-4/3 sm:aspect-video perspective-1000 cursor-pointer group"
                >
                  <div className={`relative w-full h-full transition-transform ${disableAnimations ? 'duration-0' : 'duration-500'} transform-style-3d will-change-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-zinc-900 border-2 border-zinc-800 rounded-3xl flex flex-col items-center justify-center p-6 sm:p-8 shadow-2xl overflow-hidden">
                      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleMastered(currentWord.id); }}
                          className={`p-2.5 sm:p-3 rounded-2xl transition-all ${
                            masteredIds.has(currentWord.id)
                              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50'
                              : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 hover:border-zinc-500'
                          }`}
                          title="Mark as Mastered (M)"
                        >
                          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={masteredIds.has(currentWord.id) ? 3 : 2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      </div>
                      <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-zinc-50 text-center wrap-break-word px-4">
                        {currentWord.word}
                      </h1>
                      <div className="mt-4 flex flex-col items-center gap-2">
                        <p className="text-zinc-500 font-mono text-[10px] sm:text-xs tracking-[0.2em] uppercase">
                          {currentWord.usage}
                        </p>
                        {currentWord.audio && currentWord.audio.length > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); playAudio(currentWord); }}
                            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                            title="Play Pronunciation (A)"
                          >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Back */}
                    <div ref={backFaceRef} className="absolute inset-0 backface-hidden rotate-y-180 bg-zinc-900 border-2 border-zinc-800 rounded-3xl flex flex-col p-6 sm:p-10 shadow-2xl overflow-y-auto">
                      <div className="mb-4 sm:mb-6">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-4">
                          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 flex items-center gap-3">
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
                                onClick={(e) => { e.stopPropagation(); playAudio(backWord); }}
                                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                                title="Play Pronunciation (A)"
                              >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleMastered(backWord.id); }}
                              className={`p-2 rounded-xl transition-all ${
                                masteredIds.has(backWord.id)
                                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50'
                                  : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 hover:border-zinc-500'
                              }`}
                              title="Mark as Mastered (M)"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={masteredIds.has(backWord.id) ? 3 : 2} d="M5 13l4 4L19 7" />
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
                          <h3 className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest mb-1">Definition</h3>
                          <div className="text-sm sm:text-base leading-relaxed text-zinc-200 space-y-2">
                            {backWord.pos && backWord.pos.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {backWord.pos.map((p, i) => (
                                  <span key={i} className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded text-[10px] font-bold tracking-wider uppercase">
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
                            <h3 className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest mb-1">Common Translations (ku)</h3>
                            <div className="text-sm text-zinc-400 leading-relaxed italic flex flex-wrap gap-2">
                              {backWord.translations.ku.split(', ').slice(0, 10).map((translation, idx) => (
                                <span key={idx}>
                                  {translation}
                                  {backWord.usage_percentages && backWord.usage_percentages[translation] && (
                                    <sup className="text-[10px] ml-0.5">{backWord.usage_percentages[translation]}</sup>
                                  )}
                                </span>
                              ))}
                            </div>
                          </section>
                        )}

                        {backWord.semantic_space && (
                          <section>
                            <h3 className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest mb-1">Semantic Space</h3>
                            <div className="text-sm sm:text-base leading-relaxed text-zinc-400 space-y-3">
                              {backWord.semantic_space.split('\n\n').map((p, i) => (
                                <p key={i}>
                                  {p.split(/(\*\*[^*]+\*\*)/g).map((part, j) => 
                                    part.startsWith('**') && part.endsWith('**') 
                                      ? <strong key={j} className="text-zinc-200 font-semibold">{part.slice(2, -2)}</strong>
                                      : part
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

                <div className="md:hidden flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-900 text-zinc-500 border border-zinc-800 uppercase tracking-wider">
                  {masteredCount} / {filteredWords.length} mastered
                </div>

                <div className="flex flex-col items-center gap-4 w-full px-2">
                  <div className="flex items-center gap-4 text-zinc-500 text-sm font-mono">
                    <span>{index + 1} / {displayWords.length}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 w-full">
                    {/* Primary navigation */}
                    <div className="flex items-center gap-2 sm:gap-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); prevCard(); }}
                        className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-all active:scale-95"
                        title="Previous (Left Arrow)"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFlip(); }}
                        className="px-8 py-4 rounded-2xl bg-zinc-100 text-zinc-950 font-bold hover:bg-white transition-all active:scale-95 min-w-30"
                      >
                        FLIP
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); nextCard(); }}
                        className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-all active:scale-95"
                        title="Next (Right Arrow)"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>

                    {/* Secondary tools */}
                    <div className="flex items-center gap-2 sm:gap-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); shuffleCard(); }}
                        className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-all active:scale-95"
                        title="Shuffle (S)"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowVowelKey(!showVowelKey); }}
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
                    <p>Space: Flip &bull; Arrows: Navigate &bull; S: Shuffle &bull; A: Audio &bull; V: Vowels</p>
                    <p>M: Master &bull; D: Drill &bull; Z: Undo</p>
                  </div>
                </div>
              </main>
            </div>

            {showVowelKey && (
              <aside className="w-full lg:w-72 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 shrink-0 max-h-125 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-zinc-50">Vowel Key</h3>
                  <button 
                    onClick={() => setShowVowelKey(false)}
                    className="lg:hidden p-2 text-zinc-500 hover:text-zinc-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { vowel: 'a', pronunciation: 'ah', examples: "like 'spa' and 'haha'" },
                    { vowel: 'e', pronunciation: 'eh', examples: "like 'let' and 'mess'" },
                    { vowel: 'i', pronunciation: 'ee', examples: "like 'key' and 'seem'" },
                    { vowel: 'o', pronunciation: 'oh', examples: "like 'toe' and 'know'" },
                    { vowel: 'u', pronunciation: 'oo', examples: "like 'tooth' and 'mood'" },
                  ].map((item) => (
                    <div key={item.vowel} className="flex items-start gap-3 pb-3 border-b border-zinc-800 last:border-0 last:pb-0">
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
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg) translateZ(0); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .will-change-transform { will-change: transform; }
      `}</style>
    </div>
  )
}

export default App
