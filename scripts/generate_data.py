"""
Dynamic data generation script for ilo-peli.

Fetches word data from lipu-linku GitHub repo and lipamanka essays,
merges with local overrides, and generates src/data.json.
"""

import json
import re
import subprocess
import sys
import tempfile
import time
import tomllib
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# Constants
SONA_REPO_URL = "https://github.com/lipu-linku/sona.git"
SONA_RAW_BASE = "https://raw.githubusercontent.com/lipu-linku/sona/main/words"
LIPAMANKA_URL = "https://lipamanka.gay/essays/dictionary"
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
OVERRIDES_DIR = PROJECT_ROOT / "data" / "overrides"
OUTPUT_FILE = PROJECT_ROOT / "src" / "data.json"


def fetch_words_data(repo_path: Path) -> dict:
    """Fetch word metadata from local sona repo."""
    print("Reading word list and metadata from sona...")
    words = {}

    words_dir = repo_path / "words"
    metadata_dir = words_dir / "metadata"
    definitions_file = words_dir / "source" / "definitions.toml"

    # Load word list
    if not definitions_file.exists():
        print(f"Error: {definitions_file} not found", file=sys.stderr)
        return {}

    try:
        with open(definitions_file, "rb") as f:
            definitions = tomllib.load(f)
        word_ids = list(definitions.keys())
        print(f"  Found {len(word_ids)} words")
    except Exception as e:
        print(f"Error reading definitions.toml: {e}", file=sys.stderr)
        return {}

    # Read metadata files from directory
    print("  Reading metadata files...")
    for idx, word_id in enumerate(word_ids, 1):
        metadata_file = metadata_dir / f"{word_id}.toml"
        try:
            with open(metadata_file, "rb") as f:
                word_data = tomllib.load(f)
            words[word_id] = word_data
        except Exception as e:
            print(
                f"  Warning: Could not read metadata for {word_id}: {e}",
                file=sys.stderr,
            )

    print(f"Successfully read {len(words)} words with metadata")
    return words


def fetch_essays() -> dict[str, str]:
    """Scrape essays from lipamanka and extract semantic spaces."""
    print("Fetching essays from lipamanka...")
    essays = {}
    try:
        resp = requests.get(LIPAMANKA_URL, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.content, "html.parser")

        # Find all <details> blocks with word summaries
        for details in soup.find_all("details"):
            summary = details.find("summary")
            if not summary:
                continue

            word_id = summary.get("id")
            if not word_id:
                continue

            # Extract text content from the details block, preserving paragraph structure
            paragraphs = details.find_all("p")
            if paragraphs:
                # Join paragraphs with double newlines to preserve structure
                text = "\n\n".join(p.get_text(strip=True) for p in paragraphs)
                # Bold the word itself for readability (case-insensitive)
                # Replace standalone instances of the word with **word**
                text = re.sub(
                    rf"\b{re.escape(word_id)}\b",
                    f"**{word_id}**",
                    text,
                    flags=re.IGNORECASE,
                )
                essays[word_id] = text

        print(f"Found {len(essays)} essays")
        return essays
    except Exception as e:
        print(f"Error fetching essays: {e}", file=sys.stderr)
        return {}


def fetch_commentary(repo_path: Path) -> dict[str, str]:
    """Fetch commentary notes from local sona repo."""
    print("Reading commentary from sona...")
    try:
        commentary_file = repo_path / "words" / "source" / "commentary.toml"
        if not commentary_file.exists():
            print("  (commentary.toml not found, skipping)")
            return {}

        with open(commentary_file, "rb") as f:
            data = tomllib.load(f)
        print(f"Found {len(data)} commentary entries")
        return data
    except Exception as e:
        print(f"Error reading commentary: {e}", file=sys.stderr)
        return {}


def load_override(word: str) -> dict | None:
    """Load override data for a word if it exists."""
    override_file = OVERRIDES_DIR / f"{word}.toml"
    if not override_file.exists():
        return None

    try:
        with open(override_file, "rb") as f:
            return tomllib.load(f)
    except Exception as e:
        print(f"Error loading override for {word}: {e}", file=sys.stderr)
        return None


def deep_merge(base: dict, override: dict) -> dict:
    """Deep merge override into base, with override values taking priority."""
    merged = base.copy()
    for key, value in override.items():
        if key in merged and isinstance(merged[key], dict) and isinstance(value, dict):
            merged[key] = deep_merge(merged[key], value)
        else:
            merged[key] = value
    return merged


def extract_english_definition(word_data: dict) -> str:
    """Extract English definition from word data."""
    if "pu_verbatim" in word_data and "en" in word_data["pu_verbatim"]:
        text = word_data["pu_verbatim"]["en"]
        return re.sub(r"^[A-Z]+\s*\(", "(", text).strip()

    if "author_verbatim" in word_data and word_data["author_verbatim"]:
        return word_data["author_verbatim"]

    return ""


def parse_definitions_with_pos(word_data: dict) -> list[dict] | None:
    """Parse English definitions to extract POS and meanings separately."""
    if "pu_verbatim" not in word_data or "en" not in word_data["pu_verbatim"]:
        return None

    text = word_data["pu_verbatim"]["en"]
    definitions = []

    # Split by newline to handle multiple POS entries
    lines = text.split("\n")
    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Match pattern: "POS_NAME meaning text"
        match = re.match(r"^([A-Z\-]+)\s+(.+)$", line)
        if match:
            pos = match.group(1)
            meaning = match.group(2)
            definitions.append({"pos": pos, "meaning": meaning})

    return definitions if definitions else None


def build_word(
    word_id: str,
    word_data: dict,
    essays: dict,
    commentary: dict,
    override: dict | None,
) -> dict:
    """Build a Word object from sona data, essays, commentary, and overrides."""
    base = deep_merge(word_data, override) if override else word_data.copy()

    # Essential fields
    word_obj = {
        "id": word_id,
        "word": word_id,
        "usage_category": base.get("usage_category", ""),
        "source_language": base.get("source_language", ""),
        "definition_en": extract_english_definition(base),
        "deprecated": base.get("deprecated", False),
    }

    # Parse definitions with POS badges
    definitions_with_pos = parse_definitions_with_pos(base)
    if definitions_with_pos:
        word_obj["definitions_en"] = definitions_with_pos

    if "creator" in base:
        word_obj["creator"] = base["creator"]
    if "coined_era" in base:
        word_obj["coined_era"] = base["coined_era"]

    if "audio" in base and isinstance(base["audio"], list) and base["audio"]:
        word_obj["audio"] = [
            {"author": a.get("author", ""), "link": a.get("link", "")}
            for a in base["audio"]
            if isinstance(a, dict) and a.get("link")
        ]

    if (
        "etymology" in base
        and isinstance(base["etymology"], list)
        and base["etymology"]
    ):
        filtered_etym = [
            {"word": e.get("word")}
            for e in base["etymology"]
            if isinstance(e, dict) and e.get("word")
        ]
        if filtered_etym:
            word_obj["etymology"] = filtered_etym

    if "pu_verbatim" in base:
        translations = {}
        for lang, text in base["pu_verbatim"].items():
            if lang and text:
                clean_text = re.sub(r"^[A-Z]+\s*\(", "(", text).strip()
                translations[lang] = clean_text
        if translations:
            word_obj["translations"] = translations

    if "ku_data" in base and isinstance(base["ku_data"], dict) and base["ku_data"]:
        word_obj["usage_data"] = base["ku_data"]
        ku_translations = ", ".join(base["ku_data"].keys())
        if "translations" not in word_obj:
            word_obj["translations"] = {}
        word_obj["translations"]["ku"] = ku_translations

    if "representations" in base and isinstance(base["representations"], dict):
        word_obj["representations"] = base["representations"]

    if word_id in essays:
        word_obj["semantic_space_en"] = essays[word_id]

    if word_id in commentary and commentary[word_id]:
        word_obj["commentary_en"] = commentary[word_id]

    if "usage" in base and isinstance(base["usage"], dict) and base["usage"]:
        word_obj["usage"] = base["usage"]

    return word_obj


def load_existing_data() -> dict:
    """Load existing data.json into a dict keyed by word ID."""
    if not OUTPUT_FILE.exists():
        print(f"Error: {OUTPUT_FILE} does not exist", file=sys.stderr)
        sys.exit(1)

    try:
        with open(OUTPUT_FILE, "r") as f:
            words_list = json.load(f)
        # Convert to dict keyed by word ID for easier lookup
        return {word["id"]: word for word in words_list}
    except Exception as e:
        print(f"Error loading existing data: {e}", file=sys.stderr)
        sys.exit(1)


def main() -> None:
    """Main execution."""
    start_time = time.perf_counter()
    overrides_only = "--overrides-only" in sys.argv

    if overrides_only:
        print("Rebuilding data.json with overrides only...")

        words_data = load_existing_data()
        if not words_data:
            print("Error: No words in existing data", file=sys.stderr)
            sys.exit(1)

        OVERRIDES_DIR.mkdir(parents=True, exist_ok=True)

        words = []
        for word_id, word_obj in words_data.items():
            override = load_override(word_id)
            if override:
                merged_data = deep_merge(word_obj, override)
                if "pu_verbatim" in override and "en" in override["pu_verbatim"]:
                    definitions_with_pos = parse_definitions_with_pos(merged_data)
                    if definitions_with_pos:
                        word_obj["definitions_en"] = definitions_with_pos
                        word_obj["definition_en"] = extract_english_definition(
                            merged_data
                        )
                for key in override:
                    if key != "pu_verbatim":
                        word_obj[key] = merged_data[key]
            words.append(word_obj)

        elapsed = time.perf_counter() - start_time
        print(f"Applied overrides to {len(words)} words ({elapsed:.2f}s)")
    else:
        print("Starting data generation...")

        # Clone sona repo to temp directory
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            print("  Cloning sona repository...")
            clone_start = time.perf_counter()
            try:
                subprocess.run(
                    ["git", "clone", "--depth", "1", SONA_REPO_URL, str(temp_path)],
                    check=True,
                    capture_output=True,
                    timeout=30,
                )
            except subprocess.CalledProcessError as e:
                print(f"Error cloning repository: {e.stderr.decode()}", file=sys.stderr)
                sys.exit(1)
            clone_elapsed = time.perf_counter() - clone_start
            print(f"  Clone completed ({clone_elapsed:.2f}s)")

            words_data = fetch_words_data(temp_path)
            if not words_data:
                print("Error: No words data found", file=sys.stderr)
                sys.exit(1)

            essays = fetch_essays()
            commentary = fetch_commentary(temp_path)

            OVERRIDES_DIR.mkdir(parents=True, exist_ok=True)

            words = []
            for word_id, word_data in words_data.items():
                if not isinstance(word_data, dict):
                    continue

                override = load_override(word_id)
                word_obj = build_word(word_id, word_data, essays, commentary, override)
                words.append(word_obj)

    words.sort(key=lambda w: w["id"])

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(words, f, indent=2, ensure_ascii=False)

    elapsed = time.perf_counter() - start_time
    print(f"Success! Generated {len(words)} words to {OUTPUT_FILE} ({elapsed:.2f}s)")


if __name__ == "__main__":
    main()
