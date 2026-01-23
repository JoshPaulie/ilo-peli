# Dynamic data generation

Currently, all of the data is static and hardcoded. We need a way to dynamically load and compile new data.json files for when upstream data changes or new data is added.

Ideally I run a python script via `uv` which fetches this data, processes it, and outputs a new src/data.json file. This will be ran manually I see fit. The site simply reads from data.json as normal.

Note that we will fundamentally be rewriting the data.json structure, as we want our data to be similar to the upstream source structure for easier updates.

Some words will have hardcoded files to override or supplement upstream data, but most will be directly from upstream.

We have 2 primary sources:
- A github repo which has metadata and definitions for each word
- And a collection of essays which describe the semantic space of MOST words

Reminder that our site is primarily for English speakers learning Toki Pona, so we will exclusively prioritize English definitions and semantic info.

The site will need revised to support this new data structure.

## The github repo

- Repo link: https://github.com/lipu-linku/
- Primary data structure: TOML

The github repo is our primary source with lots of details, all of which are in the `words/` folder.

Each word is defined in `words/source/definitions.toml`, and is structured like so:

```toml
a = "(interjection) ah, oh, ha, eh, um, oy; (particle) [placed after something for emphasis or emotion]"
akesi = "reptile, amphibian, scaly creature, crawling creature"
ala = "not, nothing, no; (particle) [negates a word or phrase]; (particle) [forms a yes-no question]; (number) zero"
alasa = "hunt, forage, search, attempt; (preverb) try to"
...truncated...
```

Each word has a coresponding metadata file in `words/metadata/<>.toml`, e.g. `words/metadata/akesi.toml`:

```toml
#:schema ../../api/generated/word.json
id = "akesi"
author_verbatim = ""
author_verbatim_source = ""
book = "pu"
coined_era = "pre-pu"
coined_year = ""
creator = ["jan Sonja"]
see_also = []
source_language = "Dutch"
usage_category = "core"
word = "akesi"
deprecated = false

[[audio]]
author = "kala Asi"
link = "https://raw.githubusercontent.com/lipu-linku/ijo/main/kalama/kalaasi2023/akesi.mp3"

[[audio]]
author = "jan Lakuse"
link = "https://raw.githubusercontent.com/lipu-linku/ijo/main/kalama/jlakuse/akesi.mp3"

[[etymology]]
word = "hagedis"

[ku_data]
frog = 56
reptile = 96

[pu_verbatim]
de = "NOMEN nichtsüßes Tier; Reptil, Amphibie"
en = "NOUN non-cute animal; reptile, amphibian"
eo = "SUBSTANTIVO reptilio, amfibio"
fr = "NOM animal non-mignon ; reptile, amphibien"

[representations]
ligatures = ["akesi", "akesi2"]
ucsur = "U+F1901"
sitelen_emosi = "🦎"
sitelen_sitelen = "https://raw.githubusercontent.com/lipu-linku/ijo/main/sitelensitelen/jonathangabel/akesi.jpg"
sitelen_jelo = ["🦎", "🐸"]

[usage]
2022-08 = 98
2023-09 = 99
2024-09 = 99
2025-09 = 99

[resources]
sona_pona = "https://sona.pona.la/wiki/akesi"
lipamanka_semantic = "https://lipamanka.gay/essays/dictionary#akesi"
```

## The essays

The essays are hosted on a separate site: https://lipamanka.gay/essays/dictionary

These essays are sections of text, with little uniformity.

We will need to scrape these essays, parse them, and associate them with the relevant words.

Here's an example essay for the word "akesi":

```html
<details open="">
    <summary id="akesi">akesi<a class="headerlink" href="#akesi" title="Link to this heading">¶</a></summary>
        <p>
            akesi are creatures. they tend to be cold to the touch. When they move quickly, they go back and forth on sprawling legs or slither or squirm back and forth across the ground if they lack legs. They're close to the ground. They usually lay eggs. The contents of this semantic space is based off of a pilot study I conducted in 2023 with sample size 98 about the lexical semantics of akesi.
        </p>
</details>
```
