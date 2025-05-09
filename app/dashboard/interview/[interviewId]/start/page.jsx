'use client'
import { db } from '@/utils/db';
import { ai_interview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import QuestionsSection from './_components/QuestionsSection';
import RecordAnswerSection from './_components/RecordAnswerSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const StartInterview = () => {
    const params = useParams();
    const [interviewData,setInterviewData]=useState();
    const [mockInterviewQuestions,setMockInterviewQuestions]=useState(); 
    const [activeQuestion,setActiveQuestion]=useState(0);

    useEffect(()=>{
        getInterviewDetails();
    },[])

    const getInterviewDetails = async () => {
        const result = await db.select().from(ai_interview).where(eq(ai_interview.mockId, params.interviewId));
        console.log("result: ",result);
        const jsonMockResp=JSON.parse(result[0].jsonMockResp);
        // console.log("jsonMockResp: "+jsonMockResp)
        setMockInterviewQuestions(jsonMockResp);
        setInterviewData(result[0]);
    }

  return (
    <div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
          <QuestionsSection mockInterviewQuestions={mockInterviewQuestions} activeQuestion={activeQuestion}/>
          <RecordAnswerSection mockInterviewQuestions={mockInterviewQuestions} activeQuestion={activeQuestion} interviewData={interviewData}/>
          </div>
          <div className='flex justify-end gap-6 mt-20 mr-16'>
              {activeQuestion > 0 && <Button onClick={() => setActiveQuestion(activeQuestion - 1)}>Previous Question</Button>}
              {activeQuestion != mockInterviewQuestions?.length - 1&& <Button onClick={()=>setActiveQuestion(activeQuestion+1)}>Next Question</Button>}
            {activeQuestion==mockInterviewQuestions?.length-1 && 
            <Link href={'/dashboard/interview/'+interviewData?.mockId+'/feedback'}>
            <Button>End Interview</Button></Link>
            }
          </div>
    </div>
  )
}

export default StartInterview
