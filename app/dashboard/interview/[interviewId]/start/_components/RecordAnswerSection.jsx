'use client';
import { Button } from '@/components/ui/button';
import { db } from '@/utils/db';
import { chatSession } from '@/utils/GeminiAI';
import { useUser } from '@clerk/nextjs';
import { Mic, StopCircle } from 'lucide-react';
import moment from 'moment';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import useSpeechToText from 'react-hook-speech-to-text';
import Webcam from 'react-webcam';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { userAnswer } from '@/utils/schema';

const RecordAnswerSection = ({ mockInterviewQuestions, activeQuestion, interviewData, goToNextQuestion, goToPrevQuestion }) => {
    const [UserAnswer, setUserAnswer] = useState('');
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults,
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false,
    });

    const startStopRecording = async () => {
        if (isRecording) {
            setLoading(true);
            stopSpeechToText();
        } else {
            startSpeechToText();
        }
    };

    const UpdateUserAnswer = async () => {
        if (!interviewData?.mockId || !mockInterviewQuestions?.[activeQuestion]) {
            toast.error('Invalid interview or question data');
            setLoading(false);
            return;
        }

        setLoading(true);
        const feedbackPrompt =
            'Question: ' +
            mockInterviewQuestions[activeQuestion].Question +
            ', User Answer: ' +
            UserAnswer +
            ', Depends on question and user answer for given interview question ' +
            'please give us rating out of 10 for answer and feedback as area of improvement if any ' +
            'in just 3 to 5 lines to improve it in JSON format with rating field and feedback field';

        try {
            const result = await chatSession.sendMessage(feedbackPrompt);
            const mockJsonResp = result.response.text().replace('```json', '').replace('```', '').trim();
            let jsonFeedbackResp;
            try {
                jsonFeedbackResp = JSON.parse(mockJsonResp);
                if (!jsonFeedbackResp.rating || !jsonFeedbackResp.feedback) {
                    throw new Error('Invalid feedback format');
                }
            } catch (parseError) {
                console.error('Feedback JSON Parse Error:', parseError);
                toast.error('Failed to parse feedback response');
                setLoading(false);
                return;
            }

            await db.insert(userAnswer).values({
                mockIdRef: interviewData.mockId,
                question: mockInterviewQuestions[activeQuestion].Question,
                correctAns: mockInterviewQuestions[activeQuestion].Answer,
                userAns: UserAnswer,
                feedback: jsonFeedbackResp.feedback,
                rating: jsonFeedbackResp.rating,
                userEmail: user?.primaryEmailAddress?.emailAddress,
                createdAt: moment().format('DD-MM-yyyy'),
            });

            toast.success('User Answer Recorded Successfully');
            setResults([]);
            setUserAnswer('');

            if (activeQuestion === mockInterviewQuestions.length - 1) {
                setTimeout(() => {
                    router.push(`/dashboard/interview/${interviewData.mockId}/feedback`);
                }, 1000);
            } else {
                goToNextQuestion();
            }
        } catch (error) {
            console.error('Error saving answer:', error);
            toast.error('Failed to save answer');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        results.forEach((result) => {
            setUserAnswer((prevAns) => prevAns + result?.transcript);
        });
    }, [results]);

    useEffect(() => {
        if (!isRecording && UserAnswer.length > 10) {
            UpdateUserAnswer();
        }
    }, [UserAnswer, isRecording]);

    return (
        <div className='flex justify-center items-center flex-col'>
            <h2 className='text-lg font-semibold mb-4'>Question {activeQuestion + 1}</h2>
            <p className='max-w-2xl text-center mb-4'>{mockInterviewQuestions[activeQuestion]?.Question}</p>

            <div className='flex flex-col justify-center mt-6 items-center bg-black rounded-lg p-5'>
                <Image src={'/webcam.png'} width={200} height={200} className='absolute' alt='missing image' />
                <Webcam mirrored={true} style={{ height: 300, width: '100%', zIndex: 10 }} />
            </div>

            <Button
                disabled={loading}
                variant='outline'
                className='my-6'
                onClick={startStopRecording}
            >
                {isRecording ? (
                    <h2 className='text-red-600 flex gap-2'>
                        <StopCircle /> Stop Recording...
                    </h2>
                ) : (
                    <>
                        <Mic /> Record Answer
                    </>
                )}
            </Button>

            <div className='flex gap-4'>
                <Button onClick={goToPrevQuestion} variant='secondary'>Previous</Button>
                <Button onClick={UpdateUserAnswer} disabled={loading}>
                    {activeQuestion === mockInterviewQuestions.length - 1 ? 'End Interview' : 'Submit & Next'}
                </Button>
            </div>
        </div>
    );
};

export default RecordAnswerSection;
