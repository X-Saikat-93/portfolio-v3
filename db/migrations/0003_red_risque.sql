ALTER TABLE "cms_entries" ADD COLUMN "category" varchar(80) DEFAULT 'Notes' NOT NULL;--> statement-breakpoint
ALTER TABLE "cms_entries" ADD COLUMN "reading_minutes" integer DEFAULT 1 NOT NULL;