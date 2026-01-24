# ilo-peli

A flashcard app for drilling Toki Pona vocabulary. Static data (no backend), React + Vite + Tailwind.

## Goal

Keyboard-driven study tool with mastery tracking, drill mode, and audio pronunciation.

## Notable Files

- **[App.tsx](../src/App.tsx)** – Main app, state orchestration
- **[useCardState.ts](../src/hooks/useCardState.ts)** – Card navigation & filtering
- **[useMasteredCards.ts](../src/hooks/useMasteredCards.ts)** – Track mastery with undo
- **[useSettings.ts](../src/hooks/useSettings.ts)** – Persistent user preferences
- **[usePersistence.ts](../src/hooks/usePersistence.ts)** – localStorage sync (handles Sets, objects, primitives)
- **[data.json](../src/data.json)** – Word database
- **[Modals.tsx](../src/components/Modals.tsx)** – Settings UI

## Testing & Quality

Always run **before committing**:

```bash
npm run build  # Type-check + build
npm run lint   # Lint check
npm run format # Auto-format code
```

## Python Scripts

The `scripts/generate_data.py` script should **only be run with `uv`** (no venv/package management needed):

```bash
uv run scripts/generate_data.py
```

The script has inline dependencies and will be installed automatically by `uv`.

This script fetches upstream Toki Pona data, processes it, and outputs a new `src/data.json` file.

After making changes to any python script, run the following for type checking, linting, and formatting:

```bash
uv run mypy scripts/generate_data.py
uv run ruff check --fix scripts/generate_data.py
uv run ruff format scripts/generate_data.py
```

## Conventions

- **New settings:** Always add to `useSettings()` and persist via `usePersistence()` – all settings persist across sessions
- **Commit messages:** Follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat: add keyboard shortcut`, `fix: audio playback`, `docs: update README`). Keep the message short, never add long descriptions in commit messages.
- **Changelogs:** Follow [Keep a `CHANGELOG.md`](https://keepachangelog.com/en/1.0.0/) to maintain a `CHANGELOG.md` with notable changes for each version. Entries should be categorized under headings like "Added", "Changed", "Fixed", etc., and short descriptions.
- **Versions:** Follow [Semantic Versioning](https://semver.org/) for version numbers in `package.json` and releases. When asked to bump the version, choose the appropriate increment: MAJOR.MINOR.PATCH. Update `CHANGELOG.md` accordingly.
