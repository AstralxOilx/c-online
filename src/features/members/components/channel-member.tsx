import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel";
import { AlertCircle, LoaderCircle, UserRoundPlus, XIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentMember } from "../api/use-current-member";
import { useConfirm } from "@/hooks/use-confirm";

import { useClassroomId } from "@/hooks/use-classroom-id";
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import { useGetChannelMembers } from "../api/use-get-channel-members";
import { usePanel } from "@/hooks/use-panel";
import { Hint } from "@/components/hint"; 
import { useGetAvailableMembers } from "../api/use-get-available-members";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useEffect, useState } from "react";
import { useCreateMemberChannel } from "../api/use-crate-member-channel";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";




interface memberChannelProps {
    channelId: Id<"channels">;
    onClose: () => void;
}



export const MemberChannel = ({ channelId, onClose }: memberChannelProps) => {
    const router = useRouter();
    const classroomId = useClassroomId();
    const [open, setOpen] = useState(false);


    const [UpdateDialog, confirmUpdate] = useConfirm(
        "อัปเดตบทบาท?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );


    const [LeaveDialog, confirmLeave] = useConfirm(
        "ออกจากห้องเรียน?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );

    const [RemoveDialog, confirmRemove] = useConfirm(
        "ลบสมาชิกออกจากห้องเรียน?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );

    const currentUser = useCurrentUser();

    const { data: members, isLoading: isLoadingMembers } = useGetChannelMembers({ channelId });
    const { data: availableMembers, isLoading: isLoadingAvailableMembers } = useGetAvailableMembers({ channelId, classroomId });
    const { onOpenProfile } = usePanel();

    const { mutate: addChannelMember, isPending: isUpdatingAddChannelMember } = useCreateMemberChannel();

    const [localAvailableMembers, setLocalAvailableMembers] = useState<typeof availableMembers>([]);



    useEffect(() => {
        if (availableMembers) {
            setLocalAvailableMembers(availableMembers);
        }
    }, [availableMembers]);



    const handleAddMemberToChannel = async (userId: Id<"users">) => {
        addChannelMember(
            { channelId, userId },
            {
                onSuccess: () => {
                    toast.success("เพิ่มสมาชิกสำเร็จ!");

                    setLocalAvailableMembers((prev = []) => prev.filter(member => member.userId !== userId));
                },
                onError: () => {
                    toast.error("เกิดข้อผิดพลาด เพิ่มสมาชิกไม่สำเร็จ!");
                }
            }
        );
    };



    if (isLoadingMembers || isLoadingAvailableMembers) {
        return (
            <div className="h-full w-full flex-col">
                <div className="flex justify-between items-center bg-secondary/50 h-[45px] overflow-hidden px-4">
                    <p className="text-lg font-bold">สมาชิก</p>
                    <Button className="cursor-pointer" onClick={onClose} size={"sm"} variant={"ghost"}>
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <Loader/>
            </div>
        )
    }

    if (!members || !currentUser || !availableMembers) {
        router.back();
        return ;
    }





    return (
        <>
            <UpdateDialog />
            <LeaveDialog />
            <RemoveDialog />
            <div className="h-full w-full flex-col">
                <div className="flex justify-between items-center bg-secondary/50 h-[45px] overflow-hidden px-4">
                    {
                        currentUser.data?.role === "teacher" ? (
                            <div className="flex gap-1 items-center">
                                <p className="text-lg font-bold">สมาชิก</p>
                                <div className="min-w-[280px] max-[642px] grow-[2] shrink">
                                    <Hint label="เพิ่มสมาชิกในช่องแชท">
                                        <Button
                                            onClick={() => setOpen(true)}
                                            variant={"secondary"}
                                            className="cursor-pointer"
                                        >
                                            <UserRoundPlus className="size-4" />
                                        </Button>
                                    </Hint>
                                    <CommandDialog open={open} onOpenChange={setOpen}>
                                        <CommandInput placeholder="ค้นหา...สมาชิก" />
                                        <CommandList className="overflow-y-auto page-scrollbar">
                                            <CommandEmpty>ไม่พบข้อมูล!</CommandEmpty>
                                            <CommandGroup heading="">
                                                {localAvailableMembers?.map((member) => (
                                                    <CommandItem key={member._id} className="flex justify-between items-center">
                                                        <div className="flex gap-1 items-center">
                                                            <Avatar className="rounded-sm ml-2 border">
                                                                <AvatarImage className="w-[8px] h-[8px] object-cover rounded-sm" alt={member.user?.fname?.[0].toUpperCase() ?? "M"} src={member.user.imageUrl?.toString()} />
                                                                <AvatarFallback className="rounded-sm aspect-square text-xl  bg-primary text-white flex items-center justify-center">
                                                                    {member.user?.fname?.[0].toUpperCase() ?? "M"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {member.user?.fname + ' ' + member.user?.lname}
                                                        </div>
                                                        <Button
                                                            disabled={isUpdatingAddChannelMember}
                                                            variant={"secondary"}
                                                            onClick={() => handleAddMemberToChannel(member.userId)}
                                                            className="cursor-pointer"
                                                        >
                                                            {isUpdatingAddChannelMember ? (
                                                                <LoaderCircle className="animate-spin" />
                                                            ) : (
                                                                <UserRoundPlus />
                                                            )}
                                                        </Button>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>

                                        </CommandList>
                                    </CommandDialog>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-1 items-center">
                                <p className="text-lg font-bold">สมาชิก</p>
                            </div>
                        )
                    }
                    <Button className="cursor-pointer" onClick={onClose} size={"sm"} variant={"ghost"}>
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="">
                    {
                        members.map((m) => (
                            <div key={m._id} className="grid gap-1 p-1 overflow-y-auto page-scrollbar">
                                <div
                                    className="flex gap-1 items-center bg-accent/10 hover:bg-accent/30 p-1 rounded-sm ">
                                    <div
                                        onClick={() => { onOpenProfile(m._id) }}
                                        className="cursor-pointer "
                                    >
                                        <Avatar className="ml-2 rounded-sm overflow-hidden">
                                            <AvatarImage
                                                className="w-[8px] h-[8px] object-cover"
                                                src={m.user?.imageUrl?.toString()}
                                                alt={m.user?.fname?.[0].toUpperCase() ?? "M"}
                                            />
                                            <AvatarFallback className="w-full h-full text-sm bg-primary text-white flex items-center justify-center rounded-sm">
                                                {m.user?.fname?.[0].toUpperCase() ?? "M"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <span
                                        onClick={() => { onOpenProfile(m._id) }}
                                        className="cursor-pointer hover:underline flex gap-2 items-center truncate"
                                    >
                                        <span >{m.user.fname}</span>
                                        <span >{m.user.lname}</span>
                                        {
                                            currentUser.data?._id === m.user._id ? (
                                                <span className="text-xs text-muted-foreground">(คุณ)</span>
                                            ) : null
                                        }
                                    </span>

                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </>
    )
}


export const roleMapping: Record<string, string> = {
    teacher: "ครู/อาจารย์",
    student: "นักเรียน/นักศึกษา",
    null: "---"
};

export const statusMapping: Record<string, string> = {
    owner: "ผู้สร้างห้อง",
    assistant: "ผู้ช่วยครู",
    active: "เข้าร่วมแล้ว",
    pending: "รอการอนุมัติ",
    inactive: "ถูกเชิญแต่ยังไม่เข้าร่วม",
    null: "---"
}