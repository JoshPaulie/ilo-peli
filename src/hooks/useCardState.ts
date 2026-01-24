import { useState, useMemo, useCallback } from 'react';
import wordData from '../data.json';
import type { Word } from '../types';
import { usePersistence } from './usePersistence';

export function useCardState() {
  const [index, setIndex] = useState<number>(() => {
    const saved = localStorage.getItem('cardIndex');
    if (saved) {
      const parsed = parseInt(saved, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  });

  const [isFlipped, setIsFlipped] = useState(false);

  const [activeCategories, setActiveCategories] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('activeCategories');
    if (saved) {
      try {
        return new Set(JSON.parse(saved) as string[]);
      } catch {
        return new Set(['core', 'common']);
      }
    }
    return new Set(['core', 'common']);
  });

  const [words, setWords] = useState<Word[]>(() => {
    const saved = localStorage.getItem('cardDeckOrder');
    if (saved) {
      try {
        const wordIds = JSON.parse(saved) as string[];
        return wordIds
          .map((id) => (wordData as Word[]).find((w) => w.id === id))
          .filter((w): w is Word => w !== undefined);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [drillOnly, setDrillOnly] = useState<boolean>(() => {
    const saved = localStorage.getItem('drillOnly');
    return saved ? JSON.parse(saved) : false;
  });

  usePersistence('cardIndex', index);
  usePersistence('activeCategories', Array.from(activeCategories));
  usePersistence(
    'cardDeckOrder',
    words.map((w) => w.id)
  );
  usePersistence('drillOnly', drillOnly);

  const filteredWords = useMemo(() => {
    let baseWords = wordData as Word[];
    if (activeCategories.size > 0) {
      baseWords = baseWords.filter((w) =>
        activeCategories.has(w.usage_category)
      );
    }
    return baseWords;
  }, [activeCategories]);

  // Use shuffled words if available, otherwise use filtered words
  const baseList = words.length > 0 ? words : filteredWords;
  const displayWords = baseList;

  // Ensure index is in bounds when displayWords changes
  const safeIndex =
    displayWords.length > 0 && index < displayWords.length ? index : 0;

  const currentWord: Word | undefined = displayWords[safeIndex];

  const shuffleCard = useCallback(() => {
    const shuffled = [...displayWords].sort(() => Math.random() - 0.5);
    setWords(shuffled);
    setIndex(0);
    setIsFlipped(false);
  }, [displayWords]);

  const nextCard = useCallback(() => {
    if (
      drillOnly &&
      index === displayWords.length - 1 &&
      displayWords.length > 1
    ) {
      shuffleCard();
    } else {
      setIndex((prev) => (prev + 1) % displayWords.length);
    }
    setIsFlipped(false);
  }, [displayWords.length, index, drillOnly, shuffleCard]);

  const prevCard = useCallback(() => {
    if (drillOnly && index === 0 && displayWords.length > 1) {
      shuffleCard();
    } else {
      setIndex(
        (prev) => (prev - 1 + displayWords.length) % displayWords.length
      );
    }
    setIsFlipped(false);
  }, [displayWords.length, index, drillOnly, shuffleCard]);

  const toggleFlip = () => setIsFlipped(!isFlipped);

  return {
    index: safeIndex,
    setIndex,
    isFlipped,
    setIsFlipped,
    activeCategories,
    setActiveCategories,
    words,
    setWords,
    drillOnly,
    setDrillOnly,
    filteredWords,
    displayWords,
    currentWord,
    shuffleCard,
    nextCard,
    prevCard,
    toggleFlip,
  };
}
