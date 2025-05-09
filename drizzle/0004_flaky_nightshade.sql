ALTER TABLE "user_answer" ADD COLUMN "mockId" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "user_answer" DROP COLUMN "mockIdRef";