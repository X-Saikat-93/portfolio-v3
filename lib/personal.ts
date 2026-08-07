// Saikat's public profile registry. Keep this file limited to facts verified
// in the public resume or supplied by the owner.

export interface Experience {
  company: string
  companyEn: string
  role: string
  roleEn?: string
  from: string
  to?: string
  url?: string
}

export const experience: Experience[] = [
  {
    company: 'Human Before Resource',
    companyEn: 'Human Before Resource',
    role: 'Software Developer',
    roleEn: 'Software Developer',
    from: 'Jan 2026',
  },
  {
    company: 'CE Testing Company',
    companyEn: 'CE Testing Company',
    role: 'Junior Engineer (Design)',
    roleEn: 'Junior Engineer (Design)',
    from: 'Nov 2024',
    to: 'Nov 2025',
  },
  {
    company: 'Freelance',
    companyEn: 'Freelance',
    role: 'Full-Stack Engineer',
    roleEn: 'Full-Stack Engineer',
    from: 'Feb 2024',
    to: 'Aug 2024',
  },
]

export interface Record_ {
  artist: string
  album: string
  year: number
  genre: string
  spineColor: string
  spineInk: string
  url?: string
  art?: string
}

export interface Book {
  title: string
  author: string
  year: number
  category: string
  spineTitle?: string
  spineAuthor?: string
  spineColor: string
  spineInk: string
  art?: string
  coverWidth?: number
  coverHeight?: number
  spine?: number
  url?: string
}

// These collections intentionally start empty. The admin CMS can publish
// real items later; the public site must not invent favorites.
export const records: Record_[] = []
export const books: Book[] = []
