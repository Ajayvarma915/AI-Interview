'use client'
import { Button } from '@/components/ui/button'
import { db } from '@/utils/db'
import { ai_interview } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import { Lightbulb, WebcamIcon } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam'

const Page = () => {
    const params = useParams();
    const [interviewData, setInterviewData] = useState(null);
    const [webCamEnable, setWebCamEnable] = useState(false);

    useEffect(() => {
        if (params.interviewId) {
            getInterviewDetails();
        }
    }, [params.interviewId]);

    const getInterviewDetails = async () => {
        try {
            const result = await db.select().from(ai_interview).where(eq(ai_interview.mockId, params.interviewId));
            if (result.length > 0) {
                setInterviewData(result[0]);
            }
            console.log("result: ", result[0]);
        } catch (error) {
            console.error("Error fetching interview details:", error);
        }
    }

    return (
        <div className='my-10'>
            <h2 className='font-bold text-2xl'>Let's Get Started</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                {interviewData ? (
                    <div className='flex flex-col my-5 gap-5'>
                        <div className='flex flex-col p-5 rounded-lg border gap-5'>
                            <h2 className='text-lg'><strong>Job Role/Job Position: </strong>{interviewData.jobPosition}</h2>
                            <h2 className='text-lg'><strong>Job Description/Tech Stack: </strong>{interviewData.jobDesc}</h2>
                            <h2 className='text-lg'><strong>Years Of Experience: </strong>{interviewData.jobExperience}</h2>
                        </div>
                        <div className='p-5 border rounded-lg  border-yellow-300 bg-yellow-100'>
                            <h2 className='flex gap-2 items-center mb-4'><Lightbulb /><strong>Information</strong></h2>
                            <h2 className='text-lg text-yellow-500'>{process.env.NEXT_PUBLIC_INFORMATION}</h2>
                        </div>
                    </div>
                ) : (
                    <p>Loading interview details...</p>
                )}
                <div>
                    {webCamEnable ? (
                        <Webcam
                            onUserMedia={() => setWebCamEnable(true)}
                            onUserMediaError={() => setWebCamEnable(false)}
                            mirrored={true}
                            style={{ height: 300, width: 300 }}
                        />
                    ) : (
                        <>
                            <WebcamIcon className='h-72 w-full p-20 my-7 bg-secondary rounded-lg border' />
                            <Button variant='ghost' onClick={() => setWebCamEnable(true)} className='w-full text-lg'>Enable Web Cam and Microphone</Button>
                        </>
                    )}
                </div>
            </div>
            <div className='flex justify-end items-end'>
                <Link href={'/dashboard/interview/'+params.interviewId+'/start'}><Button>Start Interview</Button></Link>
            </div>
        </div>
    )
}

export default Page;
