import { pgTable, text, integer, varchar } from 'drizzle-orm/pg-core';

export const ai_interview = pgTable('ai_interview', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    mockId: varchar('mockId', { length: 255 }).notNull(),
    jobPosition: text('jobPosition'),
    jobDesc: text('jobDesc'),
    jobExperience: text('jobExperience'),
    jsonMockResp: text('jsonMockResp'),
    createdBy: text('createdBy'),
    createdAt: text('createdAt'),
});

export const userAnswer = pgTable('user_answer', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    mockIdRef: varchar('mockId', { length: 255 }).notNull(),
    question: text('question'),
    correctAns: text('correctAns'),
    userAns: text('userAns'),
    feedback: text('feedback'),
    rating: integer('rating'),
    userEmail: text('userEmail'),
    createdAt: text('createdAt'),
});