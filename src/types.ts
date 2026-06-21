export type ViewKey = 'discover' | 'ranking' | 'categories' | 'topics' | 'favorites' | 'about'
export type SortKey = 'score' | 'stars' | 'recent'

export interface SkillMedia {
  socialPreview: string
  videoUrl: string
}

export interface Skill {
  rank: number
  id: number
  name: string
  fullName: string
  owner: string
  avatarUrl: string
  url: string
  homepage: string
  description: string
  summary: string
  category: string
  categoryDescription: string
  scenarios: string[]
  howToUse: string
  installCommand: string
  language: string
  license: string
  stars: number
  forks: number
  openIssues: number
  score: number
  activity: string
  pushedAt: string
  updatedAt: string
  createdAt: string
  sourceTopics: string[]
  repoTopics: string[]
  media: SkillMedia
  readmeUrl: string
}

export interface TopicItem {
  name: string
  displayName: string
  description: string
  url: string
}

export interface SkillData {
  meta: {
    generatedAt: string
    query: string
    topicPages: number
    repositories: number
    sourceTopics: number
    updateMode: string
    tokenCost: number
  }
  topicPages: Array<{ page: number; topics: TopicItem[] }>
  sourceTopics: Array<{ name: string; url: string }>
  categories: Array<{ name: string; description: string; count: number }>
  skills: Skill[]
}
