"use client"


import React, { useEffect, useState } from 'react'
// import { Header } from '../header' 
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { useClassroomId } from '@/hooks/use-classroom-id';
import AttendanceSession from './attendance-session';
import { Header } from '../header';

function CreateCheckInPage() {


    const router = useRouter();

    const classroomId = useClassroomId();

    const { data: user, isLoading: userLoading } = useCurrentUser();

    useEffect(() => {
        if (!user || !classroomId) return;

        if (user.role !== "student") {
            router.replace(`/classroom/${classroomId}`);
        }
    }, [user, classroomId]);

    if (userLoading || !classroomId || user?.role !== "student") {
        return (
            <div className="h-full flex-1 flex justify-center items-center flex-col gap-2 ">
                <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <>
            <div className="w-full h-full flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto messages-scrollbar">
                <AttendanceSession />
            </div>
        </>
    )
}

export default CreateCheckInPage