CREATE TABLE "project_case_studies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(160) NOT NULL,
	"framing" text NOT NULL,
	"challenge" text NOT NULL,
	"ownership" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"proof" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"decisions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"boundary" text NOT NULL,
	"status" varchar(16) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "project_case_studies_project_id_idx" ON "project_case_studies" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_case_studies_status_idx" ON "project_case_studies" USING btree ("status");