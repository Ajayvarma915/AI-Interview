'use client'
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { chatSession } from '@/utils/GeminiAI';
import { LoaderCircle } from 'lucide-react';
import { db } from '@/utils/db';
import { ai_interview } from '@/utils/schema';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import { useRouter } from 'next/navigation';

const AddNewInterview = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [jobPosition, setJobPosition] = useState("");
    const [jobDesc, setJobDesc] = useState("");
    const [jobExperience, setJobExperience] = useState("");
    const [loading,setLoading]=useState(false);
    const [jsonResponse,setJsonResponse]=useState([]);
    
    const router=useRouter();
    const {user}=useUser();

    const onSubmit = async(e) => {
        setLoading(true);
        e.preventDefault();
        console.log({ jobPosition, jobDesc, jobExperience });

        const InputPrompt = "Job Position: " + jobPosition + ", Job Description: " + jobDesc + ", Years Of Experience: " + jobExperience + ", Depends on this information please give me " + process.env.NEXT_PUBLIC_INTERVIEW_COUNT+" interview question with Answered in Json Format,Directly Give me Question and Answer as field in JSON"

        const result=await chatSession.sendMessage(InputPrompt);
        const mockJsonResp = (result.response.text()).replace('```json','').replace('```','');
        // console.log("mockJsonResp: "+ mockJsonResp);
        setJsonResponse(mockJsonResp);
        // console.log(JSON.parse(mockJsonResp));
        if(mockJsonResp) {
        const resp=await db.insert(ai_interview).values({
            mockId:uuidv4(),
            jsonMockResp:mockJsonResp,
            jobPosition:jobPosition,
            jobDesc:jobDesc,
            jobExperience:jobExperience,
            createdBy:user?.primaryEmailAddress?.emailAddress,
            createdAt:moment().format('DD-MM-yyyy')
        }).returning({mockId:ai_interview.mockId})
            setLoading(false); 
            console.log("Inserted id: ",resp);
            if(resp){
                setOpenDialog(false);
                router.push('/dashboard/interview/'+resp[0]?.mockId+'/self-intro')
            }
        }
        else{
            console.log("Error");
        }
    }

    return (
        <div>
            <div
                className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all'
                onClick={() => setOpenDialog(true)}
            >
                <h2 className='text-lg text-center'>+ Add New</h2>
            </div>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Tell us more about your job Interview</DialogTitle>
                    </DialogHeader>

                    <div className="text-lg font-semibold mt-2">Add Details about your job position/role, Job description</div>

                    <DialogDescription>
                        Fill in the details about your interview experience.
                    </DialogDescription>

                    <form onSubmit={onSubmit}>
                        <div className='mt-7 my-3'>
                            <label>Job Role/Job Position</label>
                            <Input
                                placeholder="Ex. Full Stack Developer"
                                value={jobPosition}
                                onChange={(e) => setJobPosition(e.target.value)}
                                required
                            />
                        </div>
                        <div className='my-3'>
                            <label>Job Description/Tech Stack (In Short)</label>
                            <Textarea
                                placeholder="Ex. React, Angular, NodeJS, MySQL etc"
                                value={jobDesc}
                                onChange={(e) => setJobDesc(e.target.value)}
                                required
                            />
                        </div>
                        <div className='mt-7 my-3'>
                            <label>Years of experience</label>
                            <Input
                                placeholder="Ex.5"
                                type="number"
                                max="30"
                                value={jobExperience}
                                onChange={(e) => setJobExperience(e.target.value)}
                                required
                            />
                        </div>

                        <div className='flex gap-5 justify-end'>
                            <Button type="button" variant='ghost' onClick={() => setOpenDialog(false)}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                            {loading?
                                <><LoaderCircle className='animate-spin'/>'Generating from AI'</> :'Start Interview'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddNewInterview;