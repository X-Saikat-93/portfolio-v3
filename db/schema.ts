import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

// Better Auth core tables. Keep these separate from portfolio data so the
// admin-only auth boundary can evolve without coupling content records to it.
export const authUser = pgTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: text('image'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  },
  (table) => [uniqueIndex('auth_user_email_idx').on(table.email)],
)

export const authSession = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => authUser.id, { onDelete: 'cascade' }),
  },
  (table) => [uniqueIndex('auth_session_token_idx').on(table.token)],
)

export const authAccount = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => authUser.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  },
  (table) => [uniqueIndex('auth_account_provider_account_idx').on(table.providerId, table.accountId)],
)

export const authVerification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
})

export const cmsEntries = pgTable(
  'cms_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 160 }).notNull(),
    title: varchar('title', { length: 240 }).notNull(),
    description: text('description').notNull().default(''),
    seoKeywords: jsonb('seo_keywords').$type<string[]>().notNull().default([]),
    body: text('body').notNull().default(''),
    category: varchar('category', { length: 80 }).notNull().default('Notes'),
    readingMinutes: integer('reading_minutes').notNull().default(1),
    coverImagePublicId: varchar('cover_image_public_id', { length: 500 }),
    coverImageAlt: varchar('cover_image_alt', { length: 300 }).notNull().default(''),
    status: varchar('status', { length: 16 }).notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('cms_entries_slug_idx').on(table.slug),
    index('cms_entries_status_idx').on(table.status),
  ],
)

export const projectCaseStudies = pgTable(
  'project_case_studies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: varchar('project_id', { length: 160 }).notNull(),
    heroImagePublicId: varchar('hero_image_public_id', { length: 500 }),
    heroImageAlt: varchar('hero_image_alt', { length: 300 }).notNull().default(''),
    framing: text('framing').notNull(),
    challenge: text('challenge').notNull(),
    ownership: jsonb('ownership').$type<string[]>().notNull().default([]),
    proof: jsonb('proof')
      .$type<Array<{ label: string; value: string }>>()
      .notNull()
      .default([]),
    decisions: jsonb('decisions')
      .$type<Array<{ title: string; body: string }>>()
      .notNull()
      .default([]),
    evidence: jsonb('evidence').$type<string[]>().notNull().default([]),
    boundary: text('boundary').notNull(),
    status: varchar('status', { length: 16 })
      .$type<'draft' | 'published'>()
      .notNull()
      .default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('project_case_studies_project_id_idx').on(table.projectId),
    index('project_case_studies_status_idx').on(table.status),
  ],
)

export const cloudinaryMedia = pgTable(
  'cloudinary_media',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    publicId: varchar('public_id', { length: 500 }).notNull(),
    resourceType: varchar('resource_type', { length: 16 }).notNull(),
    format: varchar('format', { length: 32 }),
    secureUrl: text('secure_url').notNull(),
    originalName: varchar('original_name', { length: 255 }),
    bytes: integer('bytes'),
    width: integer('width'),
    height: integer('height'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('cloudinary_media_public_id_idx').on(table.publicId)],
)

export const portfolioItems = pgTable(
  'portfolio_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    kind: varchar('kind', { length: 16 })
      .$type<'book' | 'music' | 'photo'>()
      .notNull(),
    title: varchar('title', { length: 240 }).notNull(),
    creator: varchar('creator', { length: 240 }).notNull().default(''),
    year: integer('year'),
    description: text('description').notNull().default(''),
    url: text('url'),
    imagePublicId: varchar('image_public_id', { length: 500 }),
    status: varchar('status', { length: 16 })
      .$type<'draft' | 'published'>()
      .notNull()
      .default('draft'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('portfolio_items_kind_status_order_idx').on(
      table.kind,
      table.status,
      table.sortOrder,
    ),
  ],
)

export const contactSubmissions = pgTable(
  'contact_submissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    email: varchar('email', { length: 320 }).notNull(),
    subject: varchar('subject', { length: 180 }).notNull(),
    message: text('message').notNull(),
    status: varchar('status', { length: 16 })
      .$type<'new' | 'read'>()
      .notNull()
      .default('new'),
    notificationStatus: varchar('notification_status', { length: 20 })
      .$type<'pending' | 'sent' | 'failed' | 'not_configured'>()
      .notNull()
      .default('pending'),
    notifiedAt: timestamp('notified_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('contact_submissions_status_created_idx').on(table.status, table.createdAt),
    index('contact_submissions_created_idx').on(table.createdAt),
  ],
)
