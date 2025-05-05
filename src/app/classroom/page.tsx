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
import { Backpack, ChartSpline, School, User } from "lucide-react";
import { useRouter } from "next/navigation";

const ClassroomPage = () => {
    const { data: classrooms, isLoading: classroomsLoading } = useGetClassrooms();
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const router = useRouter();


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
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-bold text-cyan-900 truncate overflow-hidden whitespace-nowrap text-ellipsis">{cls.name}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="flex gap-2 items-center text-muted-foreground">
                                <p className="p-1 border rounded-sm" >
                                    <User className="w-4 h-4" />
                                </p>
                                <p className="truncate overflow-hidden whitespace-nowrap text-ellipsis text-sm">ผู้สอน:{cls.owner?.name}
                                    {
                                        user?._id === cls.owner?.id ? (
                                            "(คุณ)"
                                        ) : null
                                    }
                                </p>
                            </p>
                            <p className="flex gap-2 items-center">
                                <p
                                    onClick={() => { handleAssignment(cls._id) }}
                                    className="p-1 border rounded-md cursor-pointer">
                                    <Hint label="งานที่หมอบหมาย">
                                        <Backpack className="size-5 text-muted-foreground" />
                                    </Hint>
                                </p>
                                <p
                                    onClick={()=>{handleDashboard(cls._id)}}
                                    className="p-1 border rounded-md cursor-pointer">
                                    <Hint label="แดชบอร์ด">
                                        <ChartSpline className="size-5 text-muted-foreground" />
                                    </Hint>
                                </p>
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={() => { handleClassroom(cls._id) }}
                                variant={"default"}
                                className="w-full text-sm font-semibold py-2 px-4 rounded-sm"
                            >
                                <School />
                                เข้าห้องเรียน
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </>
    )
}
export default ClassroomPage;