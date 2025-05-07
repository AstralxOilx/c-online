 
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent, 
    DialogDescription, 
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"; 
import { useRemoveClassroom } from "@/features/classrooms/api/use-remove-classroom";
import { useUpdateClassroom } from "@/features/classrooms/api/use-update-classroom";
import { useClassroomId } from "@/hooks/use-classroom-id";
import { useConfirm } from "@/hooks/use-confirm"; 
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface PreferencesModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    initialValue: string;
}


export const PreferencesModal = ({
    open, setOpen, initialValue
}: PreferencesModalProps) => {

    const [ConfirmDialog, confirm] = useConfirm(
        "คุณแน่ใจแล้วใช่ไหม ?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );

    const router = useRouter();

    const classroomId = useClassroomId();

    const [value, setValue] = useState(initialValue);
    const [editOpen, setEditOpen] = useState(false);

    const { mutate: updateClassroom, isPending: isUpdateClassroom } = useUpdateClassroom();
    const { mutate: removeClassroom, isPending: isRemovingClassroom } = useRemoveClassroom();

    const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const ok = await confirm();


        updateClassroom({
            id: classroomId,
            name: value
        }, {
            onSuccess: () => {
                toast.success("อัปเดตห้องเรียนแล้ว!");
                setEditOpen(false);
            },
            onError: () => {
                toast.error("ผิดพลาดในการอัปเดตห้องเรียน!");
            }
        })
    }

    const handleRemove = async () => {

        const ok = await confirm();

        if (!ok) return;

        removeClassroom({
            id: classroomId
        }, {
            onSuccess: () => {
                toast.success("ลบห้องเรียนแล้ว!");
                // setEditOpen(false);
                router.replace('/classroom');
            },
            onError: () => {
                toast.error("ผิดพลาดในการลบห้องเรียน!");
            }
        })
    }

    return (
        <>
            <ConfirmDialog />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-0 bg-gray-50 overflow-hidden">
                    <DialogHeader className="p-4 border-b bg-white">
                        <DialogTitle>{value}</DialogTitle>
                    </DialogHeader>
                    <DialogDescription></DialogDescription>
                    <div className="px-4 pb-4 flex flex-col gao-y-3">
                        <Dialog open={editOpen} onOpenChange={setEditOpen}>
                            <DialogTrigger asChild>
                                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">
                                            ห้องเรียน
                                        </p>
                                        <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                                            แก้ไข
                                        </p>
                                    </div>
                                    <p className="text-sm">
                                        {value}
                                    </p>
                                </div>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        เปลี่ยนชื่อห้องเรียนนี้
                                    </DialogTitle>
                                </DialogHeader>
                                <form className="space-y-4" onSubmit={handleEdit}>
                                    <Input
                                        value={value}
                                        disabled={isUpdateClassroom}
                                        onChange={(e) => setValue(e.target.value)}
                                        required
                                        autoFocus
                                        minLength={3}
                                        maxLength={80}
                                        placeholder="Class name e.g. 'Work' ,'Personal' ,'Home'"
                                    />
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant={"outline"} disabled={isUpdateClassroom}>
                                                ยกเลิก
                                            </Button>
                                        </DialogClose>
                                        <Button disabled={isUpdateClassroom} >บันทึก</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Button
                            disabled={isRemovingClassroom}
                            onClick={handleRemove}
                            variant={"destructive"}
                            className="cursor-pointer mt-6"
                            size={"lg"}

                        >
                            <TrashIcon className="size-4" />
                            <p className="text-sm font-semibold">ลบห้องเรียน</p>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </>
    )
}