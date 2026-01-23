# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Toast notifications for user feedback
- Copy word to clipboard functionality
- Multi-select category filtering with toggles
- Drill mode state persistence when toggling off
- **Dynamic data generation system!** Python script to fetch and compile word data from upstream sources
- Word override system via `data/overrides/` TOML files for customizations
- sitelen pona! include FairfaxPonaHD.ttf font and display in word details (replaces emojis)
- Commentary notes from sona repo displayed on card back (56 words)

### Changed
- Complete redesign of `src/data.json` structure to align closer to upstream sources
- Data now pulls directly from lipu-linku/sona and lipa manka's semantic space essays instead of static, manually compiled values
- Removed card flip animation for instant, distraction-free study experience

### Fixed
- Blank GitHub Pages issue by adding base path to Vite config
- Header layout issues when drill mode master button is clicked
- Backside flash when navigating cards with flip animation enabled
- excludeKijetesantakalu filter not applied when shuffling on category change
- Restored keyboard-driven scrolling on card back side (arrow up/down and j/k keys)

## [0.1.0] - 2026-01-20

### Added
- Initial project setup
- Ilo Peli - Card learning application
- Project naming and metadata
- Core card navigation and drill mode functionality
