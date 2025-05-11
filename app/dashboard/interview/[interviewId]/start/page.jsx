'use client';

import { db } from '@/utils/db';
import { eq } from 'drizzle-orm';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ai_interview } from '@/utils/schema';
import QuestionsSection from './_components/QuestionsSection';
import RecordAnswerSection from './_components/RecordAnswerSection';
import Link from 'next/link';

const StartInterview = () => {
    const params = useParams();
    const [mockInterviewQuestions, setMockInterviewQuestions] = useState([]);
    const [activeQuestion, setActiveQuestion] = useState(0);
    const [interviewData, setInterviewData] = useState(null);
    const [error, setError] = useState(false);

    const getInterviewQuestions = async () => {
        try {
            const result = await db
                .select()
                .from(ai_interview)
                .where(eq(ai_interview.mockId, params.interviewId));

            if (!result || result.length === 0) {
                throw new Error("No interview found.");
            }

            const rawResp = result[0]?.jsonMockResp?.trim();
            let parsedJSON = null;

            try {
                if (rawResp.startsWith('[')) {
                    const cleanedResp = rawResp.replace(/```json\s*\n?/g, '').replace(/\n?```/g, '');
                    parsedJSON = JSON.parse(cleanedResp);
                } else {
                    const arrayMatch = rawResp.match(/\[\s*{[\s\S]*?}\s*\]/);
                    if (!arrayMatch) {
                        throw new Error('No valid JSON array found in response');
                    }
                    parsedJSON = JSON.parse(arrayMatch[0]);
                }
            } catch (jsonErr) {
                console.error('❌ JSON parsing failed:', jsonErr);
                setError(true);
                return;
            }

            setMockInterviewQuestions(parsedJSON);
            setInterviewData(result[0]);
            setError(false);
        } catch (err) {
            console.error('Error loading interview data:', err);
            setError(true);
        }
    };

    const goToNextQuestion = () => {
        setActiveQuestion((prev) => {
            if (prev < mockInterviewQuestions.length - 1) {
                return prev + 1;
            }
            return prev;
        });
    };

    useEffect(() => {
        if (params.interviewId) {
            getInterviewQuestions();
        }
    }, [params.interviewId]);

    return (
        <div className='flex p-10'>
            <div className='flex-1'>
                {error ? (
                    <h2 className='text-red-500 text-center text-lg'>
                        ⚠️ Failed to load interview questions. Please try regenerating the interview.
                    </h2>
                ) : mockInterviewQuestions.length > 0 && interviewData ? (
                    <>
                        <QuestionsSection
                            mockInterviewQuestions={mockInterviewQuestions}
                            activeQuestion={activeQuestion}
                        />
                        <div className='mt-10 flex justify-center gap-4 flex-wrap'>
                            {mockInterviewQuestions.map((_, idx) => (
                                <Button
                                    key={idx}
                                    variant={idx === activeQuestion ? 'default' : 'outline'}
                                    onClick={() => setActiveQuestion(idx)}
                                >
                                    Q{idx + 1}
                                </Button>
                            ))}
                        </div>
                        <div className='mt-6 flex justify-center gap-4'>
                            <Button
                                disabled={activeQuestion === 0}
                                onClick={() => setActiveQuestion(activeQuestion - 1)}
                                variant='outline'
                            >
                                Previous Question
                            </Button>
                            <Button
                                disabled={activeQuestion === mockInterviewQuestions.length - 1}
                                onClick={() => setActiveQuestion(activeQuestion + 1)}
                                variant='outline'
                            >
                                Next Question
                            </Button>
                            <Link href={`/dashboard/interview/${interviewData.mockId}/feedback`}>
                                <Button variant='destructive'>End Interview</Button>
                            </Link>
                        </div>
                    </>
                ) : (
                    <h2 className='text-gray-500 text-center mt-10'>
                        ⏳ Loading interview questions...
                    </h2>
                )}
            </div>

            <div className='flex-1'>
                <RecordAnswerSection
                    mockInterviewQuestions={mockInterviewQuestions}
                    activeQuestion={activeQuestion}
                    interviewData={interviewData}
                    goToNextQuestion={goToNextQuestion} 
                />
            </div>
        </div>
    );
};

export default StartInterview;
