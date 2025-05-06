
"use client"

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation"; 
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import Loader from "@/components/loader";

export default function Home() {

  const router = useRouter();

  const { data: user, isLoading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (userLoading) return;

    if (user) {
      router.push(`/classroom`)
    }

  }, [user, userLoading])






  return <Loader />
}
