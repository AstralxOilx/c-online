
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useNewJoinCode } from "@/features/classrooms/api/use-new-join-code";
import { useClassroomId } from "@/hooks/use-classroom-id";
import { useConfirm } from "@/hooks/use-confirm";
import { DialogClose } from "@radix-ui/react-dialog";
import { CopyIcon, RefreshCcw } from "lucide-react";
import { toast } from "sonner";


interface InviteModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    name: string;
    joinCode: string;
}



export const InviteModal = ({
    open,
    setOpen,
    name,
    joinCode
}: InviteModalProps) => {

    const [ConfirmDialog, confirm] = useConfirm(
        "คุณแน่ใจแล้วใช่หรือไม่?",
        "การกระทำดังกล่าวจะปิดการใช้งานรหัสเชิญปัจจุบันและสร้างรหัสเชิญใหม่"
    );

    const classroomId = useClassroomId();
    const { mutate, isPending } = useNewJoinCode();


    const handleNewCode = async () => {

        const ok = await confirm();

        if (!ok) return;

        mutate({ classroomId }, {
            onSuccess: () => {
                toast.success("รหัสคำเชิญถูกสร้างขึ้นใหม่แล้ว!")
            }
        })
    }

    const handleCopy = () => {
        const inviteLink = `${window.location.origin}/join/${classroomId}?joinCode=${joinCode}`;

        navigator.clipboard.writeText(inviteLink).then(() => toast.success("คัดลอกลิงก์เชิญไปยังคลิปบอร์ดแล้ว!"))
    }

    const handleCopyCode = () => {
        const inviteCode= joinCode;

        navigator.clipboard.writeText(inviteCode).then(() => toast.success("คัดลอกไปยังคลิปบอร์ดแล้ว!"))
    }


    return (
        <>
            <ConfirmDialog />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>เชิญผู้คนเข้าสู่ห้องเรียน {name}</DialogTitle>
                        <DialogDescription>
                            ใช้โค้ดด้านล่างนี้เพื่อเชิญผู้คนเข้าสู่ห้องเรียน  {name} ของคุณ
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-y-4 items-center justify-center py-10"> 
                            <Button
                                onClick={handleCopyCode}
                                variant={"ghost"}
                                size={"lg"}
                                className="cursor-pointer py-4 flex items-center"
                                disabled={isPending}
                            >
                                <p className=" text-4xl font-bold tracking-widest uppercase">{joinCode}</p>
                                <CopyIcon className="size-8 ml-2" />
                            </Button> 
                        <Button
                            onClick={handleCopy}
                            variant={"ghost"}
                            size={"sm"}
                            className="cursor-pointer"
                            disabled={isPending}
                        >
                            คัดลอกลิงค์
                            <CopyIcon className="size-4 ml-2" />
                        </Button>
                    </div>
                    <div className="flex items-center justify-between w-full">
                        <Button
                            onClick={handleNewCode}
                            variant={"outline"}
                            disabled={isPending}
                            className="cursor-pointer"
                        >
                            รหัสใหม่
                            <RefreshCcw className="size-4 ml-2" />
                        </Button>
                        <DialogClose asChild>
                            <Button
                                className="cursor-pointer"
                                disabled={isPending}
                            > ปิด </Button>
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}