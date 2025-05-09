'use client';
import { db } from '@/utils/db';
import { eq } from 'drizzle-orm';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronsUpDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { userAnswer } from '@/utils/schema';

const FeedbackPage = () => {
    const router = useRouter();
    const [feedbackList, setFeedbackList] = useState([]);
    const [selfIntroFeedback, setSelfIntroFeedback] = useState(null);
    const params = useParams();

    const getFeedback = async () => {
        const result = await db
            .select()
            .from(userAnswer)
            .where(eq(userAnswer.mockIdRef, params.interviewId))
            .orderBy(userAnswer.id);
        console.log(result);
        const selfIntro = result.find((item) => item.isSelfIntro);
        const questions = result.filter((item) => !item.isSelfIntro);
        setSelfIntroFeedback(selfIntro);
        setFeedbackList(questions);
    };

    useEffect(() => {
        getFeedback();
    }, []);

    return (
        <div className='p-10'>
            {feedbackList.length === 0 && !selfIntroFeedback ? (
                <h2 className='font-bold text-xl text-gray-500'>No Interview Record Found</h2>
            ) : (
                <>
                    <h2 className='text-3xl font-bold text-green-500'>Congratulations</h2>
                    <h2 className='font-bold text-2xl'>Here is your interview feedback</h2>
                    <h2 className='text-primary text-lg my-3'>
                        Your overall Interview Rating: <strong>7/10</strong>
                    </h2>
                    <h2 className='text-sm text-gray-500'>
                        Find below your self-introduction and interview question feedback, including correct answers, your answers, and areas for improvement.
                    </h2>

                    {/* Self-Introduction Feedback */}
                    {selfIntroFeedback && (
                        <div className='mt-7'>
                            <h3 className='text-xl font-semibold'>Self-Introduction</h3>
                            <div className='border rounded-lg p-5 bg-gray-50 mt-3'>
                                <h2 className='p-2 border rounded-lg bg-red-50 text-sm text-red-900'>
                                    <strong>Your Answer: </strong>
                                    {selfIntroFeedback.userAns}
                                </h2>
                                <h2 className='p-2 border rounded-lg bg-blue-50 text-sm text-primary mt-2'>
                                    <strong>Feedback: </strong>
                                    {selfIntroFeedback.feedback}
                                </h2>
                                <h2 className='p-2 border rounded-lg bg-red-50 text-sm text-red-900 mt-2'>
                                    <strong>Rating: </strong>
                                    {selfIntroFeedback.rating}
                                </h2>
                            </div>
                        </div>
                    )}

                    {/* Question Feedback */}
                    <h3 className='text-xl font-semibold mt-7'>Interview Questions</h3>
                    {feedbackList.length === 0 ? (
                        <p className='text-gray-500 mt-3'>No question answers recorded.</p>
                    ) : (
                        feedbackList.map((item, index) => (
                            <Collapsible key={index} className='mt-7'>
                                <CollapsibleTrigger className='p-2 bg-secondary rounded-lg my-2 text-left flex justify-between gap-7 w-full'>
                                    {item.question} <ChevronsUpDownIcon className='h-5 w-5' />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className='flex flex-col gap-2'>
                                        <h2 className='text-red-500 p-2 border rounded-lg'>
                                            <strong>Rating: </strong>
                                            {item.rating}
                                        </h2>
                                        <h2 className='p-2 border rounded-lg bg-red-50 text-sm text-red-900'>
                                            <strong>Your Answer: </strong>
                                            {item.userAns}
                                        </h2>
                                        <h2 className='p-2 border rounded-lg bg-green-50 text-sm text-green-900'>
                                            <strong>Correct Answer: </strong>
                                            {item.correctAns}
                                        </h2>
                                        <h2 className='p-2 border rounded-lg bg-blue-50 text-sm text-primary'>
                                            <strong>Feedback: </strong>
                                            {item.feedback}
                                        </h2>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        ))
                    )}
                </>
            )}
            <Button className='mt-5' onClick={() => router.replace('/dashboard')}>
                Go To Home
            </Button>
        </div>
    );
};

export default FeedbackPage;