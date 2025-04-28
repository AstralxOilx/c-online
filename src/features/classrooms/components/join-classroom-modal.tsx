
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
import { useCreateClassroom } from "../api/use-crate-classroom";
import { useJoinClassroomModal } from "../store/use-join-classroom-modal";

export const JoinClassroomModal = () => {

    const router = useRouter();

    const [open, setOpen] = useJoinClassroomModal();
    const [name, setName] = useState('');

    const { mutate, isPending } = useCreateClassroom();



    const handleClose = () => {
        setOpen(false);
        setName('');
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        mutate({ name: name.trim() }, {
            onSuccess(id) {
                toast.success("Classroom created");
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isPending}
                        required
                        autoFocus
                        minLength={3}
                        placeholder="join code wrbaowr."
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
