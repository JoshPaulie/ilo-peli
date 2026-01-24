import { useState } from 'react';
import { usePersistence } from './usePersistence';
import type { SpeakerMode } from '../types';

export function useSettings() {
  const [speakerMode, setSpeakerMode] = useState<SpeakerMode>(() => {
    const saved = localStorage.getItem('speakerMode');
    if (saved === 'random' || saved === 'alternating' || saved === 'specific') {
      return saved;
    }
    return 'random';
  });

  const [specificSpeaker, setSpecificSpeaker] = useState<string>(() => {
    return localStorage.getItem('specificSpeaker') || '';
  });

  const [lastUsedSpeaker, setLastUsedSpeaker] = useState<string>('');

  const [shuffleOnCategoryChange, setShuffleOnCategoryChange] = useState(() => {
    const saved = localStorage.getItem('shuffleOnCategoryChange');
    return saved ? JSON.parse(saved) : false;
  });

  const [excludeKijetesantakalu, setExcludeKijetesantakalu] = useState(() => {
    const saved = localStorage.getItem('excludeKijetesantakalu');
    return saved ? JSON.parse(saved) : false;
  });

  usePersistence('speakerMode', speakerMode);
  usePersistence('specificSpeaker', specificSpeaker);
  usePersistence('shuffleOnCategoryChange', shuffleOnCategoryChange);
  usePersistence('excludeKijetesantakalu', excludeKijetesantakalu);

  return {
    speakerMode,
    setSpeakerMode,
    specificSpeaker,
    setSpecificSpeaker,
    lastUsedSpeaker,
    setLastUsedSpeaker,
    shuffleOnCategoryChange,
    setShuffleOnCategoryChange,
    excludeKijetesantakalu,
    setExcludeKijetesantakalu,
  };
}
