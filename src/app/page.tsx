
"use client"

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation"; 
import { LoaderCircle } from "lucide-react"; 
import { useGetClassrooms } from "@/features/classrooms/api/user-get-classrooms";

export default function Home() {

  const router = useRouter();

  const { data: classrooms, isLoading: classroomsLoading } = useGetClassrooms();

  const classroomId = useMemo(() => classrooms?.[0]?._id, [classrooms]);

  useEffect(() => {
    if (classroomsLoading) return;

    if (classroomId) {
      router.replace(`/classroom/${classroomId}`)
    } else {
      router.replace(`/classroom`)
    }

  }, [classroomId, classroomsLoading])






  return (
    <div className="h-screen flex justify-center items-center">
      <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}
