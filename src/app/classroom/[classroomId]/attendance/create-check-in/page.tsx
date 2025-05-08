"use client"


import React, { useEffect, useState } from 'react'
// import { Header } from '../header' 
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { useClassroomId } from '@/hooks/use-classroom-id';
import CreateAttendanceSession from './create-attendance-session';
import { Header } from '../header';
import Loader from '@/components/loader';

function CreateCheckInPage() {


    const router = useRouter();

    const classroomId = useClassroomId();

    const { data: user, isLoading: userLoading } = useCurrentUser();

    useEffect(() => {
        if (!user || !classroomId) return;

        if (user.role !== "teacher") {
            router.replace(`/classroom/${classroomId}`);
        }
    }, [user, classroomId]);

    if (userLoading) {
        return (
            <div className="h-full flex-1 flex justify-center items-center flex-col gap-2 ">
                <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!classroomId || !user || user?.role !== "teacher") {
        router.replace(`/classroom/${classroomId}`);
        return;
    }

    if (userLoading) {
        return <Loader />
    }

    return (
        <>
            <div className="w-full h-full flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto messages-scrollbar">
                <Header title='สร้างการเช็คชื่อ' />
                <CreateAttendanceSession />
            </div>
        </>
    )
}

export default CreateCheckInPage