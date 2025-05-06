"use client"

import React from 'react';

import { Users, ClipboardCheck, CalendarCheck2Icon } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useGetTeacherDashboardData } from '../api/use-get-dashboard-teacher'; 
 
import { useClassroomId } from '@/hooks/use-classroom-id';
import Loader from '@/components/loader';
import { useRouter } from 'next/navigation';


function DashboardTeacher() {

    const router = useRouter();

    const classroomId = useClassroomId();
    const { data: dashboardData, isLoading: loadingDashboardData } = useGetTeacherDashboardData({ classroomId });


    if(loadingDashboardData){
        return <Loader/>
    }

    if(!dashboardData){
        router.push(`../../${classroomId}`);
        return;
    }


    return (
        <div className='h-full p-4 space-y-4 overflow-y-auto messages-scrollbar'>

            <div className="flex flex-col items-center justify-center p-4">
                <Card className="w-full rounded-sm shadow-lg bg-white border border-muted">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl font-bold text-primary">ทั่วไป</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            จำนวนนักเรียน, จำนวนงานที่มอบหมาย, จำนวนการเช็คชื่อ
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="w-full">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* นักเรียน */}
                            <Card className="flex-1 rounded-sm shadow-md border">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-semibold">จำนวนนักเรียน</CardTitle>
                                    <Users className="w-9 h-9 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <p>
                                        <span className="text-4xl font-bold">
                                            {dashboardData?.totalStudents ?? 0}
                                        </span>
                                        <span className="text-md ml-1">คน</span>
                                    </p>
                                </CardContent>
                            </Card>

                            {/* งานที่มอบหมาย */}
                            <Card className="flex-1 rounded-sm shadow-md border ">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-semibold">จำนวนงานที่มอบหมาย</CardTitle>
                                    <ClipboardCheck className="w-9 h-9 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <p>
                                        <span className="text-4xl font-bold">
                                            {dashboardData?.totalAssignments ?? 0}
                                        </span>
                                        <span className="text-md ml-1">งาน</span>
                                    </p>
                                </CardContent>
                            </Card>

                            {/* การเช็คชื่อ */}
                            <Card className="flex-1 rounded-sm shadow-md border">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-semibold">จำนวนการเช็คชื่อ</CardTitle>
                                    <CalendarCheck2Icon className="w-9 h-9 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <p>
                                        <span className="text-4xl font-bold">
                                            {dashboardData?.attendanceSessions ?? 0}
                                        </span>
                                        <span className="text-sm ml-1">ครั้ง</span>
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </div>



            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-7xl mx-auto">
                {/* ส่งงานตามสถานะ */}
                <Card className="rounded-lg shadow-md border border-transparent bg-gradient-to-br from-emerald-50 to-white p-2 w-full sm:w-[48%] lg:w-[45%]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-emerald-700">จำนวนการส่งงานตามสถานะ</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                            จำนวนนักเรียนที่ ส่งตรงเวลา, ส่งล้าช้า, ส่งใหม่
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-0">
                        <p>✅ ส่งตรงเวลา: <span className="font-semibold text-emerald-700">{dashboardData?.submitStatusSummary.submitted}</span></p>
                        <p>⌛ ส่งล้าช้า: <span className="font-semibold text-yellow-700">{dashboardData?.submitStatusSummary.late}</span></p>
                        <p>🔁 ส่งใหม่: <span className="font-semibold text-blue-700">{dashboardData?.submitStatusSummary.canResubmit}</span></p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-1 px-4 pb-2 text-xs text-muted-foreground"></CardFooter>
                </Card>
                {/* การเช็คชื่อ */}
                <Card className="rounded-lg shadow-md border border-transparent bg-gradient-to-br from-blue-50 to-white p-2 w-full sm:w-[48%] lg:w-[45%]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-blue-700">จำนวนการเช็คชื่อของนักเรียน</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                            จำนวนนักเรียนที่ ขาด, ลา, มาสาย, มาตรงเวลา
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>✅ ตรงเวลา: <span className="font-semibold text-green-700">{dashboardData?.attendanceStatusSummary.present}</span></p>
                        <p>⏰ สาย: <span className="font-semibold text-yellow-700">{dashboardData?.attendanceStatusSummary.late}</span></p>
                        <p>📝 ลา: <span className="font-semibold text-blue-700">{dashboardData?.attendanceStatusSummary.leave}</span></p>
                        <p>❌ ขาด: <span className="font-semibold text-red-700">{dashboardData?.attendanceStatusSummary.absent}</span></p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-1 px-4 pb-2 text-xs text-muted-foreground"></CardFooter>
                </Card>
            </div>










        </div>
    )
}

export default DashboardTeacher