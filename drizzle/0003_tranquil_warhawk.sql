ALTER TABLE "user_answer" RENAME COLUMN "mockId" TO "mockIdRef";--> statement-breakpoint
ALTER TABLE "ai_interview" DROP COLUMN "technicalSubjects";--> statement-breakpoint
ALTER TABLE "ai_interview" DROP COLUMN "programmingLanguages";--> statement-breakpoint
ALTER TABLE "ai_interview" DROP COLUMN "codingExperience";--> statement-breakpoint
ALTER TABLE "user_answer" DROP COLUMN "round";