"use client"


import React, { useEffect, useState } from 'react'
import { Header } from '../header'
import { LoaderCircle } from 'lucide-react';
import { useClassroomId } from '@/hooks/use-classroom-id';
import AttendanceRecordTable from './record';

function CreateCheckInPage() {


    const classroomId = useClassroomId();


    if (!classroomId) {
        return (
            <div className="h-full flex-1 flex justify-center items-center flex-col gap-2 ">
                <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }


    return (
        <>
            <Header title='ประวัติการเช็คชื่อ' />
            <div className="w-full h-full flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto messages-scrollbar">
                <AttendanceRecordTable />
            </div>
        </>
    )
}

export default CreateCheckInPage