import { useState, useCallback } from 'react';
import { usePersistence } from './usePersistence';

interface LastMasteredCard {
  id: string;
  position: number;
  activeCategories: Set<string>;
}

export function useMasteredCards() {
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('masteredIds');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const [lastMasteredCard, setLastMasteredCard] =
    useState<LastMasteredCard | null>(null);

  usePersistence('masteredIds', masteredIds);

  const toggleMastered = useCallback(
    (id: string, position: number, activeCategories: Set<string>) => {
      setMasteredIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          setLastMasteredCard(null);
        } else {
          next.add(id);
          setLastMasteredCard({
            id,
            position,
            activeCategories: new Set(activeCategories),
          });
        }
        return next;
      });
    },
    []
  );

  const unmasterCard = useCallback((id: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const undoMastered = useCallback(
    (currentActiveCategories: Set<string>) => {
      if (lastMasteredCard) {
        // Check if categories changed at all
        const categoriesChanged =
          lastMasteredCard.activeCategories.size !==
            currentActiveCategories.size ||
          Array.from(lastMasteredCard.activeCategories).some(
            (cat) => !currentActiveCategories.has(cat)
          ) ||
          Array.from(currentActiveCategories).some(
            (cat) => !lastMasteredCard.activeCategories.has(cat)
          );

        if (!categoriesChanged) {
          setMasteredIds((prev) => {
            const next = new Set(prev);
            next.delete(lastMasteredCard.id);
            return next;
          });
          setLastMasteredCard(null);
          return { success: true, position: lastMasteredCard.position };
        }
      }
      return { success: false, position: null };
    },
    [lastMasteredCard]
  );

  const clearLastMastered = useCallback(() => {
    setLastMasteredCard(null);
  }, []);

  const resetMastered = useCallback(() => {
    if (confirm('Are you sure you want to reset all mastered cards?')) {
      setMasteredIds(new Set());
      setLastMasteredCard(null);
    }
  }, []);

  return {
    masteredIds,
    lastMasteredCard,
    toggleMastered,
    undoMastered,
    clearLastMastered,
    resetMastered,
    unmasterCard,
    setMasteredIds,
  };
}
