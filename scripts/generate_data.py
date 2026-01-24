"""
Dynamic data generation script for ilo-peli.

Fetches word data from lipu-linku GitHub repo and lipamanka essays,
and generates src/data.json.
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
LIPAMANKA_URL = "https://lipamanka.gay/essays/dictionary"
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
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


def fetch_definitions(repo_path: Path) -> dict[str, str]:
    """Fetch word definitions from source definitions.toml."""
    print("Reading definitions from sona...")
    definitions_file = repo_path / "words" / "source" / "definitions.toml"

    try:
        with open(definitions_file, "rb") as f:
            data = tomllib.load(f)
        print(f"  Found {len(data)} definitions")
        return data
    except Exception as e:
        print(f"Error reading definitions.toml: {e}", file=sys.stderr)
        return {}


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


def build_word(
    word_id: str,
    word_data: dict,
    definitions: dict[str, str],
    essays: dict,
    commentary: dict,
) -> dict:
    """Build a Word object from sona data, essays, and commentary."""
    # Essential fields
    word_obj = {
        "id": word_id,
        "word": word_id,
        "usage_category": word_data.get("usage_category", ""),
        "source_language": word_data.get("source_language", ""),
        "definition_en": definitions.get(word_id, ""),
        "deprecated": word_data.get("deprecated", False),
    }

    # Parse definitions with POS badges from definitions.toml
    definition_text = definitions.get(word_id, "")
    if definition_text and "\n" in definition_text:
        # Multi-line definition, split by newlines
        definitions_with_pos = []
        for line in definition_text.split("\n"):
            line = line.strip()
            if not line:
                continue
            match = re.match(r"^([A-Z\-]+)\s+(.+)$", line)
            if match:
                pos = match.group(1)
                meaning = match.group(2)
                definitions_with_pos.append({"pos": pos, "meaning": meaning})
        if definitions_with_pos:
            word_obj["definitions_en"] = definitions_with_pos

    # Extract pu_verbatim_en from metadata (for the new pu verbatim section)
    if "pu_verbatim" in word_data and "en" in word_data["pu_verbatim"]:
        pu_text = word_data["pu_verbatim"]["en"]

        # Parse pu_verbatim with POS badges
        pu_definitions = []
        for line in pu_text.split("\n"):
            line = line.strip()
            if not line:
                continue
            # Match pattern: "POS_NAME meaning" or "POS_NAME (meaning)"
            match = re.match(r"^([A-Z\-]+)\s+(.+)$", line)
            if match:
                pos = match.group(1)
                meaning = match.group(2)
                # Remove parentheses wrapper if present
                meaning = re.sub(r"^\(", "", meaning)
                meaning = re.sub(r"\)$", "", meaning)
                pu_definitions.append({"pos": pos, "meaning": meaning})

        if pu_definitions:
            word_obj["pu_verbatim_en"] = pu_definitions

    if "creator" in word_data:
        word_obj["creator"] = word_data["creator"]
    if "coined_era" in word_data:
        word_obj["coined_era"] = word_data["coined_era"]

    if (
        "audio" in word_data
        and isinstance(word_data["audio"], list)
        and word_data["audio"]
    ):
        word_obj["audio"] = [
            {"author": a.get("author", ""), "link": a.get("link", "")}
            for a in word_data["audio"]
            if isinstance(a, dict) and a.get("link")
        ]

    if (
        "etymology" in word_data
        and isinstance(word_data["etymology"], list)
        and word_data["etymology"]
    ):
        filtered_etym = [
            {"word": e.get("word")}
            for e in word_data["etymology"]
            if isinstance(e, dict) and e.get("word")
        ]
        if filtered_etym:
            word_obj["etymology"] = filtered_etym

    if "pu_verbatim" in word_data:
        translations = {}
        for lang, text in word_data["pu_verbatim"].items():
            if lang and text:
                clean_text = re.sub(r"^[A-Z]+\s*\(", "(", text).strip()
                translations[lang] = clean_text
        if translations:
            word_obj["translations"] = translations

    if (
        "ku_data" in word_data
        and isinstance(word_data["ku_data"], dict)
        and word_data["ku_data"]
    ):
        word_obj["usage_data"] = word_data["ku_data"]
        ku_translations = ", ".join(word_data["ku_data"].keys())
        if "translations" not in word_obj:
            word_obj["translations"] = {}
        word_obj["translations"]["ku"] = ku_translations

    if "representations" in word_data and isinstance(
        word_data["representations"], dict
    ):
        word_obj["representations"] = word_data["representations"]

    if word_id in essays:
        word_obj["semantic_space_en"] = essays[word_id]

    if word_id in commentary and commentary[word_id]:
        word_obj["commentary_en"] = commentary[word_id]

    if (
        "usage" in word_data
        and isinstance(word_data["usage"], dict)
        and word_data["usage"]
    ):
        word_obj["usage"] = word_data["usage"]

    return word_obj


def main() -> None:
    """Main execution."""
    start_time = time.perf_counter()

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

        definitions = fetch_definitions(temp_path)
        essays = fetch_essays()
        commentary = fetch_commentary(temp_path)

        words = []
        for word_id, word_data in words_data.items():
            if not isinstance(word_data, dict):
                continue

            word_obj = build_word(word_id, word_data, definitions, essays, commentary)
            words.append(word_obj)

    words.sort(key=lambda w: w["id"])

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(words, f, indent=2, ensure_ascii=False)

    elapsed = time.perf_counter() - start_time
    print(f"Success! Generated {len(words)} words to {OUTPUT_FILE} ({elapsed:.2f}s)")


if __name__ == "__main__":
    main()
