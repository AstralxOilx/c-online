"use client"

import Loader from '@/components/loader';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { useGetGeneralChannel } from '@/features/channels/api/use-get-general-channels';
import { useCreateMessage } from '@/features/messages/api/use-crate-message';
import { useClassroomId } from '@/hooks/use-classroom-id';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { Input } from '@/components/ui/input';

const initialValues = {
    dateTime: new Date(),
    description: '',
    link: '',
};

type CreateMessageValues = {
    channelId: Id<"channels">;
    classroomId: Id<"classrooms">;
    body: string;
    image: Id<"_storage"> | undefined;
}

function CreateStreamPage() {

    const router = useRouter();
    const { data: user, isLoading: userLoading } = useCurrentUser();

    const [meetingState, setMeetingState] = useState<
        'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined
    >(undefined);
    const [values, setValues] = useState(initialValues);
    const [callDetail, setCallDetail] = useState<Call>();
    const client = useStreamVideoClient();

    const { mutate: createMessage } = useCreateMessage();
    const classroomId = useClassroomId();
    const { data: generalChannel, isLoading: generalChannelLoading } = useGetGeneralChannel({ classroomId });
    const [joinMeetingId, setJoinMeetingId] = useState('');

    const createMeeting = async () => {
        if (!client || !user) return;
        try {
            // if (!values.dateTime) {
            //     toast.error( 'Please select a date and time' );
            //     return;
            // }
            const id = crypto.randomUUID();
            const call = client.call('default', id);
            if (!call) throw new Error('Failed to create meeting');
            const startsAt =
                values.dateTime.toISOString() || new Date(Date.now()).toISOString();
            const description = values.description || 'Instant Meeting';
            await call.getOrCreate({
                data: {
                    starts_at: startsAt,
                    custom: {
                        description,
                    },
                },
            });
            setCallDetail(call);
            if (!values.description) {
                router.push(`/meeting/${call.id}`);
            }


            if (!classroomId || !generalChannel) return;

            const meetingUrl = `/meeting/${call.id}`;
            const mess = `${user.fname} ${user.lname} : `;
            const quillDelta = {
                ops: [
                    { insert: mess },
                    {
                        insert: `เริ่มต้นการ meeting id: ${call.id}`,
                        attributes: {
                            link: meetingUrl
                        }
                    },
                    { insert: '\n' }
                ]
            };
            const jsonString = JSON.stringify(quillDelta);


            const message: CreateMessageValues = {
                channelId: generalChannel as Id<"channels">,
                classroomId,
                body: jsonString,
                image: undefined,
            }

            await createMessage(message, { throwError: true });

            toast.success('Meeting Created');
        } catch (error) { 
            toast.error('Failed to create Meeting');
        }
    };

    if (!client || userLoading) return <Loader />;

    // const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`;




    const handleJoinMeeting = () => {
        if (joinMeetingId.trim() !== '') {
            router.push(`../meeting/${joinMeetingId}`);
        } else {
            alert('กรุณากรอกชื่อห้อง meeting');
        }
    };

    if (userLoading) {
        return <Loader />
    }

    if (!user) {
        router.back();
        return
    }

    return (
        <div className="mt-20 w-full max-w-md mx-auto bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl">
            {user.role === "teacher" ? (
                <>
                    <h2 className="text-2xl font-semibold text-center text-zinc-800 dark:text-white mb-6">
                        สร้างหรือเข้าร่วมการ meeting
                    </h2>

                    <div className="space-y-6 text-center">
                        {/* สร้างการประชุม */}
                        <div className="text-center">
                            <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-3">
                                สร้างการ meeting ใหม่
                            </p>
                            <Button
                                onClick={createMeeting}
                                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 transition rounded-xl"
                            >
                                สร้างการ meeting
                            </Button>
                        </div>
                    </div>
                </>
            ) : user.role === "student" ? (
                <>
                    <h2 className="text-2xl font-semibold text-center text-zinc-800 dark:text-white mb-6">
                        เข้าร่วมการ meeting
                    </h2>
                    <div className="space-y-3">
                        <Input
                            type="text"
                            placeholder="meeting id: "
                            onChange={(e) => setJoinMeetingId(e.target.value)}
                            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <Button
                            className="w-full bg-zinc-800 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition rounded-xl"
                            onClick={handleJoinMeeting}
                        >
                            เข้าร่วมการ meeting
                        </Button>
                    </div>
                </>
            ) : null}
        </div>
    );
}

export default CreateStreamPage

const roleMapping: Record<string, string> = {
    student: "นักเรียน",
    teacher: "ครู",
};