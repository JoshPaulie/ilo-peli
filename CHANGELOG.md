# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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
