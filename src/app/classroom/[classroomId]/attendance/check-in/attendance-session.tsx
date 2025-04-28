"use client"


import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/hooks/use-confirm';
import { toast } from 'sonner';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { useClassroomId } from '@/hooks/use-classroom-id';
import { useGetAttendanceSession } from '@/features/attendances/api/use-get-attendacne-session';
import { useRemoveAttendanceSession } from '@/features/attendances/api/use-remove-attendance-session';
import { Id } from '../../../../../../convex/_generated/dataModel';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAttendance } from '@/features/attendances/api/use-attendance';

function AttendanceSession() {

    const router = useRouter();

    const classroomId = useClassroomId();

    const [statusAttendance, setStatusAttendance] = useState<"present" | "late" | "leave">("present");
    const [description, setDescription] = useState("");


    const [AttendanceSessionDialog, confirmAttendanceSession] = useConfirm(
        "เริ่มการสร้างการเช็คชื่อ?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );


    const { data: attendanceSession, isLoading: loadingAttendanceSession } = useGetAttendanceSession({ classroomId });
    const { data: user, isLoading: userLoading } = useCurrentUser();


    const { mutate: attendance } = useAttendance();

    const formatDate = (dateString: string | Date): string => {
        const date = new Date(dateString);

        // ตรวจสอบว่าเป็นวันที่ที่ถูกต้องหรือไม่
        if (isNaN(date.getTime())) {
            return ''; // ถ้าไม่ใช่วันที่ที่ถูกต้อง
        }

        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',  // ชื่อวันเต็ม
            year: 'numeric',  // ปี
            month: 'long',    // เดือนเต็ม
            day: 'numeric',   // วัน
            hour: '2-digit',  // ชั่วโมง (2 หลัก)
            minute: '2-digit', // นาที (2 หลัก)
            second: '2-digit', // วินาที (2 หลัก)
            hour12: false,    // ใช้เวลาแบบ 24 ชั่วโมง
        };

        // แปลงวันที่เป็นภาษาไทย
        return new Intl.DateTimeFormat('th-TH', options).format(date);
    };


    const handleAttendance = async (id: string) => {
        const ok = await confirmAttendanceSession();
        if (!ok) return;

        if (statusAttendance === "leave" && description.trim() === "") {
            toast.error("กรุณาระบุเหตุผลการลา!");
            return;
        }

        try {

            await attendance({
                sessionId: id as Id<"attendanceSession">,
                status: statusAttendance,
                description: description,
            }, {
                onError: (error) => {
                    // ตรวจสอบข้อผิดพลาดจากการสร้างการเช็คชื่อ
                    if (error.message.includes("คุณได้เช็คชื่อไปแล้ว")) {
                        // แสดงข้อความ error ที่เป็นข้อความที่คุณต้องการ
                        toast.error("คุณได้เช็คชื่อไปแล้ว ไม่สามารถเช็คชื่อใหม่ได้");
                    } else {
                        // แสดงข้อความข้อผิดพลาดทั่วไป
                        toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
                    }
                }, onSuccess: () => {
                    toast.success("เช็คชื่อเรียบร้อยแล้ว!");
                }
            });
        } catch (error) {
            // ในกรณีที่เกิดข้อผิดพลาดภายใน try block (เช่นจาก network)
            toast.error("เกิดข้อผิดพลาด บางอย่าง!");
        }
    }




    useEffect(() => {
        if (!user || !classroomId) return;

        if (user.role !== "student") {
            router.replace(`/classroom/${classroomId}`);
        }
    }, [user, classroomId]);

    if (userLoading || !classroomId || !user || loadingAttendanceSession) {
        return (
            <div className="h-full flex-1 flex justify-center items-center flex-col gap-2 ">
                <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }






    return (
        <>
            <AttendanceSessionDialog />
            {
                attendanceSession && attendanceSession.length > 0 ? (
                    attendanceSession.map((attendance) => (
                        <div key={attendance._id}>
                            <div className="w-full h-full flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto messages-scrollbar">
                                <div className='w-full max-w-96 grid gap-2 border rounded-md p-4'>
                                    <div className='grid gap-1'>
                                        <strong className='bg-accent p-2 rounded-sm'>ชื่อรอบการเช็คชื่อ</strong>
                                        <span className='pl-2 flex gap-1 items-center'>
                                            <ChevronRight className='size-4' />
                                            {attendance.title}
                                        </span>
                                    </div>
                                    <div className='grid gap-1'>
                                        <strong className='bg-accent p-2 rounded-sm'>เวลาเริ่มการเช็คชื่อ</strong>
                                        <span className='pl-2 flex gap-1 items-center'>
                                            <ChevronRight className='size-4' />
                                            {formatDate(attendance.startTime)}
                                        </span>
                                    </div>
                                    <div className='grid gap-1'>
                                        <strong className='bg-accent p-2 rounded-sm'>เวลาสิ้นสุดการเช็คชื่อ</strong>
                                        <span className='pl-2 flex gap-1 items-center'>
                                            <ChevronRight className='size-4' />
                                            {formatDate(attendance.endTime)}
                                        </span>
                                    </div>
                                    <div className='grid gap-1'>
                                        <strong className='bg-accent p-2 rounded-sm'>เวลาสิ้นสุดการสอน</strong>
                                        <span className='pl-2 flex gap-1 items-center'>
                                            <ChevronRight className='size-4' />
                                            {formatDate(attendance.endTeaching)}
                                        </span>
                                    </div>
                                    <div className='grid gap-1'>
                                        <strong className='bg-accent p-2 rounded-sm'>ครูผู้สร้าง</strong>
                                        <span className='pl-2 flex gap-1 items-center'>
                                            <ChevronRight className='size-4' />
                                            {attendance.creator?.fname + ' ' + attendance.creator?.lname}
                                        </span>
                                    </div>

                                    <div className='grid gap-1 mt-4'>
                                        {
                                            attendance.isCheckedIn ? (
                                                <>
                                                    <Button
                                                        variant={"secondary"}  
                                                    >คุณได้เช็คชื่อไปแล้ว</Button>
                                                </>
                                            ) : (
                                                <>
                                                    {
                                                        new Date() >= new Date(attendance.startTime) ? (
                                                            <div className='grid gap-1'>
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700">สถานะการเข้าเรียน</label>
                                                                        <Select
                                                                            value={statusAttendance}
                                                                            onValueChange={(value) => setStatusAttendance(value as "present" | "late" | "leave")}
                                                                        >
                                                                            <SelectTrigger className="w-full">
                                                                                <SelectValue placeholder="เลือกสถานะ" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="present">มาเรียน</SelectItem>
                                                                                <SelectItem value="leave">ลา</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>

                                                                    {statusAttendance === "leave" && (
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700">
                                                                                เหตุผลการลา <span className="text-red-500">*</span>
                                                                            </label>
                                                                            <textarea
                                                                                onChange={(e) => setDescription(e.target.value)}
                                                                                rows={3}
                                                                                className="p-2 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                                placeholder="ใส่เหตุผล เช่น ลาป่วย, ติดธุระ ฯลฯ"
                                                                                maxLength={255}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Button
                                                                    variant={"default"}
                                                                    className='cursor-pointer'
                                                                    onClick={() => handleAttendance(attendance._id)}
                                                                >เช็คชื่อ</Button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                variant={"secondary"}
                                                            >ยังไม่ถึงเวลา</Button>
                                                        )
                                                    }
                                                </>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="w-full h-full flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto messages-scrollbar">
                        <div className='w-full max-w-96 grid gap-2 border rounded-md p-4'>
                            ไม่มีการเช็คชื่อ
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default AttendanceSession