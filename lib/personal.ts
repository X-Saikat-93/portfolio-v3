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

// Resume facts transcribed from the owner-supplied resume PDF. Keep this
// registry separate from the shorter homepage experience list so the HTML
// resume can stay complete without changing the homepage rhythm.
export const resumeProfile = {
  name: 'Saikat Das',
  title: 'Full-Stack Software Engineer',
  headline: 'Node.js · PostgreSQL · Redis · React/Next.js · Docker',
  email: 'ibx.saikat37@gmail.com',
  phone: '+91 93xxxxxxxx0',
  location: 'India (Open to Remote)',
  portfolioUrl: 'https://xsaikat.vercel.app',
  githubUrl: 'https://github.com/X-Saikat-93',
  skills: [
    {
      label: 'Languages',
      items: ['JavaScript (ES6+)', 'TypeScript', 'Python','Go', 'SQL', 'HTML5', 'CSS3'],
    },
    {
      label: 'Frontend',
      items: [
        'React',
        'Next.js',
        'React Native',
        'Redux',
        'Zustand',
        'TanStack Query',
        'React Hook Form',
        'Zod',
        'Tailwind CSS',
        'shadcn/ui',
        'Radix UI',
        'Framer Motion',
        'Vite',
        'Storybook',
      ],
    },
    {
      label: 'Backend & APIs',
      items: [
        'Node.js',
        'Express',
        'FastAPI',
        'Socket.io',
        'REST APIs',
        'GraphQL',
        'OpenAPI/Swagger',
        'JWT',
        'Webhooks',
        'Prisma',
        'Drizzle ORM',
        'Pydantic',
      ],
    },
    {
      label: 'Data & Search',
      items: ['PostgreSQL', 'Redis', 'MongoDB', 'Elasticsearch', 'OpenSearch', 'pgvector'],
    },
    {
      label: 'Cloud & Infrastructure',
      items: [
        'Docker',
        'Docker Compose',
        'GitHub Actions',
        'NGINX',
        'PM2',
        'Linux',
        'AWS EC2',
        'AWS S3',
      ],
    },
    {
      label: 'Architecture & Patterns',
      items: [
        'Event-driven design (Socket.io, Redis Pub/Sub)',
        'idempotent request handling',
        'transactional outbox pattern',
        'cursor-based pagination',
        'materialized views',
      ],
    },
    {
      label: 'Testing',
      items: ['Jest', 'Vitest', 'Supertest', 'Playwright', 'React Testing Library', 'Postman'],
    },
  ],
  experience: [
    {
      title: 'Software Developer (SDE)',
      company: 'Human Before Resource Pvt. Ltd.',
      period: 'Jan 2026 – Present',
      projects: [
        {
          name: 'Zaruro — Home-Services Marketplace',
          url: 'https://zaruro.com',
          stack: 'Node.js, Express, React/Next.js, PostgreSQL, Drizzle ORM, Redis, React Native',
          bullets: [
            'Web and mobile clients could drift out of sync on booking status after a dropped connection. Rebuilt that flow around Socket.io and Redis Pub/Sub with idempotent retries, so a client catches up on reconnect instead of polling the API on a timer.',
            'Own 50+ Express routes spanning auth, payments, notifications, booking state, and reconciliation between payment webhooks and internal records.',
            'Added push notifications alongside the existing Socket.io channel, since a customer with the app closed still needs to know their booking status changed.',
            'Migrated the backend from Express 4 to Express 5, updating every middleware and error handler whose behavior changed between versions.',
            'Rebuilt the customer frontend in Next.js with server-side rendering and an SEO layer, since most new customers were arriving through search rather than the app directly, plus the checkout flow through payment confirmation.',
            "Deploys the marketplace's five-app monorepo: Docker images, type-check and lint gates before merge, and a rollback path that's actually been tested, not just documented.",
          ],
        },
        {
          name: 'Recruitment ATS — Internal Hiring Platform',
          url: 'https://hire.humanbeforeresource.com',
          stack: 'React/Next.js, Node.js, PostgreSQL, Drizzle ORM, Redis, Docker',
          bullets: [
            'Built candidate intake, pipeline, search, and reporting on top of 100K+ Postgres records, with materialized views handling dashboard aggregation instead of hitting the live tables on every load.',
            'Swapped offset pagination for cursor pagination on candidate search once the table passed 100K rows and offset queries started slowing down.',
            'Added a Gemini-based summary generator that gives recruiters a structured evaluation to start from instead of a blank notes field.',
            "Runs on Docker Compose, NGINX, and PM2, separate from the marketplace's deployment pipeline, with its own migrations, backups, and recovery steps.",
          ],
        },
      ],
    },
  ],
  additionalExperience: [
    {
      title: 'Freelance Full-Stack Engineer',
      company: 'Independent',
      period: 'Feb 2024 – Aug 2024',
      projects: [
        {
          name: 'Client web applications',
          stack: '',
          bullets: [
            'Built client web applications covering UI, REST APIs, database schema, and VPS deployment.',
            'Built subscription billing workflows including invoicing, payment retries, dunning, and usage reporting for a SaaS client.',
          ],
        },
      ],
    },
    {
      title: 'Junior Engineer (Design)',
      company: 'CE Testing Company Pvt. Ltd.',
      period: 'Nov 2024 – Nov 2025',
      projects: [
        {
          name: 'Railway infrastructure design',
          stack: '',
          bullets: [
            'Produced technical drawings and documentation for railway infrastructure projects across two regional zones (SER and NER) under revision control and fixed deadlines.',
          ],
        },
      ],
    },
  ],
  education: [
    {
      title: 'B.Tech in Civil Engineering',
      institution: 'Mallabhum Institute of Technology',
      period: '2021 – 2024',
    },
    {
      title: 'Diploma in Civil Engineering',
      institution: 'Jangipur Government Polytechnic',
      period: '2018 – 2021',
    },
  ],
  certifications: [
    'Meta Front-End Developer Professional Certificate',
  ],
} as const

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
