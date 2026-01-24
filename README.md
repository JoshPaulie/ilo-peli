# ilo Peli

A simple flashcard app for drilling Toki Pona vocabulary

Heavily (heavily) inspired by [nimi.li](https://nimi.li)

## Data Sources & Generation

Word data is dynamically generated from the following sources:

- [lipu-linku/sona](https://github.com/lipu-linku/sona) - word definitions, etymology, commentary, pronunciation samples, and more
- [lipamanka.gay/essays/dictionary](https://lipamanka.gay/essays/dictionary) - excellent essays explaining the semantic space descriptions of most words

### Updating Data

Data is generated and served statically with the site, meaning changes "upstream" aren't reflected until a new file is generated and pushed to the repo
