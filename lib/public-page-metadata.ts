// Page copy in one place. `title` is the search and share title (the root
// layout appends "| Saikat Das"), `heading` the visible h1 and social card
// headline, `description` the meta description, `lede` the line under the
// h1. The public site is English only; `zh` carries the same copy for the
// legacy locale routes.
function english<const T>(copy: T) {
  return { zh: copy, en: copy }
}

export const publicPageMetadata = {
  home: english({
    title: 'Saikat Das | Full-Stack Software Engineer',
    description:
      'Saikat Das is a full-stack software engineer in India building web products, APIs, and data systems with Node.js, React, Next.js, PostgreSQL, and Redis.',
    // what the home social card prints (lib/og-image.tsx); its alt reads the same
    ogKicker: 'Full-Stack Software Engineer',
    ogHeading: 'I build software that stays calm on a bad network.',
    ogDescription: 'Web products, APIs, and data systems, from architecture to production.',
  }),
  blog: english({
    title: 'Writing on AI Systems and Software Engineering',
    heading: 'Writing',
    description:
      'Essays by Saikat Das on AI systems, agents, inference infrastructure, distributed and data systems, and building web products.',
    lede: 'Essays on AI systems, agents and inference, distributed and data systems, and building web products.',
  }),
  photos: english({
    title: 'Photos',
    heading: 'Photos',
    description: 'A collection of photographs from Saikat Das.',
    lede: 'A collection of photographs.',
  }),
  books: english({
    title: 'Books on Software Design, Architecture, and AI',
    heading: 'Books',
    description: 'The books on Saikat Das’s shelf: software design, architecture, data systems, and AI engineering.',
    lede: 'What is on my shelf: software design, architecture, data systems, and AI engineering.',
  }),
  music: english({
    title: 'Music',
    heading: 'Music',
    description: 'Records Saikat Das keeps playing, each with a link to listen.',
    lede: 'Records I keep playing, each with a link to listen.',
  }),
  projects: english({
    title: 'Projects and Case Studies',
    heading: 'Projects',
    description:
      'Production software and open-source projects by Saikat Das, with case studies on Zaruro, a home-services marketplace, and a recruitment platform.',
    lede: 'Production software and open-source work I have built.',
  }),
  now: english({
    title: 'Now: Current Work and Reading',
    heading: 'Now',
    description:
      'Saikat Das’s now page: current projects, what is being learned and read, and the kind of collaboration that is welcome.',
    lede: 'What I am building, learning, and reading at the moment, and the work I am open to.',
  }),
  resume: english({
    title: 'Resume: Full-Stack Software Engineer',
    heading: 'Resume',
    description:
      'Resume of Saikat Das, full-stack software engineer working with Node.js, PostgreSQL, Redis, React, Next.js, and Docker. Based in India, open to remote work.',
  }),
  contact: english({
    title: 'Contact',
    heading: 'Contact',
    description: 'Contact Saikat Das about a project, a role, or a question, through the form or by email.',
    lede: 'Write about a project, a role, or a question. Messages come straight to me, and replies go to the email you leave.',
  }),
  uses: english({
    title: 'Uses: Tools, Stack, and Services',
    heading: 'Uses',
    description: 'The languages, tools, and services Saikat Das works with every day, and the stack this portfolio runs on.',
    lede: 'The languages, tools, and services I work with, and what this site runs on.',
  }),
  privacy: english({
    title: 'Privacy Policy',
    heading: 'Privacy policy',
    description:
      'How Saikat Das’s portfolio handles contact messages, analytics, browser preferences, and service providers.',
    lede: 'What this site collects when you browse it or send a message, and why.',
  }),
  terms: english({
    title: 'Terms of Use',
    heading: 'Terms of use',
    description:
      'The terms for using Saikat Das’s portfolio: reading and sharing the writing, reusing content and code samples, and the contact form.',
    lede: 'How you may use this site and its writing, and what it promises in return.',
  }),
  credits: english({
    title: 'Credits and Licences',
    heading: 'Credits and licences',
    description:
      'The fonts, open-source software, artwork, and services behind Saikat Das’s portfolio, with the owner and licence of each.',
    lede: 'The type, code, artwork, and services this site is built on, and the licence each one comes under.',
  }),
} as const

export type PublicSection = Exclude<keyof typeof publicPageMetadata, 'home'>
