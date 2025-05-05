
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle, 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react"; 
import { useRouter } from "next/navigation";
import { toast } from "sonner"; 
import { Plus } from "lucide-react"; 
import { useJoinClassroomModal } from "../store/use-join-classroom-modal";
import { useJoinCode } from "../api/use-join-code";

export const JoinClassroomModal = () => {

    const router = useRouter();

    const [open, setOpen] = useJoinClassroomModal();
    
    
    
    const { mutate, isPending } = useJoinCode();
    const [joinCode, setJoinCode] = useState('');

    const handleClose = () => {
        setOpen(false);
        setJoinCode('');
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        mutate({ joinCode: joinCode.trim() }, {
            onSuccess(id) {
                toast.success("joined classroom success");
                router.push(`/classroom/${id}`);
                handleClose();
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>เข้าร่วมห้องเรียนใหม่</DialogTitle>
                </DialogHeader>
                <DialogDescription>เข้าร่วมห้องเรียนใหม่ โดยใช้รหัส</DialogDescription>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        disabled={isPending}
                        required
                        autoFocus
                        minLength={3}
                        placeholder="join code classroom."
                    />
                    <div className="flex justify-end">
                        <Button disabled={isPending} className="flex gap-1 cursor-pointer">
                            {isPending ? <Plus className="size-6 animate-spin" /> : <Plus className="size-6" />}
                            <span >เข้าร่วมห้องเรียน</span>
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
