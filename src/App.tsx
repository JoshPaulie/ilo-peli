import { useState, useEffect, useMemo, useCallback } from 'react'
import wordData from './data.json'
import { Card } from './components/Card'
import { Controls } from './components/Controls'
import { Header } from './components/Header'
import { Modals } from './components/Modals'
import { VowelKey } from './components/VowelKey'
import { EmptyState } from './components/EmptyState'
import { useCardState } from './hooks/useCardState'
import { useMasteredCards } from './hooks/useMasteredCards'
import { useSettings } from './hooks/useSettings'
import type { Word } from './types'

function App() {
  const cardState = useCardState()
  const { masteredIds, lastMasteredId, toggleMastered, undoMastered, resetMastered, setMasteredIds } =
    useMasteredCards()
  const settings = useSettings()

  const [showVowelKey, setShowVowelKey] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showDrillInfo, setShowDrillInfo] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const masteredCount = useMemo(() => {
    return cardState.filteredWords.filter(w => masteredIds.has(w.id)).length
  }, [cardState.filteredWords, masteredIds])

  // Apply exclusion filter
  const filteredWordsWithExclusion = useMemo(() => {
    let words = cardState.filteredWords
    if (settings.excludeKijetesantakalu) {
      words = words.filter(w => w.id !== 'kijetesantakalu')
    }
    return words
  }, [cardState.filteredWords, settings.excludeKijetesantakalu])

  // Recalculate display words with drill and exclusion
  const displayWords = useMemo(() => {
    let words = cardState.words.length > 0 ? cardState.words : filteredWordsWithExclusion
    if (cardState.drillOnly) {
      words = words.filter(w => !masteredIds.has(w.id))
    }
    return words
  }, [cardState.words, filteredWordsWithExclusion, cardState.drillOnly, masteredIds])

  // Ensure index is in bounds for displayWords
  const safeIndex = displayWords.length > 0 && cardState.index < displayWords.length ? cardState.index : 0
  const currentWord = displayWords[safeIndex]

  const playAudio = useCallback(
    (word: Word) => {
      if (!word?.audio || word.audio.length === 0) return

      let audioObj = word.audio[0]

      if (settings.speakerMode === 'random') {
        audioObj = word.audio[Math.floor(Math.random() * word.audio.length)]
      } else if (settings.speakerMode === 'alternating') {
        const speakers = Array.from(new Set(word.audio.map(a => a.author)))
        if (speakers.length > 1) {
          const nextSpeaker = speakers.find(s => s !== settings.lastUsedSpeaker)
          if (nextSpeaker) {
            const optionsFromSpeaker = word.audio.filter(a => a.author === nextSpeaker)
            audioObj =
              optionsFromSpeaker[Math.floor(Math.random() * optionsFromSpeaker.length)]
            settings.setLastUsedSpeaker(nextSpeaker)
          } else {
            audioObj = word.audio[Math.floor(Math.random() * word.audio.length)]
          }
        }
      } else if (settings.speakerMode === 'specific' && settings.specificSpeaker) {
        const optionsFromSpeaker = word.audio.filter(a => a.author === settings.specificSpeaker)
        if (optionsFromSpeaker.length > 0) {
          audioObj = optionsFromSpeaker[Math.floor(Math.random() * optionsFromSpeaker.length)]
        } else {
          audioObj = word.audio[Math.floor(Math.random() * word.audio.length)]
        }
      }

      const audio = new Audio(audioObj.link)
      audio.play().catch(err => console.error('Audio playback failed:', err))
    },
    [settings]
  )

  const handleDrillToggle = useCallback(() => {
    cardState.setDrillOnly(prev => !prev)
    cardState.setIndex(0)
    cardState.setIsFlipped(false)
    cardState.setWords([])
  }, [cardState])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentWord) return
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        cardState.toggleFlip()
      } else if (e.code === 'ArrowRight' || e.code === 'KeyL') {
        e.preventDefault()
        cardState.nextCard()
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyH') {
        e.preventDefault()
        cardState.prevCard()
      } else if (e.code === 'KeyS') {
        cardState.shuffleCard()
      } else if (e.code === 'KeyA') {
        e.preventDefault()
        playAudio(currentWord)
      } else if (e.code === 'KeyM') {
        toggleMastered(currentWord.id)
        if (cardState.drillOnly) {
          cardState.setIsFlipped(false)
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
  }, [cardState, currentWord, playAudio, toggleMastered, undoMastered, handleDrillToggle])

  const uniqueSpeakers = useMemo(() => {
    const speakers = new Set<string>()
    ;(wordData as Word[]).forEach(word => {
      if (word.audio) {
        word.audio.forEach(a => speakers.add(a.author))
      }
    })
    return Array.from(speakers).sort()
  }, [])

  const allUsages = Array.from(new Set((wordData as Word[]).map(w => w.usage))).filter(Boolean)
  const categories = ['all', 'nouns', ...allUsages.filter(u => u !== 'obscure'), ...allUsages.filter(u => u === 'obscure')]

  const handleFilterChange = useCallback(
    (newFilter: string) => {
      cardState.setFilter(newFilter)
      cardState.setIndex(0)
      cardState.setIsFlipped(false)
      setMasteredIds(new Set())

      if (settings.shuffleOnCategoryChange) {
        let baseWords = wordData as Word[]
        if (newFilter === 'nouns') {
          baseWords = baseWords.filter(w => w.pos?.includes('NOUN'))
        } else if (newFilter !== 'all') {
          baseWords = baseWords.filter(w => w.usage === newFilter)
        }
        const shuffled = [...baseWords].sort(() => Math.random() - 0.5)
        cardState.setWords(shuffled)
      } else {
        cardState.setWords([])
      }
    },
    [cardState, settings.shuffleOnCategoryChange, setMasteredIds]
  )

  if (displayWords.length === 0 || !currentWord) {
    return (
      <EmptyState
        onShowAll={() => {
          cardState.setDrillOnly(false)
          handleFilterChange('all')
        }}
        onReset={resetMastered}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        categories={categories}
        currentFilter={cardState.filter}
        onFilterChange={handleFilterChange}
        drillOnly={cardState.drillOnly}
        onDrillToggle={handleDrillToggle}
        lastMasteredId={lastMasteredId}
        onUndo={undoMastered}
        onReset={resetMastered}
        onShowDrillInfo={() => setShowDrillInfo(true)}
        onShowAbout={() => setShowAbout(true)}
        onShowOptions={() => setShowOptions(true)}
        masteredCount={masteredCount}
        filteredWordsCount={filteredWordsWithExclusion.length}
      />

      <Modals
        showAbout={showAbout}
        onCloseAbout={() => setShowAbout(false)}
        showOptions={showOptions}
        onCloseOptions={() => setShowOptions(false)}
        showDrillInfo={showDrillInfo}
        onCloseDrillInfo={() => setShowDrillInfo(false)}
        speakerMode={settings.speakerMode}
        onSpeakerModeChange={settings.setSpeakerMode}
        specificSpeaker={settings.specificSpeaker}
        onSpecificSpeakerChange={settings.setSpecificSpeaker}
        uniqueSpeakers={uniqueSpeakers}
        shuffleOnCategoryChange={settings.shuffleOnCategoryChange}
        onShuffleOnCategoryChangeChange={settings.setShuffleOnCategoryChange}
        disableAnimations={settings.disableAnimations}
        onDisableAnimationsChange={settings.setDisableAnimations}
        excludeKijetesantakalu={settings.excludeKijetesantakalu}
        onExcludeKijetesantakakuChange={settings.setExcludeKijetesantakalu}
      />

      <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-8 pt-32 sm:pt-28">
        <div className="w-full max-w-6xl flex flex-col items-center gap-6">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 w-full">
            <div className="w-full max-w-2xl flex flex-col items-center">
              <main className="w-full flex flex-col items-center gap-6">
                <Card
                  currentWord={currentWord}
                  backWord={currentWord}
                  isFlipped={cardState.isFlipped}
                  onFlip={cardState.toggleFlip}
                  masteredIds={masteredIds}
                  onToggleMastered={(id) => {
                    toggleMastered(id)
                    if (cardState.drillOnly) {
                      cardState.setIsFlipped(false)
                    }
                  }}
                  onPlayAudio={playAudio}
                  disableAnimations={settings.disableAnimations}
                />

                <div className="md:hidden flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-900 text-zinc-500 border border-zinc-800 uppercase tracking-wider">
                  {masteredCount} / {filteredWordsWithExclusion.length} mastered
                </div>

                <Controls
                  index={safeIndex}
                  total={displayWords.length}
                  onFlip={cardState.toggleFlip}
                  onPrev={cardState.prevCard}
                  onNext={cardState.nextCard}
                  onShuffle={cardState.shuffleCard}
                  showVowelKey={showVowelKey}
                  onToggleVowelKey={() => setShowVowelKey(!showVowelKey)}
                />
              </main>
            </div>

            {showVowelKey && <VowelKey onClose={() => setShowVowelKey(false)} />}
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
