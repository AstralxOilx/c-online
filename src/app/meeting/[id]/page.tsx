

'use client';

import { useState, useEffect } from 'react';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useParams, useRouter } from 'next/navigation'; 

import { useGetCallById } from '@/hooks/useGetCallById';
import Alert from '@/components/Alert';
import MeetingSetup from '@/components/MeetingSetup';
import MeetingRoom from '@/components/MeetingRoom';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import Loader from '@/components/loader';

const MeetingPage = () => {
    const { id } = useParams();
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const { call, isCallLoading } = useGetCallById(id);
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const router = useRouter();

    // ตรวจสอบสถานะการโหลดข้อมูล
    useEffect(() => {
        if (userLoading || isCallLoading) return; // ยังไม่ได้โหลดข้อมูล
        if (!call) {
            // ถ้าไม่พบการประชุม 
            router.replace('/classroom'); // รีไดเร็กไปหน้า Classroom
        }
    }, [userLoading, isCallLoading, call, router]);

    // ตรวจสอบสถานะการประชุมว่าจบหรือยัง
    useEffect(() => {
        if (!call) return; // หากไม่พบข้อมูลการประชุม

        // ถ้า endedAt มีค่าแสดงว่าการประชุมจบแล้ว
        if (call.state?.endedAt) { 
            router.replace('/classroom'); // รีไดเร็กไปหน้า Classroom
        }
    }, [call?.state?.endedAt, router]); // useEffect ติดตามการเปลี่ยนแปลงของ endedAt

    if (userLoading || isCallLoading) return <Loader />;

    if (!call) return (
        <p className="text-center text-3xl font-bold text-black">
            Call Not Found
        </p>
    );

    const notAllowed = call.type === 'invited' && (!user || !call.state.members.find((m) => m.user.id === user._id));
    if (notAllowed) return <Alert title="You are not allowed to join this meeting" iconUrl="/call-ended.svg"/>;

    if (!user) {
        return <Alert title="ไม่พบข้อมูลผู้ใช้งาน" iconUrl="/call-ended.svg"/>;
    }

    const isAlreadyJoined = call.state.session?.participants.some(
        (p) => p.user.id === user._id
    );

    if (isAlreadyJoined) {
        return <Alert title="คุณกำลังเข้าร่วมห้องนี้อยู่แล้วจากอีกอุปกรณ์" iconUrl="/call-ended.svg"/>;
    }
 
    return (
        <main className="h-screen w-full">
            <StreamCall call={call}>
                <StreamTheme>
                    {!isSetupComplete ? (
                        <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
                    ) : (
                        <MeetingRoom />
                    )}
                </StreamTheme>
            </StreamCall>
        </main>
    );
};

export default MeetingPage;
