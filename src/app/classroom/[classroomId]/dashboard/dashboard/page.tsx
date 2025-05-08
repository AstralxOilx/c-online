"use client"

import React, { useEffect } from 'react'
import { Header } from '../header'
import { LoaderCircle } from 'lucide-react';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import DashboardTeacher from '@/features/dashboard/components/dashboard-teacher';
import DashboardStudent from '@/features/dashboard/components/dashboard-student';
import { useRouter } from 'next/navigation';
import { useClassroomId } from '@/hooks/use-classroom-id';
import Loader from '@/components/loader';

function DashboardPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const router = useRouter();
  const classroomId = useClassroomId();
  
  if (userLoading) {
    return <Loader />
  }

  if (!user) {
    router.replace('/classroom'); 
    return;
  }

  if (user?.role === "student") {
    return (
      <div className='flex flex-col h-full'>
        <Header title="แดชบอร์ด" />
        <DashboardStudent />
      </div>
    )
  } else if (user?.role === "teacher") {

    return (
      <div className='flex flex-col h-full'>
        <Header title="แดชบอร์ด" />
        <DashboardTeacher />
      </div>
    )
  }

  return (
    <div className="h-full flex-1 flex justify-center items-center flex-col gap-2 ">
      <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
    </div>
  );


}

export default DashboardPage