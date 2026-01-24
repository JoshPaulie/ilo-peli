"""
Dynamic data generation script for ilo-peli.

Fetches word data from lipu-linku GitHub repo and lipamanka essays,
merges with local overrides, and generates src/data.json.
"""

import json
import re
import sys
import tomllib
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# Constants
SONA_RAW_BASE = "https://raw.githubusercontent.com/lipu-linku/sona/main/words"
LIPAMANKA_URL = "https://lipamanka.gay/essays/dictionary"
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
OVERRIDES_DIR = PROJECT_ROOT / "data" / "overrides"
OUTPUT_FILE = PROJECT_ROOT / "src" / "data.json"


def fetch_words_data() -> dict:
    """Fetch word metadata from sona via raw GitHub URLs."""
    print("Fetching word list and metadata from sona...")
    words = {}

    print("  Getting word list...")
    try:
        resp = requests.get(
            f"{SONA_RAW_BASE}/source/definitions.toml",
            timeout=10,
        )
        resp.raise_for_status()
        definitions = tomllib.loads(resp.text)
        word_ids = list(definitions.keys())
        print(f"  Found {len(word_ids)} words")
    except Exception as e:
        print(f"Error fetching definitions.toml: {e}", file=sys.stderr)
        return {}

    print("  Fetching metadata files...")
    for idx, word_id in enumerate(word_ids, 1):
        raw_url = f"{SONA_RAW_BASE}/metadata/{word_id}.toml"

        try:
            resp = requests.get(raw_url, timeout=5)
            resp.raise_for_status()
            word_data = tomllib.loads(resp.text)
            words[word_id] = word_data
            if idx % 20 == 0:
                print(f"    [{idx}/{len(word_ids)}]")
        except Exception as e:
            print(
                f"  Warning: Could not fetch metadata for {word_id}: {e}",
                file=sys.stderr,
            )

    print(f"Successfully fetched {len(words)} words with metadata")
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


def fetch_commentary() -> dict[str, str]:
    """Fetch commentary notes from sona repo."""
    print("Fetching commentary from sona...")
    try:
        resp = requests.get(
            f"{SONA_RAW_BASE}/source/commentary.toml",
            timeout=10,
        )
        resp.raise_for_status()
        data = tomllib.loads(resp.text)
        print(f"Found {len(data)} commentary entries")
        return data
    except Exception as e:
        print(f"Error fetching commentary: {e}", file=sys.stderr)
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

        print(f"Applied overrides to {len(words)} words")
    else:
        print("Starting data generation...")

        words_data = fetch_words_data()
        if not words_data:
            print("Error: No words data found", file=sys.stderr)
            sys.exit(1)

        essays = fetch_essays()
        commentary = fetch_commentary()

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

    print(f"Success! Generated {len(words)} words to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
