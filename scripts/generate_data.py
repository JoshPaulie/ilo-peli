# /// script
# requires-python = ">=3.9"
# dependencies = [
#     "requests",
#     "beautifulsoup4",
#     "tomli"
# ]
# ///
"""
Dynamic data generation script for ilo-peli.

Fetches word data from lipu-linku GitHub repo and lipamanka essays,
merges with local overrides, and generates src/data.json.
"""

import json
import requests
from bs4 import BeautifulSoup
from pathlib import Path
import sys
import re
try:
    import tomllib
except ModuleNotFoundError:
    import tomli as tomllib


# Constants
SONA_REPO = "https://api.github.com/repos/lipu-linku/sona"
LIPAMANKA_URL = "https://lipamanka.gay/essays/dictionary"
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
OVERRIDES_DIR = PROJECT_ROOT / "data" / "overrides"
OUTPUT_FILE = PROJECT_ROOT / "src" / "data.json"


def fetch_words_data() -> dict:
    """Fetch all word metadata from sona via raw GitHub URLs."""
    print("Fetching word list and metadata from sona...")
    words = {}
    
    # First, fetch the definitions.toml to get the list of all words
    print("  Getting word list...")
    try:
        resp = requests.get("https://raw.githubusercontent.com/lipu-linku/sona/main/words/source/definitions.toml", timeout=10)
        resp.raise_for_status()
        definitions = tomllib.loads(resp.text)
        word_ids = list(definitions.keys())
        print(f"  Found {len(word_ids)} words")
    except Exception as e:
        print(f"Error fetching definitions.toml: {e}", file=sys.stderr)
        return {}
    
    # Now fetch metadata for each word
    print("  Fetching metadata files...")
    for idx, word_id in enumerate(word_ids, 1):
        raw_url = f"https://raw.githubusercontent.com/lipu-linku/sona/main/words/metadata/{word_id}.toml"
        
        try:
            resp = requests.get(raw_url, timeout=5)
            resp.raise_for_status()
            word_data = tomllib.loads(resp.text)
            words[word_id] = word_data
            if idx % 20 == 0:
                print(f"    [{idx}/{len(word_ids)}]")
        except Exception as e:
            print(f"  Warning: Could not fetch metadata for {word_id}: {e}", file=sys.stderr)
            # Continue anyway - we can use definitions as fallback
    
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
                text = re.sub(rf'\b{re.escape(word_id)}\b', f'**{word_id}**', text, flags=re.IGNORECASE)
                essays[word_id] = text
        
        print(f"Found {len(essays)} essays")
        return essays
    except Exception as e:
        print(f"Error fetching essays: {e}", file=sys.stderr)
        return {}


def fetch_commentary() -> dict[str, str]:
    """Fetch commentary notes from sona repo."""
    print("Fetching commentary from sona...")
    commentary = {}
    try:
        resp = requests.get("https://raw.githubusercontent.com/lipu-linku/sona/main/words/source/commentary.toml", timeout=10)
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
    # Check pu_verbatim for English
    if "pu_verbatim" in word_data and "en" in word_data["pu_verbatim"]:
        text = word_data["pu_verbatim"]["en"]
        # Remove POS prefix like "NOUN ", "PARTICLE ", etc.
        text = re.sub(r"^[A-Z]+\s*\(", "(", text)
        return text.strip()
    
    # Fallback to author_verbatim
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
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Match pattern: "POS_NAME meaning text"
        match = re.match(r'^([A-Z\-]+)\s+(.+)$', line)
        if match:
            pos = match.group(1)
            meaning = match.group(2)
            definitions.append({"pos": pos, "meaning": meaning})
    
    return definitions if definitions else None


def build_word(word_id: str, word_data: dict, essays: dict, commentary: dict, override: dict | None) -> dict | None:
    """Build a Word object from sona data, essays, commentary, and overrides."""
    # Merge override into word_data, with override taking priority
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
    
    # Optional fields
    if "creator" in base:
        word_obj["creator"] = base["creator"]
    if "coined_era" in base:
        word_obj["coined_era"] = base["coined_era"]
    
    # Audio
    if "audio" in base:
        audio_list = base["audio"]
        if isinstance(audio_list, list) and len(audio_list) > 0:
            word_obj["audio"] = [
                {"author": a.get("author", ""), "link": a.get("link", "")}
                for a in audio_list
                if isinstance(a, dict) and a.get("link")
            ]
    
    # Etymology
    if "etymology" in base:
        etym_list = base["etymology"]
        if isinstance(etym_list, list) and len(etym_list) > 0:
            filtered_etym = [
                {"word": e.get("word")} 
                for e in etym_list 
                if isinstance(e, dict) and e.get("word")
            ]
            if filtered_etym:
                word_obj["etymology"] = filtered_etym
    
    # Translations (all languages)
    if "pu_verbatim" in base:
        translations = {}
        for lang, text in base["pu_verbatim"].items():
            if lang and text:
                # Remove POS prefix
                clean_text = re.sub(r"^[A-Z]+\s*\(", "(", text)
                translations[lang] = clean_text.strip()
        if translations:
            word_obj["translations"] = translations
    
    # Usage data (ku_data) and ku translations
    if "ku_data" in base and isinstance(base["ku_data"], dict) and base["ku_data"]:
        word_obj["usage_data"] = base["ku_data"]
        # Also add ku translations as comma-separated list for display
        ku_translations = ", ".join(base["ku_data"].keys())
        if "translations" not in word_obj:
            word_obj["translations"] = {}
        word_obj["translations"]["ku"] = ku_translations
    
    # Representations (full object)
    if "representations" in base and isinstance(base["representations"], dict):
        word_obj["representations"] = base["representations"]
    
    # Semantic space from essay
    if word_id in essays:
        word_obj["semantic_space_en"] = essays[word_id]
    
    # Commentary
    if word_id in commentary and commentary[word_id]:
        word_obj["commentary_en"] = commentary[word_id]
    
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


def main():
    """Main execution."""
    overrides_only = "--overrides-only" in sys.argv
    
    if overrides_only:
        print("Rebuilding data.json with overrides only...")
        
        # Load existing data
        words_data = load_existing_data()
        if not words_data:
            print("Error: No words in existing data", file=sys.stderr)
            sys.exit(1)
        
        # Create overrides directory if it doesn't exist
        OVERRIDES_DIR.mkdir(parents=True, exist_ok=True)
        
        # Apply overrides to existing words
        words = []
        for word_id, word_obj in words_data.items():
            override = load_override(word_id)
            if override:
                # Merge override into existing word object and rebuild structured fields
                merged_data = deep_merge(word_obj, override)
                # Rebuild definitions_en from the merged data if pu_verbatim was overridden
                if "pu_verbatim" in override and "en" in override["pu_verbatim"]:
                    definitions_with_pos = parse_definitions_with_pos(merged_data)
                    if definitions_with_pos:
                        word_obj["definitions_en"] = definitions_with_pos
                        # Also update definition_en (single string)
                        word_obj["definition_en"] = extract_english_definition(merged_data)
                # Merge other fields from override
                for key in override:
                    if key not in ["pu_verbatim"]:  # Skip pu_verbatim as we handled it above
                        word_obj[key] = merged_data[key]
            words.append(word_obj)
        
        print(f"Applied overrides to {len(words)} words")
    else:
        print("Starting data generation...")
        
        # Fetch all sources
        words_data = fetch_words_data()
        if not words_data:
            print("Error: No words data found", file=sys.stderr)
            sys.exit(1)
        
        essays = fetch_essays()
        commentary = fetch_commentary()
        
        # Create overrides directory if it doesn't exist
        OVERRIDES_DIR.mkdir(parents=True, exist_ok=True)
        
        # Build all words
        words = []
        for word_id, word_data in words_data.items():
            if not isinstance(word_data, dict):
                continue
            
            override = load_override(word_id)
            word_obj = build_word(word_id, word_data, essays, commentary, override)
            if word_obj:
                words.append(word_obj)
    
    # Sort by word ID for consistency
    words.sort(key=lambda w: w["id"])
    
    # Write output
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(words, f, indent=2, ensure_ascii=False)
    
    print(f"Success! Generated {len(words)} words to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
