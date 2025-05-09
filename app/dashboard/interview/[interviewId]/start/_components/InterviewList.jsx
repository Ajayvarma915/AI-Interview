'use client';
import { db } from '@/utils/db';
import { ai_interview } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import InterviewItemCard from './InterviewItemCard';
import { LoaderCircle } from 'lucide-react';

const InterviewList = () => {
    const { user } = useUser();
    const [interviewList, setInterviewList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            GetInterviewList();
        }
    }, [user]);

    const GetInterviewList = async () => {
        setLoading(true);
        try {
            const result = await db
                .select()
                .from(ai_interview)
                .where(eq(ai_interview.createdBy, user?.primaryEmailAddress.emailAddress))
                .orderBy(desc(ai_interview.id));
            setInterviewList(result);
        } catch (error) {
            console.error('Error fetching interviews:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className='font-medium text-xl'>Previous Mock Interviews</h2>
            {loading ? (
                <div className='flex justify-center items-center mt-5'>
                    <LoaderCircle className='animate-spin h-8 w-8 text-gray-500' />
                    <span className='ml-2 text-gray-500'>Loading previous interviews...</span>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3'>
                    {interviewList.length > 0 ? (
                        interviewList.map((interview, index) => (
                            <InterviewItemCard interview={interview} key={index} />
                        ))
                    ) : (
                        <p className='text-gray-500 text-center mt-5'>No previous interviews found.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default InterviewList;