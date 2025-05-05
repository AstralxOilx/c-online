
"use client"

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useGetClassrooms } from "@/features/classrooms/api/user-get-classrooms";
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import Loader from "@/components/loader";

export default function Home() {

  const router = useRouter();

  const { data: classrooms, isLoading: classroomsLoading } = useGetClassrooms();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const classroomId = useMemo(() => classrooms?.[0]?._id, [classrooms]);

  useEffect(() => {
    if (classroomsLoading || userLoading) return;

    if (classroomId) {
      router.push(`/classroom/${classroomId}/dashboard/dashboard`)
    } else {
      router.push(`/classroom`)
    }

  }, [classroomId, classroomsLoading])






  return <Loader/>
}
