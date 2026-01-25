import { useState, useEffect, useMemo, useCallback } from 'react';
import wordData from './data.json';
import { Card } from './components/Card';
import { Controls } from './components/Controls';
import { Header } from './components/Header';
import { Modals } from './components/Modals';
import { VowelKey } from './components/VowelKey';
import { EmptyState } from './components/EmptyState';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';
import { useCardState } from './hooks/useCardState';
import { useMasteredCards } from './hooks/useMasteredCards';
import { useSettings } from './hooks/useSettings';
import type { Word } from './types';

function App() {
  const cardState = useCardState();
  const {
    masteredIds,
    lastMasteredCard,
    toggleMastered,
    undoMastered,
    clearLastMastered,
    resetMastered,
    unmasterCard,
  } = useMasteredCards();
  const settings = useSettings();

  const [showVowelKey, setShowVowelKey] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showDrillInfo, setShowDrillInfo] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showMasteredCards, setShowMasteredCards] = useState(false);

  const masteredCount = useMemo(() => {
    return cardState.filteredWords.filter((w) => masteredIds.has(w.id)).length;
  }, [cardState.filteredWords, masteredIds]);

  const masteredWords = useMemo(() => {
    return cardState.filteredWords.filter((w) => masteredIds.has(w.id));
  }, [cardState.filteredWords, masteredIds]);

  // Recalculate display words with drill
  const displayWords = useMemo(() => {
    let words =
      cardState.words.length > 0 ? cardState.words : cardState.filteredWords;
    if (cardState.drillOnly) {
      words = words.filter((w) => !masteredIds.has(w.id));
    }
    return words;
  }, [
    cardState.words,
    cardState.filteredWords,
    cardState.drillOnly,
    masteredIds,
  ]);

  // Ensure index is in bounds for displayWords
  const safeIndex =
    displayWords.length > 0 && cardState.index < displayWords.length
      ? cardState.index
      : 0;
  const currentWord = displayWords[safeIndex];

  const playAudio = useCallback(
    (word: Word) => {
      if (!word?.audio || word.audio.length === 0) return;

      let audioObj = word.audio[0];

      if (settings.speakerMode === 'random') {
        audioObj = word.audio[Math.floor(Math.random() * word.audio.length)];
      } else if (settings.speakerMode === 'alternating') {
        const speakers = Array.from(new Set(word.audio.map((a) => a.author)));
        if (speakers.length > 1) {
          const nextSpeaker = speakers.find(
            (s) => s !== settings.lastUsedSpeaker
          );
          if (nextSpeaker) {
            const optionsFromSpeaker = word.audio.filter(
              (a) => a.author === nextSpeaker
            );
            audioObj =
              optionsFromSpeaker[
                Math.floor(Math.random() * optionsFromSpeaker.length)
              ];
            settings.setLastUsedSpeaker(nextSpeaker);
          } else {
            audioObj =
              word.audio[Math.floor(Math.random() * word.audio.length)];
          }
        }
      } else if (
        settings.speakerMode === 'specific' &&
        settings.specificSpeaker
      ) {
        const optionsFromSpeaker = word.audio.filter(
          (a) => a.author === settings.specificSpeaker
        );
        if (optionsFromSpeaker.length > 0) {
          audioObj =
            optionsFromSpeaker[
              Math.floor(Math.random() * optionsFromSpeaker.length)
            ];
        } else {
          audioObj = word.audio[Math.floor(Math.random() * word.audio.length)];
        }
      }

      const audio = new Audio(audioObj.link);
      audio.volume = settings.audioVolume;
      audio.play().catch((err) => console.error('Audio playback failed:', err));
    },
    [settings]
  );

  const handleDrillToggle = useCallback(() => {
    cardState.setDrillOnly((prev) => !prev);
    cardState.setIndex(0);
    cardState.setIsFlipped(false);
  }, [cardState]);

  const handleNextCard = useCallback(() => {
    const nextWord = displayWords[(safeIndex + 1) % displayWords.length];
    cardState.nextCard();
    if (settings.autoPlayAudioOnNavigation && nextWord) {
      setTimeout(() => playAudio(nextWord), 0);
    }
  }, [
    cardState,
    displayWords,
    safeIndex,
    settings.autoPlayAudioOnNavigation,
    playAudio,
  ]);

  const handlePrevCard = useCallback(() => {
    const prevIndex =
      (safeIndex - 1 + displayWords.length) % displayWords.length;
    const prevWord = displayWords[prevIndex];
    cardState.prevCard();
    if (settings.autoPlayAudioOnNavigation && prevWord) {
      setTimeout(() => playAudio(prevWord), 0);
    }
  }, [
    cardState,
    displayWords,
    safeIndex,
    settings.autoPlayAudioOnNavigation,
    playAudio,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentWord) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        cardState.toggleFlip();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyL') {
        e.preventDefault();
        handleNextCard();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyH') {
        e.preventDefault();
        handlePrevCard();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyJ') {
        e.preventDefault();
        const backCard = document.querySelector(
          '[data-card-back]'
        ) as HTMLElement;
        if (backCard && cardState.isFlipped) {
          backCard.scrollBy({ top: 50, behavior: 'smooth' });
        }
      } else if (e.code === 'ArrowUp' || e.code === 'KeyK') {
        e.preventDefault();
        const backCard = document.querySelector(
          '[data-card-back]'
        ) as HTMLElement;
        if (backCard && cardState.isFlipped) {
          backCard.scrollBy({ top: -50, behavior: 'smooth' });
        }
      } else if (e.code === 'KeyS') {
        cardState.shuffleCard();
      } else if (e.code === 'KeyA') {
        e.preventDefault();
        playAudio(currentWord);
      } else if (e.code === 'KeyM') {
        if (cardState.drillOnly) {
          cardState.setIsFlipped(false);
          // Delay progression until animation completes (600ms)
          setTimeout(() => {
            toggleMastered(
              currentWord.id,
              safeIndex,
              cardState.activeCategories
            );
            cardState.nextCard();
          }, 600);
        } else {
          // In normal mode, delay mastery toggle but don't progress
          setTimeout(() => {
            toggleMastered(
              currentWord.id,
              safeIndex,
              cardState.activeCategories
            );
          }, 600);
        }
      } else if (e.code === 'KeyD') {
        handleDrillToggle();
      } else if (e.code === 'KeyV') {
        setShowVowelKey((prev) => !prev);
      } else if (e.code === 'KeyZ') {
        const result = undoMastered(cardState.activeCategories);
        if (result.success && result.position !== null) {
          cardState.setIndex(result.position);
          cardState.setIsFlipped(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    cardState,
    currentWord,
    playAudio,
    toggleMastered,
    undoMastered,
    handleDrillToggle,
    handleNextCard,
    handlePrevCard,
    safeIndex,
  ]);

  const uniqueSpeakers = useMemo(() => {
    const speakers = new Set<string>();
    (wordData as Word[]).forEach((word) => {
      if (word.audio) {
        word.audio.forEach((a) => speakers.add(a.author));
      }
    });
    return Array.from(speakers).sort();
  }, []);

  const categoryOrder = ['core', 'common', 'uncommon', 'obscure'];
  const allUsages = Array.from(
    new Set((wordData as Word[]).map((w) => w.usage_category))
  ).filter(Boolean);
  const specificCategories = categoryOrder.filter((cat) =>
    allUsages.includes(cat)
  );

  const handleCategoryToggle = useCallback(
    (category: string) => {
      clearLastMastered();
      const newActiveCategories = new Set(cardState.activeCategories);
      if (newActiveCategories.has(category)) {
        newActiveCategories.delete(category);
      } else {
        newActiveCategories.add(category);
      }
      cardState.setActiveCategories(newActiveCategories);
      cardState.setIndex(0);
      cardState.setIsFlipped(false);

      if (settings.shuffleOnCategoryChange) {
        let baseWords = wordData as Word[];
        if (newActiveCategories.size > 0) {
          baseWords = baseWords.filter((w) =>
            newActiveCategories.has(w.usage_category)
          );
        }
        const shuffled = [...baseWords].sort(() => Math.random() - 0.5);
        cardState.setWords(shuffled);
      } else {
        cardState.setWords([]);
      }
    },
    [cardState, settings.shuffleOnCategoryChange, clearLastMastered]
  );

  const handleToggleAll = useCallback(() => {
    clearLastMastered();
    const isAllSelected =
      cardState.activeCategories.size === specificCategories.length;

    // If all are already selected, do nothing
    if (isAllSelected) {
      return;
    }

    // Otherwise, select all categories
    const newActiveCategories = new Set(specificCategories);
    cardState.setActiveCategories(newActiveCategories);
    cardState.setIndex(0);
    cardState.setIsFlipped(false);

    if (settings.shuffleOnCategoryChange) {
      let baseWords = wordData as Word[];
      if (newActiveCategories.size > 0) {
        baseWords = baseWords.filter((w) =>
          newActiveCategories.has(w.usage_category)
        );
      }
      const shuffled = [...baseWords].sort(() => Math.random() - 0.5);
      cardState.setWords(shuffled);
    } else {
      cardState.setWords([]);
    }
  }, [
    cardState,
    specificCategories,
    settings.shuffleOnCategoryChange,
    clearLastMastered,
  ]);

  if (cardState.activeCategories.size === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header
          specificCategories={specificCategories}
          activeCategories={cardState.activeCategories}
          onCategoryToggle={handleCategoryToggle}
          onToggleAll={handleToggleAll}
          drillOnly={cardState.drillOnly}
          onDrillToggle={handleDrillToggle}
          lastMasteredCard={lastMasteredCard}
          onUndo={() => {
            const result = undoMastered(cardState.activeCategories);
            if (result.success && result.position !== null) {
              cardState.setIndex(result.position);
              cardState.setIsFlipped(false);
            }
          }}
          onShowDrillInfo={() => setShowDrillInfo(true)}
          onShowAbout={() => setShowAbout(true)}
          onShowOptions={() => setShowOptions(true)}
          onShowMasteredCards={() => setShowMasteredCards(true)}
          masteredCount={masteredCount}
          filteredWordsCount={cardState.filteredWords.length}
        />
        <Modals
          showAbout={showAbout}
          onCloseAbout={() => setShowAbout(false)}
          showOptions={showOptions}
          onCloseOptions={() => setShowOptions(false)}
          showDrillInfo={showDrillInfo}
          onCloseDrillInfo={() => setShowDrillInfo(false)}
          showMasteredCards={showMasteredCards}
          onCloseMasteredCards={() => setShowMasteredCards(false)}
          masteredWords={masteredWords}
          masteredCount={masteredCount}
          filteredWordsCount={cardState.filteredWords.length}
          onUnmasterCard={(id: string) => {
            const word = (wordData as Word[]).find((w) => w.id === id);
            if (word) {
              if (
                cardState.words.length > 0 &&
                (cardState.activeCategories.size === 0 ||
                  cardState.activeCategories.has(word.usage_category))
              ) {
                cardState.addCardToEndOfDeck(word);
              }
            }
            unmasterCard(id);
          }}
          onUnmasterAll={resetMastered}
          speakerMode={settings.speakerMode}
          onSpeakerModeChange={settings.setSpeakerMode}
          specificSpeaker={settings.specificSpeaker}
          onSpecificSpeakerChange={settings.setSpecificSpeaker}
          uniqueSpeakers={uniqueSpeakers}
          shuffleOnCategoryChange={settings.shuffleOnCategoryChange}
          onShuffleOnCategoryChangeChange={settings.setShuffleOnCategoryChange}
          autoPlayAudioOnNavigation={settings.autoPlayAudioOnNavigation}
          onAutoPlayAudioOnNavigationChange={
            settings.setAutoPlayAudioOnNavigation
          }
          useSitelen={settings.useSitelen}
          onUseSitelenChange={settings.setUseSitelen}
          audioVolume={settings.audioVolume}
          onAudioVolumeChange={settings.setAudioVolume}
        />
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-zinc-400 text-lg">
            Select a category to start studying.
          </p>
        </div>
        {showVowelKey && <VowelKey onClose={() => setShowVowelKey(false)} />}
        <ToastContainer />
        <Footer />
      </div>
    );
  }

  if (displayWords.length === 0 || !currentWord) {
    return <EmptyState onShowAll={handleToggleAll} onReset={resetMastered} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        specificCategories={specificCategories}
        activeCategories={cardState.activeCategories}
        onCategoryToggle={handleCategoryToggle}
        onToggleAll={handleToggleAll}
        drillOnly={cardState.drillOnly}
        onDrillToggle={handleDrillToggle}
        lastMasteredCard={lastMasteredCard}
        onUndo={() => {
          const result = undoMastered(cardState.activeCategories);
          if (result.success && result.position !== null) {
            cardState.setIndex(result.position);
            cardState.setIsFlipped(false);
          }
        }}
        onShowDrillInfo={() => setShowDrillInfo(true)}
        onShowAbout={() => setShowAbout(true)}
        onShowOptions={() => setShowOptions(true)}
        onShowMasteredCards={() => setShowMasteredCards(true)}
        masteredCount={masteredCount}
        filteredWordsCount={cardState.filteredWords.length}
      />

      <Modals
        showAbout={showAbout}
        onCloseAbout={() => setShowAbout(false)}
        showOptions={showOptions}
        onCloseOptions={() => setShowOptions(false)}
        showDrillInfo={showDrillInfo}
        onCloseDrillInfo={() => setShowDrillInfo(false)}
        showMasteredCards={showMasteredCards}
        onCloseMasteredCards={() => setShowMasteredCards(false)}
        masteredWords={masteredWords}
        masteredCount={masteredCount}
        filteredWordsCount={cardState.filteredWords.length}
        onUnmasterCard={(id: string) => {
          const word = (wordData as Word[]).find((w) => w.id === id);
          if (word) {
            // Only add back to deck if it matches current filter AND we're using a shuffled deck
            if (
              cardState.words.length > 0 &&
              (cardState.activeCategories.size === 0 ||
                cardState.activeCategories.has(word.usage_category))
            ) {
              cardState.addCardToEndOfDeck(word);
            }
          }
          unmasterCard(id);
        }}
        onUnmasterAll={resetMastered}
        speakerMode={settings.speakerMode}
        onSpeakerModeChange={settings.setSpeakerMode}
        specificSpeaker={settings.specificSpeaker}
        onSpecificSpeakerChange={settings.setSpecificSpeaker}
        uniqueSpeakers={uniqueSpeakers}
        shuffleOnCategoryChange={settings.shuffleOnCategoryChange}
        onShuffleOnCategoryChangeChange={settings.setShuffleOnCategoryChange}
        autoPlayAudioOnNavigation={settings.autoPlayAudioOnNavigation}
        onAutoPlayAudioOnNavigationChange={
          settings.setAutoPlayAudioOnNavigation
        }
        useSitelen={settings.useSitelen}
        onUseSitelenChange={settings.setUseSitelen}
        audioVolume={settings.audioVolume}
        onAudioVolumeChange={settings.setAudioVolume}
      />

      <ToastContainer />

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
                    toggleMastered(id, safeIndex, cardState.activeCategories);
                  }}
                  onPlayAudio={playAudio}
                  drillOnly={cardState.drillOnly}
                  onProgressCard={cardState.nextCard}
                  useSitelen={settings.useSitelen}
                />

                <div className="md:hidden flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-900 text-zinc-500 border border-zinc-800 uppercase tracking-wider">
                  {masteredCount} / {cardState.filteredWords.length} mastered
                </div>

                <Controls
                  index={safeIndex}
                  total={displayWords.length}
                  onFlip={cardState.toggleFlip}
                  onPrev={handlePrevCard}
                  onNext={handleNextCard}
                  onShuffle={cardState.shuffleCard}
                  showVowelKey={showVowelKey}
                  onToggleVowelKey={() => setShowVowelKey(!showVowelKey)}
                />
              </main>
            </div>

            {showVowelKey && (
              <VowelKey onClose={() => setShowVowelKey(false)} />
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

      <Footer />
    </div>
  );
}

export default App;
