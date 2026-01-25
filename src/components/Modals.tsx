import { useEffect } from 'react';
import { MasteredCardsModal } from './MasteredCardsModal';
import type { Word, SpeakerMode } from '../types';

interface ModalsProps {
  showAbout: boolean;
  onCloseAbout: () => void;
  showOptions: boolean;
  onCloseOptions: () => void;
  showDrillInfo: boolean;
  onCloseDrillInfo: () => void;
  showMasteredCards: boolean;
  onCloseMasteredCards: () => void;
  masteredWords: Word[];
  masteredCount: number;
  filteredWordsCount: number;
  onUnmasterCard: (id: string) => void;
  onUnmasterAll: () => void;
  speakerMode: SpeakerMode;
  onSpeakerModeChange: (mode: SpeakerMode) => void;
  specificSpeaker: string;
  onSpecificSpeakerChange: (speaker: string) => void;
  uniqueSpeakers: string[];
  shuffleOnCategoryChange: boolean;
  onShuffleOnCategoryChangeChange: (value: boolean) => void;
  excludeKijetesantakalu: boolean;
  onExcludeKijetesantakakuChange: (value: boolean) => void;
  autoPlayAudioOnNavigation: boolean;
  onAutoPlayAudioOnNavigationChange: (value: boolean) => void;
  useSitelen: boolean;
  onUseSitelenChange: (value: boolean) => void;
  audioVolume: number;
  onAudioVolumeChange: (volume: number) => void;
}

export function Modals({
  showAbout,
  onCloseAbout,
  showOptions,
  onCloseOptions,
  showDrillInfo,
  onCloseDrillInfo,
  showMasteredCards,
  onCloseMasteredCards,
  masteredWords,
  masteredCount,
  filteredWordsCount,
  onUnmasterCard,
  onUnmasterAll,
  speakerMode,
  onSpeakerModeChange,
  specificSpeaker,
  onSpecificSpeakerChange,
  uniqueSpeakers,
  shuffleOnCategoryChange,
  onShuffleOnCategoryChangeChange,
  excludeKijetesantakalu,
  onExcludeKijetesantakakuChange,
  autoPlayAudioOnNavigation,
  onAutoPlayAudioOnNavigationChange,
  useSitelen,
  onUseSitelenChange,
  audioVolume,
  onAudioVolumeChange,
}: ModalsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (showAbout) onCloseAbout();
        else if (showOptions) onCloseOptions();
        else if (showDrillInfo) onCloseDrillInfo();
        else if (showMasteredCards) onCloseMasteredCards();
      }
    };

    const anyModalOpen =
      showAbout || showOptions || showDrillInfo || showMasteredCards;
    if (anyModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [
    showAbout,
    onCloseAbout,
    showOptions,
    onCloseOptions,
    showDrillInfo,
    onCloseDrillInfo,
    showMasteredCards,
    onCloseMasteredCards,
  ]);
  return (
    <>
      <MasteredCardsModal
        isOpen={showMasteredCards}
        onClose={onCloseMasteredCards}
        masteredWords={masteredWords}
        masteredCount={masteredCount}
        filteredWordsCount={filteredWordsCount}
        onUnmasterCard={onUnmasterCard}
        onUnmasterAll={onUnmasterAll}
      />

      {showDrillInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseDrillInfo();
          }}
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={onCloseDrillInfo}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
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
            <h2 className="text-2xl font-bold text-zinc-100 mb-4">
              About Drill Mode
            </h2>
            <div className="space-y-4 text-zinc-400 leading-relaxed text-sm sm:text-base">
              <p>
                <strong className="text-amber-500">Drill Mode</strong> helps you
                focus on words you haven't mastered yet.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  Mark cards as{' '}
                  <strong className="text-zinc-100">Mastered (M)</strong> to
                  hide them and track your progress.
                </li>
                <li>
                  The deck{' '}
                  <strong className="text-zinc-100">
                    shuffles automatically
                  </strong>{' '}
                  when you complete a pass.
                </li>
                <li>Track your progress per category in the header.</li>
                <li>
                  Use <strong className="text-zinc-100">Undo (Z)</strong> if you
                  misclick.
                </li>
                <li>
                  Manage all mastered cards using the{' '}
                  <strong className="text-zinc-100">checkmark button</strong> in
                  the header.
                </li>
              </ul>
            </div>
            <button
              onClick={onCloseDrillInfo}
              className="mt-8 w-full py-3 rounded-2xl bg-zinc-100 text-zinc-950 font-bold hover:bg-white transition-all active:scale-95"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {showOptions && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseOptions();
          }}
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={onCloseOptions}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
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
            <h2 className="text-2xl font-bold text-zinc-100 mb-6">Options</h2>

            <div className="space-y-6">
              {/* Speaker Selection */}
              <div>
                <h3 className="text-lg font-bold text-zinc-100 mb-3">
                  Audio Speaker
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      checked={speakerMode === 'random'}
                      onChange={() => onSpeakerModeChange('random')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-zinc-200">
                      Random - Pick a random speaker each time
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      checked={speakerMode === 'alternating'}
                      onChange={() => onSpeakerModeChange('alternating')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-zinc-200">
                      Alternating - Cycle through different speakers
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      checked={speakerMode === 'specific'}
                      onChange={() => onSpeakerModeChange('specific')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-zinc-200">
                      Specific Speaker
                    </span>
                  </label>
                </div>

                {speakerMode === 'specific' && uniqueSpeakers.length > 0 && (
                  <div className="mt-4">
                    <select
                      value={specificSpeaker}
                      onChange={(e) => onSpecificSpeakerChange(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-zinc-800 text-zinc-100 border border-zinc-700 focus:outline-none focus:border-zinc-500 text-sm"
                    >
                      <option value="">Select a speaker...</option>
                      {uniqueSpeakers.map((speaker) => (
                        <option key={speaker} value={speaker}>
                          {speaker}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Audio Volume */}
              <div className="border-t border-zinc-700 pt-6">
                <label className="flex flex-col cursor-pointer">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-zinc-100">
                      Audio Volume
                    </span>
                    <p className="text-xs text-zinc-500 mt-1">
                      {Math.round(audioVolume * 100)}%
                    </p>
                  </div>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioVolume}
                  onChange={(e) =>
                    onAudioVolumeChange(parseFloat(e.target.value))
                  }
                  className="w-full mt-3 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-100"
                />
              </div>

              {/* Auto-play Audio on Navigation */}
              <div className="border-t border-zinc-700 pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPlayAudioOnNavigation}
                    onChange={(e) =>
                      onAutoPlayAudioOnNavigationChange(e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-zinc-100">
                      Auto-play Audio on Navigation
                    </span>
                    <p className="text-xs text-zinc-500 mt-1">
                      Play pronunciation when moving to next or previous card
                    </p>
                  </div>
                </label>
              </div>

              {/* Shuffle on Category Change */}
              <div className="border-t border-zinc-700 pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleOnCategoryChange}
                    onChange={(e) =>
                      onShuffleOnCategoryChangeChange(e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-zinc-100">
                      Shuffle on Category Change
                    </span>
                    <p className="text-xs text-zinc-500 mt-1">
                      Automatically shuffle cards when switching categories
                    </p>
                  </div>
                </label>
              </div>

              {/* Exclude kijetesantakalu */}
              <div className="border-t border-zinc-700 pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeKijetesantakalu}
                    onChange={(e) =>
                      onExcludeKijetesantakakuChange(e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-zinc-100">
                      Exclude kijetesantakalu
                    </span>
                    <p className="text-xs text-zinc-500 mt-1">
                      Hide the April Fools word
                    </p>
                  </div>
                </label>
              </div>

              {/* Sitelen Pona */}
              <div className="border-t border-zinc-700 pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSitelen}
                    onChange={(e) => onUseSitelenChange(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-zinc-100">
                      sitelen pona
                    </span>
                    <p className="text-xs text-zinc-500 mt-1">
                      Display sitelen pona on front of card
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={onCloseOptions}
              className="mt-8 w-full py-3 rounded-2xl bg-zinc-100 text-zinc-950 font-bold hover:bg-white transition-all active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {showAbout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseAbout();
          }}
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={onCloseAbout}
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
            <div className="mb-6">
              <h2 className="text-3xl font-black text-zinc-100 tracking-tighter">
                ilo Peli
              </h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">
                Study Tool for Toki Pona
              </p>
            </div>
            <div className="space-y-4 text-zinc-400 leading-relaxed text-sm sm:text-base">
              <p>toki! mi ilo Peli.</p>
              <p>
                I'm learning Toki Pona and wanted to combine high-quality
                community resources into a minimal flashcard app.
              </p>

              <div className="pt-6 border-t border-zinc-800 mt-6">
                <h3 className="text-zinc-100 font-bold mb-3 uppercase text-[10px] tracking-[0.2em]">
                  Sources & Citations
                </h3>
                <ul className="space-y-3">
                  <li className="flex flex-col">
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider mb-1">
                      Semantic Spaces
                    </span>
                    <a
                      href="https://lipamanka.gay/essays/dictionary"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-300 hover:text-white underline decoration-zinc-700 underline-offset-4 transition-all"
                    >
                      lipamanka.gay/essays/dictionary
                    </a>
                  </li>
                  <li className="flex flex-col">
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider mb-1">
                      Word Definitions & Metadata
                    </span>
                    <a
                      href="https://github.com/lipu-linku/sona"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-300 hover:text-white underline decoration-zinc-700 underline-offset-4 transition-all"
                    >
                      github.com/lipu-linku/sona
                    </a>
                  </li>
                  <li className="flex flex-col">
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider mb-1">
                      Additional information & inspiration
                    </span>
                    <a
                      href="https://nimi.li"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-300 hover:text-white underline decoration-zinc-700 underline-offset-4 transition-all"
                    >
                      nimi.li
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <button
              onClick={onCloseAbout}
              className="mt-8 w-full py-3 rounded-2xl bg-zinc-100 text-zinc-950 font-bold hover:bg-white transition-all active:scale-95"
            >
              pona!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
