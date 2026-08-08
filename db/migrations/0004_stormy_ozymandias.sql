ALTER TABLE "cms_entries" ADD COLUMN "cover_image_public_id" varchar(500);--> statement-breakpoint
ALTER TABLE "cms_entries" ADD COLUMN "cover_image_alt" varchar(300) DEFAULT '' NOT NULL;