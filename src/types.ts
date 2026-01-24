export interface Word {
  id: string
  word: string
  usage_category: string
  source_language?: string
  definition_en: string
  definitions_en?: Array<{ pos: string; meaning: string }>
  pu_verbatim_en?: Array<{ pos: string; meaning: string }>
  semantic_space_en?: string
  commentary_en?: string
  pos?: string[]
  emoji?: string
  sitelen_sitelen?: string
  creator?: string[]
  audio?: { author: string; link: string }[]
  etymology?: { word?: string }[]
  coined_era?: string
  translations?: Record<string, string>
  usage_data?: Record<string, number>
  usage?: Record<string, number>
  deprecated?: boolean
  representations?: {
    ligatures?: string[]
    ucsur?: string
    sitelen_emosi?: string
    sitelen_sitelen?: string
    sitelen_jelo?: string[]
  }
}

export type SpeakerMode = 'random' | 'alternating' | 'specific'

export const VOWEL_DATA = [
  { vowel: 'a', pronunciation: 'ah', examples: "like 'spa' and 'haha'" },
  { vowel: 'e', pronunciation: 'eh', examples: "like 'let' and 'mess'" },
  { vowel: 'i', pronunciation: 'ee', examples: "like 'key' and 'seem'" },
  { vowel: 'o', pronunciation: 'oh', examples: "like 'toe' and 'know'" },
  { vowel: 'u', pronunciation: 'oo', examples: "like 'tooth' and 'mood'" },
]
