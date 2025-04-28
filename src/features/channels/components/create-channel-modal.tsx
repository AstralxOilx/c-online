
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
import { useCreateChannelModal } from "../store/use-create-channel-modal";
import { useCreateChannel } from "../api/use-crate-channel";
import { useClassroomId } from "@/hooks/use-classroom-id";
export const CreateChannelModal = () => {

    const router = useRouter();

    const classroomId = useClassroomId();

    const [open, setOpen] = useCreateChannelModal();
    const [name, setName] = useState('');

    const { mutate, isPending } = useCreateChannel();



    const handleClose = () => {
        setOpen(false);
        setName('');
    }
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s+/g, "-").toLowerCase();

        setName(value);
    }


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        mutate(
            {
                name,
                classroomId,
            },
            {
                onSuccess: (id) => {
                    router.push(`/classroom/${classroomId}/channel/${id}`);
                    toast.success("เพิ่ม Channel สำเร็จ!");
                    handleClose();
                },
                onError: () => {
                    toast.error("เพิ่ม Channel ไม่สำเร็จ!");
                }
            }
        )
    }



    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>สร้างช่องแชทใหม่ใหม่</DialogTitle>
                </DialogHeader>
                <DialogDescription>สร้างช่องแชทใหม่</DialogDescription>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        value={name}
                        onChange={handleChange}
                        disabled={isPending}
                        required
                        autoFocus
                        minLength={3}
                        maxLength={30}
                        placeholder="e.g plan-budget"
                    />
                    <div className="flex justify-end">
                        <Button
                            disabled={isPending} 
                            className="flex gap-1 cursor-pointer">
                            {isPending ? <Plus className="size-6 animate-spin" /> : <Plus className="size-6" />}
                            <span >สร้างช่องแชท</span>
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
