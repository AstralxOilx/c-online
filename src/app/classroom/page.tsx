"use client"

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import { useGetClassrooms } from "@/features/classrooms/api/user-get-classrooms";
import { useCreateClassroomModal } from "@/features/classrooms/store/use-create-classroom-modal";
import { useJoinClassroomModal } from "@/features/classrooms/store/use-join-classroom-modal";
import clsx from "clsx";
import { Backpack, ChartSpline, School, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const ClassroomPage = () => {
    const { data: classrooms, isLoading: classroomsLoading } = useGetClassrooms();
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const router = useRouter();

    const [_isCreateModalOpen, setCreateModalOpen] = useCreateClassroomModal();
    const [_isJoinModalOpen, setJoinModalOpen] = useJoinClassroomModal();

    const classroomId = useMemo(() => classrooms?.[0]?._id, [classrooms]);

    useEffect(() => {
        if (classroomsLoading || userLoading) return;

        if (!classroomId) {
            if (user?.role === "teacher") {
                setCreateModalOpen(true);
            } else if (user?.role == "student") {
                setJoinModalOpen(true);
            }
        }

    }, [classroomId, classroomsLoading])

    const handleClassroom = (id: string) => {
        router.push(`/classroom/${id}`);
    }
    const handleAssignment = (id: string) => {
        if (user?.role === "teacher") {
            router.push(`/classroom/${id}/assignment/public-assignment`)
        } else if (user?.role === "student") {
            router.push(`/classroom/${id}/assignment/n-assignment`);
        }
    }
    const handleDashboard = (id: string) => {
        router.push(`/classroom/${id}/dashboard/dashboard`);
    }

    return (
        <>
            <div className="w-full h-full p-4 flex flex-wrap gap-4">
                {classrooms?.map((cls) => (
                    <Card
                        key={cls._id}
                        className="w-96 shadow-md hover:shadow-xl transition-shadow duration-300 rounded-none bg-accent/20"
                    >
                        <CardHeader className="pb-2">
                            <p className="flex items-center justify-between">
                                <CardTitle className="text-xl font-bold text-cyan-900 truncate overflow-hidden whitespace-nowrap text-ellipsis">{cls.name}</CardTitle>
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="flex gap-2 items-center text-muted-foreground">
                                <span className="p-1 border rounded-sm" >
                                    <User className="w-4 h-4" />
                                </span>
                                <span className="truncate overflow-hidden whitespace-nowrap text-ellipsis text-sm">ผู้สอน:{cls.owner?.name}
                                    {
                                        user?._id === cls.owner?.id ? (
                                            "(คุณ)"
                                        ) : null
                                    }
                                </span>
                            </p>
                            <p className="flex gap-2 items-center">
                                <span
                                    onClick={() => { handleAssignment(cls._id) }}
                                    className="p-1 border rounded-md cursor-pointer">
                                    <Hint label="งานที่หมอบหมาย">
                                        <Backpack className="size-5 text-muted-foreground" />
                                    </Hint>
                                </span>
                                <span
                                    onClick={() => { handleDashboard(cls._id) }}
                                    className="p-1 border rounded-md cursor-pointer">
                                    <Hint label="แดชบอร์ด">
                                        <ChartSpline className="size-5 text-muted-foreground" />
                                    </Hint>
                                </span>
                            </p>
                        </CardContent>
                        <CardFooter>
                            <button
                                onClick={() => { handleClassroom(cls._id) }}
                                className={clsx(
                                    "w-full text-sm font-semibold py-2 px-4 ",
                                    statusColor[cls.memberStatus.toString()]
                                )}
                            >
                                {statusMapping[cls.memberStatus.toString()]}
                            </button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </>
    )
}
export default ClassroomPage;



const statusMapping: Record<string, string> = {
    owner: "เข้าห้องเรียน",
    assistant: "เข้าห้องเรียน",
    active: "เข้าห้องเรียน",
    pending: "รอการอนุมัติ",
    inactive: "ระงับการใช้งาน",
    // null: "---"
}

const statusColor: Record<string, string> = {
    owner: "bg-primary  text-white",
    assistant: "bg-primary  text-white",
    active: "bg-primary  text-white",
    pending: "bg-yellow-500 border-yellow-600 text-white",
    inactive: "bg-gray-100 border-gray-500 text-gray-500",
}
