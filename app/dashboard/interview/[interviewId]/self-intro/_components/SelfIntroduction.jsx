'use client';
import { Button } from '@/components/ui/button';
import { db } from '@/utils/db';
import { chatSession } from '@/utils/GeminiAI';
import { userAnswer } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { Mic, StopCircle, RotateCcw } from 'lucide-react';
import moment from 'moment';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import useSpeechToText from 'react-hook-speech-to-text';
import Webcam from 'react-webcam';
import { toast } from 'sonner';

const SelfIntroduction = () => {
    const [userAns, setUserAns] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
    const [hasCamera, setHasCamera] = useState(false);
    const [hasMic, setHasMic] = useState(false);
    const [deviceError, setDeviceError] = useState(
        'Please allow camera and microphone access to start recording.'
    );
    const [redirectCountdown, setRedirectCountdown] = useState(null);
    const [isStopped, setIsStopped] = useState(false);
    const { user } = useUser();
    const params = useParams();
    const router = useRouter();

    const {
        error: speechError,
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

    const requestPermissions = async () => {
        setDeviceError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            setHasMic(true);
            setHasCamera(true);
            stream.getTracks().forEach((track) => track.stop());
            setDeviceError(null);
        } catch (err) {
            console.error('Permission error:', err);
            if (err.name === 'NotAllowedError') {
                setDeviceError('Camera and/or microphone access denied. Please allow permissions in your browser settings.');
            } else if (err.name === 'NotFoundError') {
                setDeviceError('No camera or microphone found. Please connect the required devices.');
            } else {
                setDeviceError('Failed to access camera and microphone. Please try again.');
            }
            setHasMic(false);
            setHasCamera(false);
        }
    };

    const handleWebcamError = (error) => {
        setDeviceError('Camera access denied or unavailable. Please allow camera permissions.');
        setHasCamera(false);
    };

    useEffect(() => {
        let timer;
        if (isRecording && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        console.log('Timer reached 0, stopping recording');
                        stopRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isRecording, timeLeft]);

    useEffect(() => {
        console.log('Speech results:', results);
        results.forEach((result) => {
            setUserAns((prevAns) => prevAns + result?.transcript);
        });
    }, [results]);

    useEffect(() => {
        let countdownTimer;
        if (redirectCountdown !== null && redirectCountdown > 0) {
            countdownTimer = setInterval(() => {
                setRedirectCountdown((prev) => prev - 1);
            }, 1000);
        } else if (redirectCountdown === 0) {
            router.push(`/dashboard/interview/${params.interviewId}/start`);
        }
        return () => clearInterval(countdownTimer);
    }, [redirectCountdown, params.interviewId, router]);

    const startStopRecording = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            try {
                await startSpeechToText();
                setIsStopped(false);
            } catch (err) {
                setDeviceError('Failed to start recording. Please check microphone permissions.');
            }
        }
    };

    const stopRecording = async () => {
        try {
            await stopSpeechToText();
            setIsStopped(true);
            console.log('Stopped recording, isRecording:', isRecording, 'isStopped:', isStopped);
        } catch (err) {
            console.error('Error stopping speech-to-text:', err);
            setDeviceError('Failed to stop recording.');
        }
    };

    const restartRecording = () => {
        setUserAns('');
        setResults([]);
        setTimeLeft(120);
        setIsStopped(false);
    };

    const saveSelfIntroduction = async () => {
        setLoading(true);
        try {
            const feedbackPrompt =
                'Self-Introduction: ' +
                userAns +
                ', For the given self-introduction for a job interview, please provide a rating out of 10 and feedback for improvement in 3 to 5 lines in JSON format with rating and feedback fields.';
            const maxRetries = 3;
            let retryCount = 0;
            let success = false;
            let mockJsonResp;

            while (retryCount < maxRetries && !success) {
                try {
                    const result = await chatSession.sendMessage(feedbackPrompt);
                    const rawResponse = result.response.text();
                    console.log('Raw API response:', rawResponse);

                    const jsonMatch = rawResponse.match(/{[\s\S]*?}/);
                    if (!jsonMatch) {
                        throw new Error('No valid JSON found in API response');
                    }
                    mockJsonResp = jsonMatch[0];
                    console.log('Extracted JSON:', mockJsonResp);

                    const JsonFeedbackResp = JSON.parse(mockJsonResp);
                    success = true;

                    const resp = await db.insert(userAnswer).values({
                        mockIdRef: params.interviewId,
                        question: 'Self-Introduction',
                        correctAns: null,
                        userAns: userAns,
                        feedback: JsonFeedbackResp?.feedback,
                        rating: JsonFeedbackResp?.rating,
                        userEmail: user?.primaryEmailAddress?.emailAddress,
                        createdAt: moment().format('DD-MM-YYYY'),
                    });

                    if (resp) {
                        toast('Self-Introduction Submitted Successfully');
                        setRedirectCountdown(5);
                    }
                } catch (error) {
                    console.error('Error in saveSelfIntroduction:', error);
                    retryCount++;
                    if (retryCount === maxRetries) {
                        toast.error('Failed to submit self-introduction due to invalid API response. Please try again.');
                        setDeviceError('Error processing your submission. Please try again.');
                        return;
                    }
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }
            }
        } finally {
            setLoading(false);
            console.log('Loading cleared:', loading);
        }
    };

    const canRecord = hasCamera && hasMic && !loading && !deviceError && redirectCountdown === null;
    const canSubmit = userAns.length > 5 && !loading && !isRecording && redirectCountdown === null;

    // console.log('canSubmit:', canSubmit);
    // console.log('userAns.length:', userAns.length);
    // console.log('loading:', loading);
    // console.log('isRecording:', isRecording);
    // console.log('redirectCountdown:', redirectCountdown);
    // console.log('isStopped:', isStopped);

    return (
        <div className='p-10 flex flex-col items-center'>
            <h2 className='text-2xl font-bold mb-5'>Record Your Self-Introduction</h2>
            <p className='text-gray-500 mb-5'>
                Record a 2-minute self-introduction. You can start and stop recording multiple times to continue where you left off. Click Restart to start fresh or Submit to proceed. Recording stops automatically after 2 minutes.
            </p>
            {deviceError && (
                <p className='text-red-500 mb-5'>{deviceError}</p>
            )}
            {userAns && (
                <p className='text-gray-500 mb-5'>Current transcript: {userAns}</p>
            )}
            {!hasCamera || !hasMic ? (
                <Button onClick={requestPermissions} className='mb-5' disabled={redirectCountdown !== null}>
                    Allow Camera and Microphone
                </Button>
            ) : null}
            <div className='flex flex-col justify-center items-center bg-black rounded-lg p-5 relative'>
                <Image src={'/webcam.png'} width={200} height={200} className='absolute' alt='webcam placeholder' />
                <Webcam
                    mirrored={true}
                    style={{ height: 300, width: '100%', zIndex: 10 }}
                    onUserMedia={() => setHasCamera(true)}
                    onUserMediaError={handleWebcamError}
                />
            </div>
            <div className='mt-5'>
                <p className='text-lg font-semibold'>
                    Time Remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </p>
            </div>
            {redirectCountdown !== null && (
                <p className='text-gray-500 mt-3'>
                    Redirecting to questions in {redirectCountdown} seconds...
                </p>
            )}
            <div className='flex gap-4 my-10'>
                <Button
                    disabled={!canRecord}
                    variant='outline'
                    onClick={startStopRecording}
                >
                    {isRecording ? (
                        <span className='text-red-600 flex gap-2'>
                            <StopCircle /> Stop Recording...
                        </span>
                    ) : (
                        <span className='flex gap-2'>
                            <Mic /> {isStopped ? 'Resume Recording' : 'Start Recording'}
                        </span>
                    )}
                </Button>
                {isStopped && (
                    <>
                        <Button
                            disabled={!canSubmit}
                            variant='default'
                            onClick={saveSelfIntroduction}
                        >
                            Submit
                        </Button>
                        <Button
                            disabled={loading || redirectCountdown !== null}
                            variant='outline'
                            onClick={restartRecording}
                        >
                            <RotateCcw className='mr-2' /> Restart
                        </Button>
                    </>
                )}
            </div>
            {speechError && (
                <p className='text-red-500'>Speech-to-Text Error: {speechError}</p>
            )}
        </div>
    );
};

export default SelfIntroduction;