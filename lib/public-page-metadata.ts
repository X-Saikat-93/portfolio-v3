export const publicPageMetadata = {
  home: {
    zh: {
      title: 'Saikat Das | Full-Stack Product Engineer',
      description:
        'Saikat Das is a full-stack product engineer building reliable web products, APIs, and data systems with Node.js, React, Next.js, PostgreSQL, and Redis.',
      ogDescription:
        'Saikat Das is a full-stack product engineer building reliable web products, APIs, and data systems with Node.js, React, Next.js, PostgreSQL, and Redis.',
    },
    en: {
      title: 'Saikat Das | Full-Stack Product Engineer',
      description:
        'Saikat Das is a full-stack product engineer building reliable web products, APIs, and data systems with Node.js, React, Next.js, PostgreSQL, and Redis.',
      ogDescription:
        'Saikat Das is a full-stack product engineer building reliable web products, APIs, and data systems with Node.js, React, Next.js, PostgreSQL, and Redis.',
    },
  },
  blog: {
    zh: {
      title: 'Writing',
      description: 'Senior engineering notes on AI systems, data architecture, real-time software, product design, and reliable web applications.',
    },
    en: {
      title: 'Writing',
      description: 'Senior engineering notes on AI systems, data architecture, real-time software, product design, and reliable web applications.',
    },
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
      description: 'Production software and open-source projects built by Saikat Das, including Zaruro and a recruitment operations platform.',
    },
    en: {
      title: 'Projects',
      description: 'Production software and open-source projects built by Saikat Das, including Zaruro and a recruitment operations platform.',
    },
  },
  now: {
    zh: {
      title: 'Now',
      description: 'A current snapshot of what Saikat Das is building, learning, reading, and open to.',
    },
    en: {
      title: 'Now',
      description: 'A current snapshot of what Saikat Das is building, learning, reading, and open to.',
    },
  },
  resume: {
    zh: {
      title: 'Resume',
      description: 'Resume for Saikat Das, Full-Stack Software Engineer.',
    },
    en: {
      title: 'Resume',
      description: 'Resume for Saikat Das, Full-Stack Software Engineer.',
    },
  },
  contact: {
    zh: {
      title: 'Contact',
      description: 'Send a private message to Saikat Das.',
    },
    en: {
      title: 'Contact',
      description: 'Send a private message to Saikat Das.',
    },
  },
  uses: {
    zh: {
      title: 'Uses',
      description: 'The tools, stack, and services Saikat Das works with, and what this site is built on.',
    },
    en: {
      title: 'Uses',
      description: 'The tools, stack, and services Saikat Das works with, and what this site is built on.',
    },
  },
  privacy: {
    zh: {
      title: 'Privacy policy',
      description:
        'How Saikat Das’s portfolio handles contact messages, analytics, browser preferences, and service providers.',
    },
    en: {
      title: 'Privacy policy',
      description:
        'How Saikat Das’s portfolio handles contact messages, analytics, browser preferences, and service providers.',
    },
  },
} as const

export type PublicSection = Exclude<keyof typeof publicPageMetadata, 'home'>
