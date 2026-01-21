export interface Word {
  id: string
  word: string
  usage: string
  source: string
  definition: string
  semantic_space: string
  pos?: string[]
  emoji?: string
  sitelen_sitelen?: string
  creator?: string[]
  audio?: { author: string; link: string }[]
  etymology?: { word?: string; definition?: string }[]
  coined_era?: string
  translations?: Record<string, string>
  usage_percentages?: Record<string, number>
}

export type SpeakerMode = 'random' | 'alternating' | 'specific'

export const VOWEL_DATA = [
  { vowel: 'a', pronunciation: 'ah', examples: "like 'spa' and 'haha'" },
  { vowel: 'e', pronunciation: 'eh', examples: "like 'let' and 'mess'" },
  { vowel: 'i', pronunciation: 'ee', examples: "like 'key' and 'seem'" },
  { vowel: 'o', pronunciation: 'oh', examples: "like 'toe' and 'know'" },
  { vowel: 'u', pronunciation: 'oo', examples: "like 'tooth' and 'mood'" },
]
