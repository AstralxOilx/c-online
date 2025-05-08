
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
import { ChevronDown, Plus } from "lucide-react";
import { useCreateClassroom } from "../api/use-crate-classroom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const CreateClassroomModal = () => {

    type PermissionType = "join_now" | "waiting";
    const [permission, setPermission] = useState<PermissionType>("join_now")
    const [open, setOpen] = useCreateClassroomModal();

    const router = useRouter();
    const [name, setName] = useState('');
    const { mutate, isPending } = useCreateClassroom();

    const handleClose = () => {
        setOpen(false);
        setName('');
    }

    const handleSelect = (value: PermissionType) => {
        setPermission(value)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        mutate({
            name: name.trim(),
            permission: permission,
        }, {
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
                <form onSubmit={handleSubmit} className="space-y-2">
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild className="w-full">
                            <Button variant="secondary">
                                {permission === "join_now" ? "อนุญาติให้เข้าร่วมทันที" : "รอการอนุมัติการเข้าร่วม"}
                                <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => handleSelect("join_now")}>
                                อนุญาติให้เข้าร่วมทันที
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleSelect("waiting")}>
                                รอการอนุมัติการเข้าร่วม
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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

 