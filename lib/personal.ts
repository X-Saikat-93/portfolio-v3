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
  title: 'Product Engineer',
  email: 'ibx.saikat37@gmail.com',
  phone: '+91 93826 69410',
  location: 'India (Open to Remote)',
  portfolioUrl: 'https://xsaikat.vercel.app',
  githubUrl: 'https://github.com/X-Saikat-93',
  summary:
    'Full-stack engineer who owns products end to end rather than working off a ticket queue. Currently the sole technical owner of a live home-services marketplace covering bookings, payments, worker operations, and real-time updates, built on Node.js, PostgreSQL, and Redis with a Next.js frontend. Also built a recruitment platform handling 100K+ candidate records for a high-volume hiring team. Comes from a civil engineering background, which shows up in how migrations, backups, and rollback plans get treated as part of the job rather than an afterthought.',
  skills: [
    {
      label: 'Languages',
      items: ['JavaScript (ES6+)', 'TypeScript', 'SQL', 'HTML5', 'CSS3'],
    },
    {
      label: 'Frontend',
      items: [
        'React',
        'Next.js',
        'React Native',
        'Tailwind CSS',
        'shadcn/ui',
        'Redux',
        'TanStack Query',
        'responsive design',
      ],
    },
    {
      label: 'Backend',
      items: [
        'Node.js',
        'Express',
        'REST APIs',
        'Socket.io',
        'JWT/OAuth 2.0',
        'Zod validation',
        'webhooks',
        'background jobs',
      ],
    },
    {
      label: 'Databases',
      items: ['PostgreSQL', 'Drizzle ORM', 'Redis', 'database design', 'query optimization', 'indexing'],
    },
    {
      label: 'DevOps & Tools',
      items: [
        'Docker',
        'Git/GitHub',
        'GitHub Actions',
        'CI/CD',
        'NGINX',
        'PM2',
        'Postman',
        'Linux/VPS administration',
        'AWS',
      ],
    },
    {
      label: 'Testing',
      items: ['Jest', 'Vitest', 'API testing', 'debugging', 'performance optimization'],
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
          stack: 'Node.js, Express, React/Next.js, PostgreSQL, Drizzle ORM, Redis, React Native',
          bullets: [
            'Sole technical owner of a consumer-facing home-services marketplace end to end, covering booking, checkout, payments, and post-service workflows across web, mobile, and a shared backend API.',
            'Built the Node.js/Express backend with PostgreSQL, Drizzle ORM, and Redis, delivering 50+ API routes for authentication, payments, notifications, and booking state, with Socket.io for real-time updates.',
            'Implemented Redis-backed event delivery and background job processing to keep data consistent across web and mobile clients.',
            'Rebuilt the customer-facing frontend in React and Next.js with a server-first architecture, responsive checkout flow, and accessible UI components.',
            'Own deployment operations for a five-application monorepo: Docker services, automated type-check/lint gates, and documented rollback procedures.',
            'Set engineering standards for the codebase, including an Express 4-to-5 migration and centralized dependency management.',
          ],
        },
        {
          name: 'Recruitment ATS — Candidate Management Platform',
          stack: 'React/Next.js, Node.js, PostgreSQL, Drizzle ORM, Redis, Docker',
          bullets: [
            'Built a recruitment platform covering candidate intake, pipeline tracking, search, interview scheduling, evaluation, and reporting for high-volume hiring.',
            'Designed the PostgreSQL/Drizzle data layer for 100K+ candidate records, using targeted indexes, cursor pagination, materialized views, and Redis caching to keep common queries fast.',
            'Added an AI-assisted candidate evaluation feature (Google Gemini API) and operated the platform in production with Docker Compose, NGINX, PM2, versioned migrations, and automated backups.',
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
            'Produced technical drawings and documentation for railway infrastructure projects across two regional zones, with strict revision control and cross-team coordination under deadlines.',
          ],
        },
      ],
    },
    {
      title: 'Freelance Full-Stack Engineer',
      company: 'Independent',
      period: 'Feb 2024 – Aug 2024',
      projects: [
        {
          name: 'Client web applications',
          stack: '',
          bullets: [
            'Delivered client web applications end to end, from requirements and UI design through API development, database setup, testing, and VPS deployment.',
            'Built subscription billing features including invoicing, payment retries, dunning, and usage reporting for a SaaS client.',
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
    'HackerRank Problem Solving (Certified)',
    'Databricks Certifications',
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
