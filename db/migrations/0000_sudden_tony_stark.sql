CREATE TABLE "cloudinary_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_id" varchar(500) NOT NULL,
	"resource_type" varchar(16) NOT NULL,
	"format" varchar(32),
	"secure_url" text NOT NULL,
	"original_name" varchar(255),
	"bytes" integer,
	"width" integer,
	"height" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cms_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" varchar(240) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"status" varchar(16) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" varchar(16) NOT NULL,
	"title" varchar(240) NOT NULL,
	"creator" varchar(240) DEFAULT '' NOT NULL,
	"year" integer,
	"description" text DEFAULT '' NOT NULL,
	"url" text,
	"image_public_id" varchar(500),
	"status" varchar(16) DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "cloudinary_media_public_id_idx" ON "cloudinary_media" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cms_entries_slug_idx" ON "cms_entries" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "cms_entries_status_idx" ON "cms_entries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "portfolio_items_kind_status_order_idx" ON "portfolio_items" USING btree ("kind","status","sort_order");