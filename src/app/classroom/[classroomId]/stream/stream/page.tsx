"use client"

import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { useCurrentMember } from '@/features/members/api/use-current-member';
import { useClassroomId } from '@/hooks/use-classroom-id';
// import JitsiMeet from '@/features/stream/components/jitsi-meet' 
import { LoaderCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

const JitsiMeet = dynamic(() => import('@/features/stream/components/jitsi-meet'), { ssr: false });


function CreateStreamPage() {

    const router = useRouter();
    const workspaceId = useClassroomId();

    
        const { data: user, isLoading: userLoading } = useCurrentUser();
 

    if (!user || !workspaceId || userLoading) {
        return (
            <div className="h-full flex-1 flex justify-center items-center flex-col gap-2 ">
                <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }


    const handleRoomLink = (link: string) => {
        // console.log("Room link: ", link);
    };

    return (
        <div>
            <JitsiMeet displayName={workspaceId} onRoomLinkGenerated={handleRoomLink} />
        </div>
    );
}

export default CreateStreamPage