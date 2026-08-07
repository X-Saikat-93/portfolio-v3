export const publicPageMetadata = {
  home: {
    zh: {
      title: 'Saikat Das',
      description: 'Product Engineer building reliable web products end to end.',
      ogDescription: 'Product Engineer building reliable web products end to end.',
    },
    en: {
      title: 'Saikat Das',
      description: 'Product Engineer building reliable web products end to end.',
      ogDescription: 'Product Engineer building reliable web products end to end.',
    },
  },
  blog: {
    zh: { title: 'Writing', description: 'Writing by Saikat Das.' },
    en: { title: 'Writing', description: 'Writing by Saikat Das.' },
  },
  photos: {
    zh: { title: 'Photos', description: 'A collection of photographs by Saikat Das.' },
    en: { title: 'Photos', description: 'A collection of photographs by Saikat Das.' },
  },
  books: {
    zh: { title: 'Books', description: 'Books Saikat Das is reading, keeping, or recommending.' },
    en: { title: 'Books', description: 'Books Saikat Das is reading, keeping, or recommending.' },
  },
  music: {
    zh: { title: 'Music', description: 'Music Saikat Das is listening to and returning to.' },
    en: { title: 'Music', description: 'Music Saikat Das is listening to and returning to.' },
  },
  projects: {
    zh: {
      title: 'Projects',
      description: 'Products, tools, and experiments built by Saikat Das.',
    },
    en: {
      title: 'Projects',
      description: 'Products, tools, and experiments built by Saikat Das.',
    },
  },
} as const

export type PublicSection = Exclude<keyof typeof publicPageMetadata, 'home'>
