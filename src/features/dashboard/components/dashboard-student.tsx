"use client"

import React from 'react'
import { useGetScoreStudent } from '@/features/dashboard/api/use-get-score-student';


import { CalendarArrowDown, CalendarCheck2, CalendarClock, CalendarSync, CalendarX2, TrendingUp } from "lucide-react"
 
import { useGetAttendanceStudentProps } from '../api/use-get-attendance-student'; 
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"; 
import { useClassroomId } from '@/hooks/use-classroom-id';
import Loader from '@/components/loader';
import { useRouter } from 'next/navigation';


function DashboardStudent() {

    const router = useRouter();
    
    const classroomId = useClassroomId();
    const { data: scoreStudent, isLoading: loadingScoreStudent } = useGetScoreStudent({ classroomId });
    const { data: attendanceStudent, isLoading: loadingAttendanceStudent } = useGetAttendanceStudentProps({ classroomId });
 

    if(loadingAttendanceStudent || loadingScoreStudent){
        return <Loader/>
    }

    if(!attendanceStudent || !scoreStudent){
        router.push(`../../${classroomId}`);
        return;
    }

    return (
        <div className='h-full p-4  overflow-y-auto messages-scrollbar'>
            <div className="flex flex-col items-center justify-center p-4">
                <Card className="w-full rounded-sm shadow-lg bg-white border border-muted">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl font-bold text-primary">งานที่มอบหมาย</CardTitle>
                        <CardDescription className='grid gap-1'>
                            <span>จำนวนการส่งงานตามสถานะ</span>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="w-full">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Card className="flex-1 rounded-sm shadow-md border">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-semibold">ส่งตรงเวลา</CardTitle>
                                    <CalendarCheck2 className="w-9 h-9 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <p>
                                        <span className="text-4xl font-bold">
                                            {scoreStudent?.submitStatusSummary.submitted ?? 0}
                                        </span>
                                        <span className="text-md ml-1">ครั้ง</span>
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="flex-1 rounded-sm shadow-md border ">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-semibold">ส่งล้า</CardTitle>
                                    <CalendarClock className="w-9 h-9 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <p>
                                        <span className="text-4xl font-bold">
                                            {scoreStudent?.submitStatusSummary.late ?? 0}
                                        </span>
                                        <span className="text-md ml-1">ครั้ง</span>
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="flex-1 rounded-sm shadow-md border">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-semibold">ส่งใหม่</CardTitle>
                                    <CalendarSync className="w-9 h-9 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <p>
                                        <span className="text-4xl font-bold">
                                            {scoreStudent?.submitStatusSummary.canResubmit ?? 0}
                                        </span>
                                        <span className="text-sm ml-1">ครั้ง</span>
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                    <CardFooter className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <div className="flex gap-2  p-2 px-4">
                            <span className="text-muted-foreground font-medium">จำนวนงานที่มอบหมาย</span>
                            <p className="text-foreground font-semibold">{scoreStudent?.totalAssignments ?? 0} งาน</p>
                        </div>

                        <div className="flex gap-2  p-2 px-4">
                            <span className="text-muted-foreground font-medium">งานที่ส่งแล้ว</span>
                            <p className="text-foreground font-semibold">{scoreStudent?.submissionCount ?? 0} งาน</p>
                        </div>

                        <div className="flex gap-2  p-2 px-4">
                            <span className="text-muted-foreground font-medium">งานที่ตรวจแล้ว</span>
                            <p className="text-foreground font-semibold">{scoreStudent?.scoredCount ?? 0} งาน</p>
                        </div>

                        <div className="flex gap-2  p-2 px-4">
                            <span className="text-muted-foreground font-medium">คะแนนรวม</span>
                            <p className="text-foreground font-semibold flex items-center gap-2">
                                {scoreStudent?.percentage !== null && scoreStudent?.percentage !== undefined ? (
                                    <>
                                        {scoreStudent.percentage.toFixed(2)}%
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                    </>
                                ) : (
                                    <>-</>
                                )}
                            </p>
                        </div>

                        <div className="flex gap-2  p-2 px-4">
                            <span className="text-muted-foreground font-medium">คะแนนรวมที่ได้</span>
                            <p className="text-foreground font-semibold">
                                {scoreStudent?.totalScore ?? 0} / {scoreStudent?.totalPossibleScore ?? 0}
                            </p>
                        </div>
                    </CardFooter>
                </Card>
            </div>
            <div className="flex flex-col items-center justify-center p-4">
                <Card className="w-full rounded-sm shadow-lg bg-white border border-muted">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl font-bold text-primary">การเข้าเรียน</CardTitle>
                        <CardDescription>จำนวนกาการเข้าเรียนตามสถานะ</CardDescription>
                    </CardHeader>

                    <CardContent className="w-full">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* นักเรียน */}
                            <Card className="flex-1 rounded-sm shadow-md border">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-semibold">ขาดเรียน</CardTitle>
                                    <CalendarX2 className="w-9 h-9 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <p>
                                        <span className="text-4xl font-bold">
                                            {attendanceStudent?.statusSummary.absent ?? 0}
                                        </span>
                                        <span className="text-md ml-1">ครั้ง</span>
                                    </p>
                                </CardContent>
                            </Card>

                            {/* งานที่มอบหมาย */}
                            <Card className="flex-1 rounded-sm shadow-md border ">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-semibold">ลา</CardTitle>
                                    <CalendarArrowDown className="w-9 h-9 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <p>
                                        <span className="text-4xl font-bold">
                                            {attendanceStudent?.statusSummary.leave ?? 0}
                                        </span>
                                        <span className="text-md ml-1">ครั้ง</span>
                                    </p>
                                </CardContent>
                            </Card>

                            {/* การเช็คชื่อ */}
                            <Card className="flex-1 rounded-sm shadow-md border">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-semibold">มาสาย</CardTitle>
                                    <CalendarClock className="w-9 h-9 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <p>
                                        <span className="text-4xl font-bold">
                                            {attendanceStudent?.statusSummary.late}
                                        </span>
                                        <span className="text-sm ml-1">ครั้ง</span>
                                    </p>
                                </CardContent>
                            </Card>

                            {/* การเช็คชื่อ */}
                            <Card className="flex-1 rounded-sm shadow-md border">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-semibold">ตรงเวลา</CardTitle>
                                    <CalendarCheck2 className="w-9 h-9 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <p>
                                        <span className="text-4xl font-bold">
                                            {attendanceStudent?.statusSummary.present}
                                        </span>
                                        <span className="text-sm ml-1">ครั้ง</span>
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default DashboardStudent