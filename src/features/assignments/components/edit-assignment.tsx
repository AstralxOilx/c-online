"use client"

import { useClassroomId } from "@/hooks/use-classroom-id";
import { Id } from "../../../../convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { useConfirm } from "@/hooks/use-confirm";
import { useUpdateAssignmentText } from "../api/use-update-assignment-text";
import { useGetAssignment } from "../api/use-get-assignment";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Paperclip, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUpdateAssignmentFile } from "../api/use-update-assignment-file";
import { useRemoveAssignmentFile } from "../api/use-remove-file";
import { useRemoveAssignment } from "../api/use-remove-assignment";




interface ThreadProps {
    assignmentId: Id<"assignments">;
    onClose: () => void;
}


export const EditAssignment = ({
    assignmentId,
    onClose,
}: ThreadProps) => {

    // const router = useRouter();
    const classroomId = useClassroomId();

    const [files, setFiles] = useState<File[]>([]);

    // const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [score, setScore] = useState(0);
    const [publish, setPublish] = useState(false);
    const [dueDate, setDueDate] = useState('');

    const [UpdateDataTextDialog, confirmUpdateDataText] = useConfirm(
        "อัปเดต?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );
    const [RemoveFileDialog, confirmRemoveFile] = useConfirm(
        "ลบไฟลนี้?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );

    const [RemoveAssignmentDialog, confirmRemoveAssignment] = useConfirm(
        "ลบงานที่หมอบหมายนี้?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );


    const [SendAssignmentDialog, confirmSendAssignment] = useConfirm(
        "ส่งงานที่หมอบหมายนี้?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );




    const { mutate: updateAssignmentText, isPending: isUpdatingAssignmentText } = useUpdateAssignmentText();
    const { mutate: updateAssignmentFile, isPending: isUpdatingAssignmentFile } = useUpdateAssignmentFile();


    const { mutate: removeAssignment, isPending: isRemoveAssignment } = useRemoveAssignment();
    const { mutate: removeAssignmentFile, isPending: isRemoveAssignmentFile } = useRemoveAssignmentFile();

    const { data: assignment, isLoading: loadingAssignment } = useGetAssignment({ id: assignmentId });


    const formatDateForInput = (isoString: string): string => {
        const date = new Date(isoString);
        const offset = date.getTimezoneOffset(); // จำนวนนาทีที่ต้อง offset จาก UTC

        const localDate = new Date(date.getTime() - offset * 60 * 1000);
        return localDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
    };

    useEffect(() => {
        if (assignment) {
            setName(assignment.name);
            setDescription(assignment.description);
            setScore(assignment.score);
            setDueDate(formatDateForInput(assignment.dueDate));
            setPublish(assignment.publish);
        }

    }, [assignment]);

     useEffect(() => {
            if (loadingAssignment) {
                setFiles([]); // ล้างทุกครั้งที่โหลดใหม่
            }
        }, [loadingAssignment]);

    const downloadFile = async (file: { url: string; name: string }) => {
        const response = await fetch(file.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleDeleteFile = async (id: string) => {
        const ok = await confirmRemoveFile();

        if (!ok) return;

        // ใช้ id เป็น string ตรงๆ โดยไม่ต้องแปลง
        removeAssignmentFile({ id: id as Id<"files">, assignmentId }, {
            onSuccess: () => {
                toast.success("ลบไฟล์สำเร็จ!");
            },
            onError: () => {
                toast.error("เกิดข้อผิดพลาด ลบไฟล์ไม่สำเร็จ!");
            }
        });
    };


    const onUpdateDataText = async () => {

        const ok = await confirmUpdateDataText();
        if (!ok) return;

        updateAssignmentText({
            id: assignmentId as Id<"assignments">,
            name,
            description,
            publish: publish,
            dueDate: new Date(dueDate).toISOString(),
            score,
        }, {
            onSuccess: () => {
                toast.success("แก้ไขข้อความสำเร็จแล้ว!");
            },
            onError: () => {
                toast.error("เกิดข้อผิดพลาด แก้ไขข้อความไม่สำเร็จ!");
            }
        });

    }

    const onUpdateDataFile = async () => {
        // 1. ทำการยืนยันก่อนทำการอัปเดตข้อมูล
        const ok = await confirmUpdateDataText();
        if (!ok) return; // ถ้าไม่ยืนยันก็จะไม่ทำอะไร 

        if (files.length <= 0) {
            toast.error("เกิดข้อผิดพลาด กรุณาเพิ่มไฟล์!");
            return;
        }

        await updateAssignmentFile({
            assignmentId: assignmentId as Id<"assignments">,
            fileObjects: files,
        }, {
            onSuccess: () => {
                toast.success("อัปโหลดไฟล์สำเร็จแล้ว!");
                setFiles([]);
            },
            onError: () => {
                toast.error("เกิดข้อผิดพลาด อัปโหลดไฟล์ไม่สำเร็จแล้ว!");
            }
        })

    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    };



    const handleDeleteAssignment = async () => {
        // 1. ทำการยืนยันก่อนทำการอัปเดตข้อมูล
        const ok = await confirmRemoveAssignment();
        if (!ok) return; // ถ้าไม่ยืนยันก็จะไม่ทำอะไร 

        removeAssignment({ assignmentId, classroomId }, {
            onSuccess: () => {
                toast.success("ลบงานที่หมอบหมายสำเร็จ!");
                onClose();
            },
            onError: () => {
                toast.error("เกิดข้อผิดพลาด ลบงานที่หมอบหมายไม่สำเร็จ!");
            }
        });

    };



    if (loadingAssignment) {
        return (
            <div className="h-full w-full flex-col">
                <div className="flex justify-between items-center bg-secondary/50 h-[45px] overflow-hidden px-4">
                    <p className="text-lg font-bold">งานที่หมอบหมาย</p>
                    <Button className="cursor-pointer" onClick={onClose} size={"sm"} variant={"ghost"}>
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="h-full flex justify-center items-center flex-col gap-2 ">
                    <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }


    return (
        <>
            <UpdateDataTextDialog />
            <RemoveFileDialog />
            <RemoveAssignmentDialog />
            <SendAssignmentDialog />
            <div className="flex flex-col h-full overflow-y-auto messages-scrollbar mb-16">
                <div className="h-full w-full flex justify-start items-center flex-col gap-y-2 p-1">
                    <div className=" w-full border p-2 rounded-sm grid gap-1">
                        <div className="flex justify-between items-center bg-secondary/50 h-[45px] overflow-hidden px-4">
                            <p className="text-lg font-bold">งานที่หมอบหมาย</p>
                            <Button className="cursor-pointer" onClick={onClose} size={"sm"} variant={"ghost"}>
                                <XIcon className="size-5 stroke-[1.5]" />
                            </Button>
                        </div>
                        <div className="flex flex-col h-full overflow-y-auto messages-scrollbar mb-16 p-4">
                            <div className="w-full bg-white rounded-lg shadow-md p-4">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">ชื่องานที่หมอบหมาย</label>
                                        <Input
                                            disabled={isUpdatingAssignmentText}
                                            type="text"
                                            name="name"
                                            placeholder="ชื่อการบ้าน"
                                            maxLength={50}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="border-gray-300 focus:ring-2 focus:ring-primary rounded-md mt-1"
                                        />
                                    </div>

                                    {/* คะแนนเต็ม */}
                                    <div>
                                        <label htmlFor="score" className="block text-sm font-medium text-gray-700">คะแนนเต็ม</label>
                                        <Input
                                            disabled={isUpdatingAssignmentText}
                                            type="number"
                                            name="score"
                                            placeholder="คะแนน"
                                            maxLength={50}
                                            value={score}
                                            onChange={(e) => setScore(Number(e.target.value))}
                                            className="border-gray-300 focus:ring-2 focus:ring-primary rounded-md mt-1"
                                        />
                                    </div>

                                    {/* คำอธิบาย */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">คำอธิบาย</label>
                                        <textarea
                                            disabled={isUpdatingAssignmentText}
                                            name="description"
                                            placeholder="คำอธิบาย"
                                            maxLength={255}
                                            className="w-full h-24 p-2 border-gray-300 focus:ring-2 focus:ring-primary rounded-md mt-1"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>

                                    {/* การเผยแพร่ */}
                                    <div className="flex items-center space-x-2">
                                        <label htmlFor="publish" className="text-sm font-medium text-gray-700">แผยแพร่</label>
                                        <input
                                            disabled={isUpdatingAssignmentText}
                                            type="checkbox"
                                            name="publish"
                                            id="publish"
                                            checked={publish}
                                            onChange={(e) => setPublish(e.target.checked)}
                                            className="border-gray-300 focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    {/* กำหนดส่ง */}
                                    <div>
                                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">กำหนดส่ง</label>
                                        <Input
                                            disabled={false}
                                            type="datetime-local"
                                            name="dueDate"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="border-gray-300 focus:ring-2 focus:ring-primary rounded-md mt-1"
                                            min={new Date().toISOString().slice(0, 16)}
                                        />
                                    </div>

                                    {/* ปุ่มอัปเดตข้อมูล */}
                                    <Button
                                        disabled={isUpdatingAssignmentText}
                                        variant="default"
                                        onClick={() => onUpdateDataText()}
                                        className="w-full flex items-center gap-1 cursor-pointer bg-primary text-white rounded-lg py-2 hover:bg-primary-dark"
                                    >
                                        อัปเดตข้อมูล
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-4 w-full border p-2 rounded-sm space-y-2 flex flex-col">
                                <p className="text-md font-semibold bg-accent p-2 rounded-sm shadow-md">ไฟล์แนบประกอบงานที่หมอบหมาย</p>
                                {assignment?.files?.some(f => f.url) ? (
                                    assignment.files
                                        .filter(f => f.url)
                                        .map((file) => (
                                            <div key={file.url} className="w-full flex items-center gap-4 p-1 rounded-md shadow-lg bg-white hover:bg-gray-50 border border-gray-200">
                                                {/* ปุ่มดาวน์โหลด */}
                                                <Button
                                                    disabled={isRemoveAssignmentFile}
                                                    variant="ghost"
                                                    onClick={() => downloadFile({ url: file.url!, name: file.name })}
                                                    className="cursor-pointer flex-1 flex justify-start items-center gap-3 text-sm text-gray-700 hover:text-primary"
                                                >
                                                    <Paperclip className="size-5 text-gray-600" />
                                                    <span className="truncate">{file.name}</span>
                                                </Button>

                                                {/* ปุ่มลบ */}
                                                <Button
                                                    disabled={isRemoveAssignmentFile}
                                                    variant="ghost"
                                                    onClick={() => handleDeleteFile(file.id)}
                                                    className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700"
                                                >
                                                    <XIcon className="size-4" />
                                                    ลบ
                                                </Button>
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-sm text-muted-foreground px-2">ไม่มีไฟล์แนบ</p>
                                )}
                            </div>
                            <div className="mt-4 w-full border p-2 rounded-sm space-y-2">
                                <p className="text-md font-semibold bg-accent p-2 rounded-sm">เพิ่มไฟล์</p>
                                <Input disabled={isUpdatingAssignmentFile} type="file" multiple onChange={handleFileChange} />
                                {files.length > 0 && (
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {files.map((file, index) => (
                                            <li key={index} className="border p-1 px-2 rounded flex justify-between items-center bg-muted/30">
                                                <span className="flex gap-1"> <Paperclip className="size-4" /> {file.name}</span>
                                                <Button
                                                    variant={"ghost"}
                                                    onClick={() => handleRemoveFile(index)}
                                                    className="flex items-center gap-1 cursor-pointer hover:text-red-600"
                                                >
                                                    <XIcon className="size-4" />
                                                    ลบ
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <Button className="w-full cursor-pointer" disabled={isUpdatingAssignmentFile} onClick={onUpdateDataFile}>อัปเดตไฟล์</Button>
                            </div>
                            <div className='grid gap-1 mt-4 border p-2 rounded-sm'>
                                <p className='text-red-500 bg-accent p-2 rounded-sm mt-2 mb-2'>
                                    การกระทำนี้ไม่สามารถย้อนกลับได้! คุณต้องการลบลบงานที่หมอบหมาย ประวัติลบงานที่หมอบหมายของนักเรียนใน รอบนี้ จะถูกลบออกไป
                                </p>
                                <Button
                                    variant={"destructive"}
                                    className='cursor-pointer'
                                    onClick={handleDeleteAssignment}
                                >ลบงานที่หมอบหมาย</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}