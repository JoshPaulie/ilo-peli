# Changelog

All notable changes to this project will be documented in this file.

## [Unversioned]

## [2.7.0] - 2026-01-29

### Added
- Fixed how CC license attributions are displayed on lipamanka essays
- Repo link in about modal

### Fixed
- Hide drill info button when undo button appears to prevent awkward mobile spacing
- Preserve CC license links when scraping lipamanka essays (unpa, jaki, etc.)
- Collapse license attribution text to single line

### Changed
- Moved version number to about modal

## [2.6.0] - 2026-01-28

### Fixed
- Fixed PWA viewport jank on card swipe by locking page scrolling and constraining layout to viewport

## [2.5.0] - 2026-01-28

### Added
- **New setting:** Move mastery button from card to navigation controls

### Fixed
- Auto-play audio now works when mastering a card in drill mode
- Drill mode card text freezing when navigating from last mastered card (index out-of-bounds)
- Memory leaks in keyboard handler preventing pending timers from cleanup
- Toast notification timers no longer accumulate on rapid updates
- Unused dependency in useCardState hook
- Improved toast ID generation to prevent theoretical collisions

## [2.4.0] - 2026-01-26

### Added
- Horizontal swipe gestures for card navigation on mobile/touch devices (swipe left = next, swipe right = previous)

### Fixed
- Mastery animation now plays on back side of card
- Mastery hotkey (M) now triggers animation without flipping card or disrupting timing
- Auto-play audio now cuts off previous audio when navigating through cards

## [2.3.0] - 2026-01-25

### Changed
- kijetesantakalu (April Fools word) now appears in deck when its category is selected (previously had dedicated exclusion setting)

### Added
- **New setting:** Audio volume control for pronunciation playback

### Fixed
- Safari dropdown styling now uses custom dropdowns for consistency with other browsers

## [2.2.0] - 2026-01-25

### Added
- **New setting:** Auto-play audio pronunciation setting when navigating between cards (respects speaker preference setting)
- **New setting:** Toggle to show sitelen pona glyphs on front of cards
- Persist card side (front/back) between sessions
- Make mastered cards badge clickable to open mastered cards modal
- All modals are now dismissible by pressing Escape or clicking outside (on the backdrop)
- Version footer with link to changelog

### Changed
- Enhanced undo system
  - 'Undo' restores card to exact position before mastery
  - 'Undo' automatically disabled when category filters change
- Improved unmaster behavior
- Increase color contrast for better readability
- Replaced nimi.li logo with text 

## [2.1.0] - 2026-01-24

### Added
- Display word usage percentage (e.g. "Core (100%)")

### Fixed
- border-flash animation when mastering cards

### Changed
- Update reference page
- Disable uncommon and obscure words by default (on first visit)
- Refactor data generation script for better maintainability
  - Simplified
  - Clone sona repo rather than fetching individual files via API (much faster)
- Use sona/words/source/definitions.toml rather than pu_verbatim metadata for definitions
    - pu_verbatim moved to its own section on card

### Removed
- Override system and related files

## [2.0.0] - 2026-01-23

### Added
- Toast notifications support
- Copy word to clipboard functionality
- Multi-select category filtering with toggles
- Drill mode state persistence when toggling off
- **Dynamic data generation system!** Python script to fetch and compile word data from upstream sources
- sitelen pona! include FairfaxPonaHD.ttf font and display in word details (replaces emojis)
- Commentary notes from sona repo displayed on card back

### Changed
- Complete redesign of `src/data.json` structure to align closer to upstream sources
- Data now pulls directly from lipu-linku/sona and lipa manka's semantic space essays instead of static, manually compiled values
- Removed card flip animation for instant, distraction-free study experience

### Fixed
- Header layout issues when drill mode master button is clicked
- excludeKijetesantakalu filter not applied when shuffling on category change

## [0.1.0] - 2026-01-20

### Added
- Initial project setup
- Ilo Peli - Card learning application
- Project naming and metadata
- Core card navigation and drill mode functionality
