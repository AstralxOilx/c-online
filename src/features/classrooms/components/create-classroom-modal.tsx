
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
import { useCreateClassroomModal } from "../store/use-create-classroom-modal";
import { Plus } from "lucide-react";
import { useCreateClassroom } from "../api/use-crate-classroom";

export const CreateClassroomModal = () => {

    const router = useRouter();

    const [open, setOpen] = useCreateClassroomModal();
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
                    <DialogTitle>สร้างห้องเรียนใหม่</DialogTitle>
                </DialogHeader>
                <DialogDescription>สร้างห้องเรียนใหม่</DialogDescription>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isPending}
                        required
                        autoFocus
                        minLength={3}
                        maxLength={30}
                        placeholder="Class name e.g. 'Work' ,'Personal' ,'Home'"
                    />
                    <div className="flex justify-end">
                        <Button disabled={isPending} className="flex gap-1 cursor-pointer">
                            {isPending ? <Plus className="size-6 animate-spin" /> : <Plus className="size-6" />}
                            <span >สร้างห้องเรียน</span>
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
