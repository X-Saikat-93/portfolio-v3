export interface ProjectLink {
  label: string
  url: string
  kind: 'live' | 'source'
}

export interface ProjectNote {
  title: string
  body: string
}

export interface ProjectCaseStudy {
  heroImagePublicId?: string | null
  heroImageAlt?: string
  framing: string
  challenge: string
  ownership: readonly string[]
  proof: readonly { label: string; value: string }[]
  decisions: readonly ProjectNote[]
  evidence: readonly string[]
  boundary: string
}

export interface Project {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn?: string
  url: string
  domain: string
  category: string
  status: string
  role: string
  scope: string
  stack: string[]
  capabilities: string[]
  overview: string[]
  notes: ProjectNote[]
  flow: string[]
  links: ProjectLink[]
}

export type ProjectWithCaseStudy = Project & { caseStudy?: ProjectCaseStudy }

// Project copy is grounded in Saikat's public repositories, the two local
// production codebases, and his resume. Sparse public repositories stay
// sparse here rather than being padded with unverified product claims.
export const projects: Project[] = [
  {
    id: 'zaruro',
    name: 'Zaruro',
    nameEn: 'Zaruro',
    description:
      'A home-services marketplace spanning customer and worker web/mobile apps, booking, checkout, payments, verification, and real-time operations.',
    url: 'https://zaruro.com',
    domain: 'zaruro.com',
    category: 'Home-services platform',
    status: 'Live',
    role: 'Sole technical owner',
    scope: 'Customer, worker, and operations',
    stack: [
      'Next.js',
      'React Native',
      'Node.js',
      'Express',
      'PostgreSQL',
      'Drizzle ORM',
      'Redis',
      'Socket.IO',
    ],
    capabilities: [
      'Customer and worker onboarding',
      'Service discovery, booking, and checkout',
      'Payments and post-service workflows',
      'Background verification and admin operations',
      'Real-time operational updates',
    ],
    overview: [
      'Zaruro is a home-services marketplace built around two operational sides: customers booking and paying for services, and workers moving through verification, assignment, delivery, and post-service workflows.',
      'As sole technical owner, Saikat built a multi-application system around a Node.js and Express API, PostgreSQL through Drizzle ORM, Redis, Next.js clients, Expo mobile applications, and Socket.IO for live operational updates.',
    ],
    notes: [
      {
        title: 'Shared marketplace state',
        body: 'Customer, worker, admin, and background-verification surfaces use the same service and data layer so booking and fulfilment state stays aligned.',
      },
      {
        title: 'Live operations',
        body: 'Socket.IO carries real-time updates while PostgreSQL remains the system of record and Redis supports fast-moving operational state.',
      },
      {
        title: 'Multi-surface delivery',
        body: 'The monorepo brings web, Expo mobile, API, and operational applications under one build and type-check workflow.',
      },
    ],
    flow: ['Discover', 'Book', 'Pay', 'Assign', 'Complete'],
    links: [{ label: 'Visit Zaruro', url: 'https://zaruro.com', kind: 'live' }],
  },
  {
    id: 'human-before-resource-ats',
    name: 'Human Before Resource ATS',
    nameEn: 'Human Before Resource ATS',
    description:
      'A recruitment operations platform for candidate intake, pipeline search, interview scheduling, AI-assisted evaluation, and reporting across 100K+ records.',
    url: 'https://hire.humanbeforeresource.com',
    domain: 'hire.humanbeforeresource.com',
    category: 'Recruitment operations',
    status: 'Live',
    role: 'Product engineer',
    scope: 'Candidate data and hiring operations',
    stack: [
      'Next.js',
      'TypeScript',
      'PostgreSQL',
      'Drizzle ORM',
      'Redis',
      'Clerk',
      'React Query',
    ],
    capabilities: [
      'Candidate intake and spreadsheet import',
      'Pipeline search, assignment, and bulk operations',
      'Interview scheduling and follow-up workflows',
      'AI-assisted candidate evaluation',
      'Operational dashboards and regional reporting',
    ],
    overview: [
      'Human Before Resource ATS centralizes candidate intake, search, assignment, interviews, evaluation, and operational reporting across more than 100,000 candidate records.',
      'The application combines Next.js API routes with PostgreSQL, Drizzle ORM, Redis caching, server-side role controls, indexed search, virtualized tables, and background operational jobs.',
    ],
    notes: [
      {
        title: 'Large-result ergonomics',
        body: 'Targeted database indexes, cursor-based access patterns, caching, and virtual scrolling keep large candidate result sets usable.',
      },
      {
        title: 'Access at the server boundary',
        body: 'Authentication and role checks protect CEO, manager, recruiter, national, and regional views before operational data reaches the interface.',
      },
      {
        title: 'Repeatable operations',
        body: 'Database setup, migrations, scheduled follow-ups, inactive-assignment checks, and deployment paths live alongside the product code.',
      },
    ],
    flow: ['Intake', 'Normalize', 'Search', 'Interview', 'Evaluate'],
    links: [
      {
        label: 'Open the ATS',
        url: 'https://hire.humanbeforeresource.com',
        kind: 'live',
      },
    ],
  },
  {
    id: 'jobpulse',
    name: 'JobPulse',
    nameEn: 'JobPulse',
    description:
      'A Python workflow for personalized job outreach with Gemini, Groq fallback, Gmail delivery, previews, rate limits, and duplicate protection.',
    url: 'https://github.com/X-Saikat-93/JobPulse',
    domain: 'github.com',
    category: 'AI automation',
    status: 'Public repository',
    role: 'Creator',
    scope: 'Personalized job outreach',
    stack: ['Python', 'Gemini', 'Groq', 'Gmail SMTP', 'CSV'],
    capabilities: [
      'Structured contact intake from CSV',
      'Gemini generation with a Groq fallback',
      'Resume attachments and Gmail-safe HTML',
      'Dry-run previews and placeholder validation',
      'Rate-limited sending with duplicate prevention',
    ],
    overview: [
      'JobPulse turns a structured list of hiring contacts into personalized job-application emails. It generates the message, attaches a resume, and delivers through Gmail SMTP.',
      'The repository treats outbound automation as a guarded pipeline: messages can be rendered in dry-run mode, placeholders are validated, sending is rate-limited, and a sent log prevents duplicate outreach.',
    ],
    notes: [
      {
        title: 'Model fallback',
        body: 'Gemini is the primary generation path; Groq is available as a fallback when the primary model cannot complete the request.',
      },
      {
        title: 'Delivery guardrails',
        body: 'HTML previews, placeholder checks, rate limiting, and sent-log lookups add explicit checks before and after delivery.',
      },
    ],
    flow: ['Contacts CSV', 'Prompt', 'Gemini / Groq', 'Gmail SMTP', 'Sent log'],
    links: [
      {
        label: 'View source',
        url: 'https://github.com/X-Saikat-93/JobPulse',
        kind: 'source',
      },
    ],
  },
  {
    id: 'cloudrack',
    name: 'cloudrack',
    nameEn: 'cloudrack',
    description:
      'An early TypeScript and Next.js interface concept for accessing cloud-hosted files from one place.',
    url: 'https://github.com/X-Saikat-93/cloudrack',
    domain: 'github.com',
    category: 'Cloud file interface',
    status: 'Prototype',
    role: 'Creator',
    scope: 'Web application foundation',
    stack: ['Next.js', 'TypeScript', 'React', 'Zod', 'React Hook Form'],
    capabilities: [
      'Typed Next.js application foundation',
      'Schema-backed form primitives',
      'Accessible dialog, menu, and select primitives',
    ],
    overview: [
      'cloudrack is positioned as an anytime interface for cloud-hosted files, with a TypeScript and Next.js foundation.',
      'The public branch is still at scaffold stage. This record therefore documents the interface foundation without claiming storage-provider integrations that are not present in the repository.',
    ],
    notes: [],
    flow: [],
    links: [
      {
        label: 'View source',
        url: 'https://github.com/X-Saikat-93/cloudrack',
        kind: 'source',
      },
    ],
  },
  {
    id: 'teamsync',
    name: 'teamsync',
    nameEn: 'teamsync',
    description:
      'A workspace collaboration application with authentication, channels, members, messages, join codes, and file uploads.',
    url: 'https://github.com/X-Saikat-93/teamsync',
    domain: 'github.com',
    category: 'Team collaboration',
    status: 'Public repository',
    role: 'Creator',
    scope: 'Workspace communication',
    stack: ['Next.js', 'TypeScript', 'Convex', 'Convex Auth', 'Jotai', 'Quill'],
    capabilities: [
      'Authenticated workspaces and member records',
      'Create, update, join, leave, and remove workspace flows',
      'Channel creation and management',
      'Messages and generated upload URLs',
      'Shareable and renewable workspace join codes',
    ],
    overview: [
      'teamsync organizes collaboration into authenticated workspaces, channels, members, messages, and uploads. Workspace join codes support invitation and onboarding flows.',
      'The client is arranged by product feature, while Convex supplies the application data layer and authentication integration.',
    ],
    notes: [
      {
        title: 'Feature-scoped client',
        body: 'Authentication, workspaces, channels, members, messages, and uploads each own their API hooks, components, and local state.',
      },
      {
        title: 'Workspace lifecycle',
        body: 'The repository covers creation, joining, leaving, updating, removal, and join-code renewal rather than treating a workspace as a static container.',
      },
    ],
    flow: ['Sign in', 'Join workspace', 'Open channel', 'Send message', 'Share file'],
    links: [
      {
        label: 'View source',
        url: 'https://github.com/X-Saikat-93/teamsync',
        kind: 'source',
      },
    ],
  },
  {
    id: 'eduspark',
    name: 'eduspark',
    nameEn: 'eduspark',
    description:
      'A generative-AI course builder that creates structured chapters, enriches them with videos, and stores the resulting learning material.',
    url: 'https://github.com/X-Saikat-93/eduspark',
    domain: 'github.com',
    category: 'AI course builder',
    status: 'Public repository',
    role: 'Creator',
    scope: 'Generated learning content',
    stack: [
      'Next.js',
      'TypeScript',
      'Gemini',
      'Neon Postgres',
      'Drizzle ORM',
      'Firebase',
      'Clerk',
    ],
    capabilities: [
      'Topic, category, and course-option intake',
      'AI-generated course outlines and chapter content',
      'Structured explanations and code examples',
      'YouTube enrichment for generated chapters',
      'Authenticated course dashboard and editing',
    ],
    overview: [
      'eduspark turns a learner-supplied topic into a course outline and generated chapter material. The course flow includes configuration, review, editing, generation, and a dedicated study view.',
      'Chapter work runs in parallel: the application asks Gemini for structured explanations and code examples, finds a related YouTube video, then stores each chapter against the course record.',
    ],
    notes: [
      {
        title: 'Structured model output',
        body: 'Generation prompts request JSON fields for titles, explanations, and code examples so model output can be rendered as product data.',
      },
      {
        title: 'Parallel chapter pipeline',
        body: 'Chapter generation, video lookup, and persistence are dispatched per chapter and coordinated with Promise.all.',
      },
      {
        title: 'Persistence split',
        body: 'Course records use Neon Postgres through Drizzle ORM, while the repository includes a separate Firebase upload path for files.',
      },
    ],
    flow: ['Topic', 'Outline', 'Generate', 'Enrich', 'Study'],
    links: [
      {
        label: 'View source',
        url: 'https://github.com/X-Saikat-93/eduspark',
        kind: 'source',
      },
    ],
  },
  {
    id: 'talent-orbit',
    name: 'talent-orbit',
    nameEn: 'talent-orbit',
    description:
      'A MERN professional network with profiles, posts, connection requests, notifications, image handling, and email flows.',
    url: 'https://github.com/X-Saikat-93/talent-orbit',
    domain: 'github.com',
    category: 'Professional network',
    status: 'Public repository',
    role: 'Creator',
    scope: 'Full-stack social product',
    stack: ['React', 'Vite', 'Express', 'MongoDB', 'Tailwind CSS', 'Cloudinary'],
    capabilities: [
      'Authentication and user profiles',
      'Posts and post interactions',
      'Connection requests and network views',
      'Notifications and transactional email templates',
      'Cloudinary-backed media handling',
    ],
    overview: [
      'talent-orbit is a MERN-stack professional network. Its product surfaces cover profiles, a post feed, connection requests, network discovery, and notifications.',
      'The backend separates users, posts, connections, and notifications into dedicated models, controllers, and routes; the React client mirrors those capabilities as focused pages and components.',
    ],
    notes: [
      {
        title: 'End-to-end feature slices',
        body: 'User, post, connection, and notification domains each have an Express route, controller, and MongoDB model, with corresponding React surfaces.',
      },
      {
        title: 'Media and email seams',
        body: 'Cloudinary handles uploaded media and the backend includes transactional email handlers and templates for product events.',
      },
    ],
    flow: ['Sign in', 'Build profile', 'Publish', 'Connect', 'Notify'],
    links: [
      {
        label: 'View source',
        url: 'https://github.com/X-Saikat-93/talent-orbit',
        kind: 'source',
      },
    ],
  },
  {
    id: 'wordflow',
    name: 'WordFlow',
    nameEn: 'WordFlow',
    description:
      'A work-in-progress language-learning platform built around courses, units, lessons, challenges, progress, quests, and a learner shop.',
    url: 'https://word-flow-das.vercel.app',
    domain: 'word-flow-das.vercel.app',
    category: 'Language learning',
    status: 'Work in progress',
    role: 'Creator',
    scope: 'Learning loop and content operations',
    stack: ['Next.js', 'TypeScript', 'Clerk', 'Neon Postgres', 'Drizzle ORM', 'Stripe'],
    capabilities: [
      'Courses, units, lessons, and challenge options',
      'Learning progress, hearts, and practice flows',
      'Leaderboard, quests, and in-product shop',
      'Admin content management surfaces',
      'Stripe webhook integration',
    ],
    overview: [
      'WordFlow is an active work in progress for language learning. Content is structured as courses, units, lessons, challenges, and challenge options.',
      'The learning loop is supported by progress, hearts, practice, leaderboards, quests, and a shop, with Clerk authentication and Neon Postgres persistence through Drizzle ORM.',
    ],
    notes: [
      {
        title: 'Content as structured data',
        body: 'Admin screens and API routes create and edit courses, units, lessons, challenges, and challenge options independently.',
      },
      {
        title: 'Visible progress loop',
        body: 'Learn, lesson, leaderboard, quest, practice, heart, and shop surfaces make learner state part of the core navigation.',
      },
      {
        title: 'Commercial seam',
        body: 'The repository includes a Stripe webhook route and subscription-aware product surfaces while the project remains in development.',
      },
    ],
    flow: ['Course', 'Unit', 'Lesson', 'Challenge', 'Progress'],
    links: [
      {
        label: 'Open preview',
        url: 'https://word-flow-das.vercel.app',
        kind: 'live',
      },
      {
        label: 'View source',
        url: 'https://github.com/X-Saikat-93/WordFlow',
        kind: 'source',
      },
    ],
  },
  {
    id: 'weathersheet',
    name: 'weathersheet',
    nameEn: 'weathersheet',
    description:
      'A responsive weather application with global search, geolocation, current conditions, forecasts, themes, and temperature-unit controls.',
    url: 'https://weathersheet-saikat.netlify.app',
    domain: 'weathersheet-saikat.netlify.app',
    category: 'Weather interface',
    status: 'Live demo',
    role: 'Creator',
    scope: 'Responsive forecast experience',
    stack: ['React', 'Vite', 'OpenWeatherMap', 'Axios', 'GSAP'],
    capabilities: [
      'Global location search',
      'Browser geolocation',
      'Current conditions, humidity, and cloud cover',
      'Weather forecasts',
      'Light/dark themes and Celsius/Fahrenheit switching',
    ],
    overview: [
      'weathersheet is a responsive React weather interface using OpenWeatherMap for current conditions and forecast data. Visitors can search globally or use browser geolocation.',
      'The interface exposes temperature, humidity, cloud cover, forecasts, theme controls, and Celsius/Fahrenheit switching, with explicit handling for invalid searches and failed requests.',
    ],
    notes: [
      {
        title: 'Two location paths',
        body: 'A visitor can resolve weather by entering a place or by granting browser geolocation access.',
      },
      {
        title: 'Preference-aware display',
        body: 'Theme and temperature-unit controls let the same weather payload adapt to the visitor’s display preferences.',
      },
    ],
    flow: ['Locate', 'Request', 'Resolve', 'Forecast', 'Adapt'],
    links: [
      {
        label: 'Open live demo',
        url: 'https://weathersheet-saikat.netlify.app',
        kind: 'live',
      },
      {
        label: 'View source',
        url: 'https://github.com/X-Saikat-93/weathersheet',
        kind: 'source',
      },
    ],
  },
  {
    id: 'railway-curve',
    name: 'railway-curve',
    nameEn: 'railway-curve',
    description:
      'A railway curve calculator for cant, permissible speed, transition length, fine tuning, and printable PDF output.',
    url: 'https://github.com/X-Saikat-93/railway-curve',
    domain: 'github.com',
    category: 'Engineering calculator',
    status: 'Public repository',
    role: 'Creator',
    scope: 'Railway curve parameters',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'Framer Motion', 'react-to-print'],
    capabilities: [
      'Maximum-speed and radius inputs',
      'Equilibrium and actual cant calculations',
      'Maximum permissible speed output',
      'Transition-length calculation and fine tuning',
      'Printable PDF export',
    ],
    overview: [
      'railway-curve is a focused engineering calculator for railway curve parameters. Maximum speed and radius form the primary inputs, with optional fine-tuning controls.',
      'The result sheet includes equilibrium cant, actual cant, maximum permissible speed, transition length, and related values, and can be exported through a print-to-PDF workflow.',
    ],
    notes: [
      {
        title: 'Input-to-result clarity',
        body: 'Primary inputs and optional fine tuning are separated before the calculated railway parameters are presented as one result sheet.',
      },
      {
        title: 'Portable output',
        body: 'The calculation view is also the printable artifact, using react-to-print for PDF-ready handoff.',
      },
    ],
    flow: ['Input', 'Calculate', 'Review', 'Fine tune', 'Export'],
    links: [
      {
        label: 'View source',
        url: 'https://github.com/X-Saikat-93/railway-curve',
        kind: 'source',
      },
    ],
  },
  {
    id: 'linkedin-image-saver-bot',
    name: 'LinkedIn Image Saver Bot',
    nameEn: 'LinkedIn Image Saver Bot',
    description:
      'A Telegram bot that retrieves images from public LinkedIn posts, tracks usage, enforces daily limits, and stores user records with Supabase RLS.',
    url: 'https://github.com/X-Saikat-93/LinkedIn-Image-Saver-Bot',
    domain: 'github.com',
    category: 'Telegram utility',
    status: 'Public repository',
    role: 'Creator',
    scope: 'Public-post image delivery',
    stack: ['Python', 'Telegram Bot API', 'Supabase', 'PostgreSQL', 'Docker'],
    capabilities: [
      'Public LinkedIn post URL intake',
      'Multi-image retrieval and Telegram delivery',
      'Per-user daily usage tracking',
      'Five-download free-tier limit',
      'Supabase Row Level Security policies',
    ],
    overview: [
      'LinkedIn Image Saver Bot accepts a public LinkedIn post URL in Telegram, retrieves the post’s images, and returns them in the chat.',
      'Supabase stores users and usage logs, with Row Level Security policies around each user’s records. The bot tracks a five-download daily free tier and is packaged for Docker-based deployment.',
    ],
    notes: [
      {
        title: 'User-scoped records',
        body: 'Supabase policies scope user and usage-log reads and writes to the current Telegram identity.',
      },
      {
        title: 'Quota in the product path',
        body: 'Each successful request updates usage history so the daily free-tier limit can be enforced before more work is accepted.',
      },
    ],
    flow: ['Post URL', 'Retrieve', 'Extract', 'Track', 'Deliver'],
    links: [
      {
        label: 'View source',
        url: 'https://github.com/X-Saikat-93/LinkedIn-Image-Saver-Bot',
        kind: 'source',
      },
    ],
  },
]

export function getProjectById(id: string) {
  return projects.find((project) => project.id === id)
}

export function projectPath(id: string) {
  return `/en/projects/${id}`
}

// Status reads as a small lamp: live work is lit, everything else is a
// quiet ring.
export function projectStatusTone(status: string) {
  if (status.startsWith('Live')) return 'live'
  if (status === 'Work in progress' || status === 'Prototype') return 'draft'
  return 'source'
}

// Homepage selection: projects with a published case study lead, then
// shipped products (status exactly 'Live', not a 'Live demo') fill the
// rest, both in registry order.
export function selectFeaturedProjects(caseStudyIds: readonly string[], limit = 3) {
  const studied = new Set(caseStudyIds)
  const ranked = [
    ...projects.filter(({ id }) => studied.has(id)),
    ...projects.filter(({ id, status }) => !studied.has(id) && status === 'Live'),
  ]
  return ranked.slice(0, limit)
}
