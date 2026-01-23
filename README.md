# ilo Peli

A simple flashcard webapp for drilling Toki Pona vocabulary!

## Data Sources & Generation

Word data is dynamically generated from the following upstream sources:

- [lipu-linku/sona](https://github.com/lipu-linku/sona) - word metadata, definitions, etymology, and usage data
- [lipamanka.gay/essays/dictionary](https://lipamanka.gay/essays/dictionary) - semantic space descriptions (English)

### Updating Data

To refresh the word database with the latest upstream data:

```bash
uv run scripts/generate_data.py
```

This script:
1. Fetches all word metadata from the sona repository
2. Scrapes semantic space descriptions from lipamanka essays
3. Merges with any local overrides (see below)
4. Generates `src/data.json`

The script requires `uv` (Astral's Python package manager). If not installed, see [uv installation](https://docs.astral.sh/uv/getting-started/installation/).

### Word Overrides

To customize a word (add notes, change definitions, etc.), create a TOML file in `data/overrides/<word>.toml`. The file should follow the same schema as word metadata in sona:

Example: `data/overrides/sina.toml`
```toml
definition_en = "pronoun: you"
# Custom semantic space for sina
[pu_verbatim]
en = "PRONOUN you"
```

Overrides take precedence over upstream data when generating `src/data.json`.

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
