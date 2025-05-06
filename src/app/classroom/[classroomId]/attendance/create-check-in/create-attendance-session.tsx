"use client"


import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button';
import { ChevronRight, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/hooks/use-confirm';
import { toast } from 'sonner';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { useClassroomId } from '@/hooks/use-classroom-id';
import { useCreateAttendanceSession } from '@/features/attendances/api/use-crate-attendance';
import { useGetAttendanceSession } from '@/features/attendances/api/use-get-attendacne-session';
import { useRemoveAttendanceSession } from '@/features/attendances/api/use-remove-attendance-session';
import { Id } from '../../../../../../convex/_generated/dataModel';

function CreateAttendanceSession() {

    const router = useRouter();

    const classroomId = useClassroomId();

    const [CreateAttendanceSessionDialog, confirmCreateAttendanceSession] = useConfirm(
        "เริ่มการสร้างการเช็คชื่อ?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );

    const [RemoveAttendanceSessionDialog, confirmRemoveAttendanceSession] = useConfirm(
        "ลบการเช็คชื่อ?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้! คุณต้องการลบการเช็คชื่อใช่ไหม ประวัติการเช็คชื่อของนักเรียนใน รอบนี้ จะถูกลบออกไป"
    );


    const [form, setForm] = useState({
        title: "",
        startTime: "",
        endTime: "",
        endTeaching: "",
    });



    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        setForm((prev) => ({
            ...prev,
            title: `เช็คชื่อประจำวันที่ ${formattedDate}`,
        }));
    }, []);

    useEffect(() => {
        const now = new Date();
        const localDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        setForm((prevForm) => ({
            ...prevForm,
            startTime: localDateTime, // ใช้เวลาเครื่องจริง ๆ
        }));
    }, []);



    const { mutate: createAttendanceSession } = useCreateAttendanceSession();
    const { data: attendanceSession, isLoading: loadingAttendanceSession } = useGetAttendanceSession({ classroomId });
    const { data: user, isLoading: userLoading } = useCurrentUser();

    const { mutate: RemoveAttendanceSession } = useRemoveAttendanceSession();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

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

    const handleCreateAttendanceSession = async () => {

        const ok = await confirmCreateAttendanceSession();
        if (!ok) return;

        if (!form.title) {
            toast.error("กรุณาระบุ หัวข้อ!");
            return;
        }

        if (!form.startTime) {
            toast.error("กรุณาระบุ เวลาเริ่มการเช็คชื่อ!");
            return;
        }

        if (!form.endTime) {
            toast.error("กรุณาระบุ เวลาสิ้นสุดการเช็คชื่อ!");
            return;
        }

        if (!form.endTeaching) {
            toast.error("กรุณาระบุ เวลาสิ้นสุดการสอน!");
            return;
        }

        const { startTime, endTime, endTeaching } = form;

        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();
        const teachingEnd = new Date(endTeaching).getTime();

        if (start && end && teachingEnd) {
            if (end < start) {
                toast.error("เวลาสิ้นสุดการเช็คชื่อ (endTime) ต้องไม่น้อยกว่าเวลาที่เริ่ม (startTime)");
                return;
            }
            if (teachingEnd < end) {
                toast.error("เวลาสิ้นสุดการสอน (endTeaching) ต้องไม่น้อยกว่าเวลาสิ้นสุดการเช็คชื่อ (endTime)");
                return;
            }
            if (teachingEnd < start) {
                toast.error("เวลาสิ้นสุดการสอน (endTeaching) ต้องไม่น้อยกว่าเวลาที่เริ่ม (startTime)");
                return;
            }
        }


        try {
            // เรียกฟังก์ชัน mutation ที่สร้างการเช็คชื่อ
            await createAttendanceSession({
                classroomId: classroomId,
                title: form.title,
                startTime: new Date(form.startTime).toISOString(),
                endTime: new Date(form.endTime).toISOString(),
                endTeaching: new Date(form.endTeaching).toISOString(),
            }, {
                onError: (error) => {
                    // ตรวจสอบข้อผิดพลาดจากการสร้างการเช็คชื่อ
                    if (error.message.includes("มีการเช็คชื่อที่กำลังเปิดอยู่ในห้องเรียนนี้")) {
                        // แสดงข้อความ error ที่เป็นข้อความที่คุณต้องการ
                        toast.error("มีการเช็คชื่อที่กำลังเปิดอยู่ในห้องเรียนนี้ ไม่สามารถสร้างรอบใหม่ได้");
                    } else {
                        // แสดงข้อความข้อผิดพลาดทั่วไป
                        toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
                    }
                }, onSuccess: () => {
                    toast.success("เริ่มสร้างการเช็คชื่อแล้ว!");
                }
            });
        } catch (error) {
            // ในกรณีที่เกิดข้อผิดพลาดภายใน try block (เช่นจาก network)
            toast.error("เกิดข้อผิดพลาด บางอย่าง!");
        }


    }

    const handleRemoveAttendance = async (id: string) => {
        const ok = await confirmRemoveAttendanceSession();
        if (!ok) return;

        try {
            // เรียกฟังก์ชัน mutation ที่สร้างการเช็คชื่อ
            await RemoveAttendanceSession({
                id: id as Id<"attendanceSession">
            }, {
                onError: (error) => {
                    // ตรวจสอบข้อผิดพลาดจากการสร้างการเช็คชื่อ
                    if (error.message.includes("มีการเช็คชื่อที่กำลังเปิดอยู่ในห้องเรียนนี้")) {
                        // แสดงข้อความ error ที่เป็นข้อความที่คุณต้องการ
                        toast.error("มีการเช็คชื่อที่กำลังเปิดอยู่ในห้องเรียนนี้ ไม่สามารถสร้างรอบใหม่ได้");
                    } else {
                        // แสดงข้อความข้อผิดพลาดทั่วไป
                        toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
                    }
                }, onSuccess: () => {
                    toast.success("ลบสร้างการเช็คชื่อแล้ว!");
                }
            });
        } catch (error) {
            // ในกรณีที่เกิดข้อผิดพลาดภายใน try block (เช่นจาก network)
            toast.error("เกิดข้อผิดพลาด บางอย่าง!");
        }
    }




    useEffect(() => {
        if (!user || !classroomId) return;

        if (user.role !== "teacher") {
            router.back();
        }
    }, [user, classroomId]);

    if (userLoading || loadingAttendanceSession) {
        return (
            <div className="h-full flex-1 flex justify-center items-center flex-col gap-2 ">
                <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if(!classroomId || !user ){
        router.back();
        return;
    }




    return (
        <>
            <CreateAttendanceSessionDialog />
            <RemoveAttendanceSessionDialog />
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

                                    <div className='grid gap-1 mt-4 border p-2 rounded-sm'>
                                        <p className='text-red-500 bg-accent p-2 rounded-sm mt-2 mb-2'>
                                            การกระทำนี้ไม่สามารถย้อนกลับได้! คุณต้องการลบการเช็คชื่อใช่ไหม ประวัติการเช็คชื่อของนักเรียนใน รอบนี้ จะถูกลบออกไป
                                        </p>
                                        <Button
                                            variant={"outline"}
                                            className='cursor-pointer'
                                            onClick={() => handleRemoveAttendance(attendance._id)}
                                        >ลบการเช็คชื่อ</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="w-full h-full flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto messages-scrollbar">
                        <div className='w-full max-w-96 grid gap-2 border rounded-md p-4'>
                            <div className='grid gap-1'>
                                <p className='text-md font-semibold'>หัวข้อ</p>
                                <Input
                                    disabled={false}
                                    placeholder=''
                                    name='title'
                                    id='title'
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                    maxLength={50}
                                />
                            </div>
                            <div className='grid gap-1'>
                                <p className='text-md font-semibold'>เริ่มการเช็คชื่อ</p>
                                <Input
                                    disabled={false}
                                    type="datetime-local"
                                    name="startTime"
                                    id='startTime'
                                    value={form.startTime}
                                    onChange={handleChange}
                                    required
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            </div>
                            <div className='grid gap-1'>
                                <p className='text-md font-semibold'>สิ้นสุดการเช็คชื่อ</p>
                                <Input
                                    disabled={false}
                                    type="datetime-local"
                                    name="endTime"
                                    id='endTime'
                                    onChange={handleChange}
                                    required
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            </div>
                            <div className='grid gap-1'>
                                <p className='text-md font-semibold'>สิ้นสุดการสอน</p>
                                <Input
                                    disabled={false}
                                    type="datetime-local"
                                    name="endTeaching"
                                    id='endTeaching'
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <Button
                                variant={"default"}
                                className="cursor-pointer"
                                onClick={handleCreateAttendanceSession}
                            >เริ่มสร้างการเช็คชื่อ</Button>
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default CreateAttendanceSession