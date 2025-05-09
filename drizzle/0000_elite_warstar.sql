CREATE TABLE "user_answer" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_answer_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"mockIdRef" varchar(255) NOT NULL,
	"question" text,
	"correctAns" text,
	"userAns" text,
	"feedback" text,
	"rating" integer,
	"userEmail" text,
	"createdAt" text,
	"round" text
);
--> statement-breakpoint
CREATE TABLE "ai_interview" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ai_interview_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"mockId" varchar(255) NOT NULL,
	"jobPosition" text,
	"jobDesc" text,
	"jobExperience" text,
	"technicalSubjects" text,
	"programmingLanguages" text,
	"codingExperience" integer,
	"jsonMockResp" text,
	"createdBy" text,
	"createdAt" text
);
