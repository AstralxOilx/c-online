import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel";
import { AlertCircle, ChevronDownIcon, LoaderCircle, MailIcon, UserRoundPlus, XIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link"; 
import { useRemoveChannelMember } from "../api/use-channel-remove-member";
import { useCurrentMember } from "../api/use-current-member";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
 
import { useClassroomId } from "@/hooks/use-classroom-id";
import { useGetChannelMember } from "../api/use-get-channel-member";
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import { usePanel } from "@/hooks/use-panel";
import { useChannelId } from "@/hooks/use-channel-Id";




interface ProfileProps {
    memberId: Id<"channelMembers">;
    onClose: () => void;
}



export const Profile = ({ memberId, onClose }: ProfileProps) => {

    const router = useRouter();

    const channelId = useChannelId();

    const [UpdateDialog, confirmUpdate] = useConfirm(
        "อัปเดตบทบาท?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );


    const [LeaveDialog, confirmLeave] = useConfirm(
        "ออกจากห้องแชท?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );

    const [RemoveDialog, confirmRemove] = useConfirm(
        "ลบสมาชิกออกจากห้องแชท?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );

    const classroomId = useClassroomId();

    const { data: currentMember, isLoading: isLoadingCurrentMember } = useCurrentMember({
        classroomId
    });

    const currentUser = useCurrentUser();

    const { data: member, isLoading: isLoadingMember } = useGetChannelMember({ id: memberId });

    const { mutate: removeMember, isPending: isRemovingMember } = useRemoveChannelMember();
    
    // console.log(member)
    const { onMemberChannel } = usePanel();

    const onRemove = async () => {

        const ok = await confirmRemove();

        if (!ok) return;


        removeMember({ id: memberId }, {
            onSuccess: () => {
                toast.success("ลบสมาชิกสำเร็จ!");
                onMemberChannel(channelId);
            },
            onError: () => {
                toast.error("เกิดข้อผิดพลาด ลบสมาชิกไม่สำเร็จ!")
            }
        })
    }

    const onLeave = async () => {
        const ok = await confirmLeave();

        if (!ok) return;


        removeMember({ id: memberId }, {
            onSuccess: () => {
                router.replace("/");
                toast.success("คุณออกจากห้องเรียนสำเร็จ!");
                router.replace("/");
                onClose();
            },
            onError: () => {
                toast.error("เกิดข้อผิดพลาด คุณออกจากห้องเรียนไม่สำเร็จ!")
            }
        })
    }



    if (isLoadingMember || isLoadingCurrentMember) {
        return (
            <div className="h-full w-full flex-col">
                <div className="flex justify-between items-center bg-secondary/50 h-[45px] overflow-hidden px-4">
                    <p className="text-lg font-bold">โปรไฟล์</p>
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

    if (!member || !currentUser) {
        return (
            <div className="h-full w-full flex-col">
                <div className="flex justify-between items-center bg-secondary/50 h-[45px] overflow-hidden px-4">
                    <p className="text-lg font-bold">โปรไฟล์</p>
                    <Button className="cursor-pointer" onClick={onClose} size={"sm"} variant={"ghost"}>
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="h-full w-full flex justify-center items-center flex-col gap-y-2 ">
                    <AlertCircle className="size-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">ไม่พบข้อมูลผู้ใช้!</p>
                </div>
            </div>
        )
    }

    const avatarFallback = member.user?.fname?.[0].toUpperCase() ?? "M";




    return (
        <>
            <UpdateDialog />
            <LeaveDialog />
            <RemoveDialog />
            <div className="h-full w-full flex-col">
                <div className="flex justify-between items-center bg-secondary/50 h-[45px] overflow-hidden px-4">
                    <p className="text-lg font-bold">โปรไฟล์</p>
                    <Button className="cursor-pointer" onClick={onClose} size={"sm"} variant={"ghost"}>
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="w-full flex flex-col justify-center items-center p-4">
                    <Avatar className="max-w-[256px] max-h-[256px] size-full object-cover rounded-sm mr-1">
                        <AvatarImage className="rounded-sm" alt={avatarFallback} src={member.image?.toString()} />
                        <AvatarFallback className="rounded-sm aspect-square text-6xl"> {avatarFallback}</AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex flex-col p-4">
                    <p className="text-xl font-bold">{member.user.fname + ' ' + member.user.lname}</p>
                    <p className="text-xs font-semibold text-muted-foreground">บทบาท:{roleMapping[member.user?.role]}</p>
                    <p className="text-xs font-semibold text-muted-foreground">รหัสประจำตัว:{member.user?.identificationCode}</p>


                    {member.status === "owner" ? (
                        <div className="flex items-center gap-2 mt-4">
                            <Button variant={"secondary"} className="w-full min-w-[160px]">
                                {statusMapping[member.status]}
                            </Button>
                        </div>
                    ) :
                        < >
                            {
                                currentUser.data?.role === "student" ? (
                                    <div className="flex items-center gap-2 mt-4 ">
                                        {
                                            currentUser.data?._id === member.user._id ? (
                                                <>
                                                    <Button variant={"secondary"} className="w-2/4 min-w-[160px] capitalize text-green-600">
                                                        {statusMapping[member.status]}
                                                    </Button>
                                                    <Button disabled={isRemovingMember} onClick={onLeave} variant={"secondary"} className="text-red-500 w-2/4 min-w-[140px] capitalize cursor-pointer">
                                                        {isRemovingMember ? (
                                                            <span className="flex gap-1"> <LoaderCircle className="animate-spin" />ออกจากห้องแชท</span>
                                                        ) : (
                                                            <span className="flex gap-1"> ออกจากห้องแชท</span>
                                                        )}
                                                    </Button>
                                                </>

                                            ) : (
                                                <Button variant={"secondary"} className="w-full min-w-[160px] capitalize text-green-600">
                                                    {statusMapping[member.status]}
                                                </Button>
                                            )
                                        }

                                    </div>
                                ) : currentUser.data?.role === "teacher" ? (
                                    <div className="flex items-center gap-2 mt-4">
                                        <Button variant={"secondary"} className="w-2/4 min-w-[160px] cursor-pointer text-green-600">
                                            {statusMapping[member.status]}
                                        </Button>
                                        {
                                            currentUser.data?._id === member.user._id ? (
                                                <Button disabled={isRemovingMember} onClick={onLeave} variant={"secondary"} className="text-red-500 w-2/4 min-w-[140px] capitalize cursor-pointer">
                                                    {isRemovingMember ? (
                                                        <span className="flex gap-1"> <LoaderCircle className="animate-spin" />ออกจากห้องแชท</span>
                                                    ) : (
                                                        <span className="flex gap-1">ออกจากห้องแชท</span>
                                                    )}
                                                </Button>
                                            ) : (
                                                <Button disabled={isRemovingMember} onClick={onRemove} variant={"secondary"} className="text-red-500 w-2/4 min-w-[140px] capitalize cursor-pointer">
                                                    {isRemovingMember ? (
                                                        <span className="flex gap-1"> <LoaderCircle className="animate-spin" />ออกจากห้องแชท</span>
                                                    ) : (
                                                        <span className="flex gap-1">ลบสมาชิก</span>
                                                    )}
                                                </Button>
                                            )
                                        }
                                    </div>
                                ) : null
                            }

                        </>

                    }


                </div >
                <Separator />
                <div className="flex flex-col p-4">
                    <p className="text-sm font-bold mb-4">ข้อมูลการติดต่อ</p>
                    <div className="flex items-center gap-2">
                        <div className="size-9 rounded-md bg-muted flex items-center justify-center">
                            <MailIcon className="size-4" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[13px] font-semibold text-muted-foreground">
                                ที่อยู่อีเมล์
                            </p>
                            <Link href={`mailto:${member.user.email}`}
                                className="text-sm hover:underline text-primary cursor-pointer"
                            >
                                {member.user?.email}
                            </Link>
                        </div>
                    </div>
                </div>
            </div >
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