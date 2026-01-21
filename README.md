# ilo Peli

A simple flashcard webapp for drilling Toki Pona vocabulary!

## Data Sources

The following resources were used to compile the word data:

- [lipamanka.gay/essays/dictionary](https://lipamanka.gay/essays/dictionary) for the semantic space.
- [github.com/lipu-linku/sona](https://github.com/lipu-linku/sona) for the word "definitions" and metadata.
- [tokipona.org/nimi_pu.txt](https://tokipona.org/nimi_pu.txt) for Ku translations.

Data is static and would need recompiled for updates. Since the language is unlikely to change drastically while I continue to learn it, this is acceptable for now. Depending on usage from the community, I may set up a more dynamic data pipeline in the future.

I've taken some conscious liberties with the definitions, like expanding `sina` to be also pronoun. These changes are rare and determined by consulting usage in the Toki Pona community, as documented by [tokipona.org](https://tokipona.org/nimi_pu.txt).

## Features

- **Flashcard Logic:** Flip cards to reveal definitions and etymology.
- **Filtering:** Filter words by usage (core, common, uncommon) or part of speech.
- **Keyboard Shortcuts:**
  - `Space` / `Enter`: Flip card
  - `Right Arrow` / `L`: Next card
  - `Left Arrow` / `H`: Previous card
  - `S`: Shuffle cards
  - `A`: Play audio (if available)
  - `Up/Down Arrows` / `K/J`: Scroll card back
