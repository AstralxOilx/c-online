"use client";

import { Button } from "@/components/ui/button"; 
import { AlertTriangle, LoaderCircle, MailIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMemberId } from "@/hooks/use-member-id"; 
import { useGetMember } from "@/features/members/api/use-get-member";
import { Header } from "./header";
import { useConfirm } from "@/hooks/use-confirm";
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useRemoveUserClassroomMember } from "@/features/members/api/use-classroom-remove-member";
import Link from "next/link";
import { useClassroomId } from "@/hooks/use-classroom-id";
import Loader from "@/components/loader";

const MemberIdPage = () => {
    const router = useRouter();
    const classroomId = useClassroomId();
    const memberId = useMemberId();;
    const { data: member, isLoading: memberLoading } = useGetMember({ id: memberId });
    const currentUser = useCurrentUser();
    const { mutate: removeMember, isPending: isRemovingMember } = useRemoveUserClassroomMember();
    const [LeaveDialog, confirmLeave] = useConfirm(
        "ออกจากห้องเรียน?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );

    const [RemoveDialog, confirmRemove] = useConfirm(
        "ลบสมาชิกออกจากห้องเรียน?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );


    const onRemove = async () => {

        const ok = await confirmRemove();

        if (!ok) return;


        removeMember({ id: memberId }, {
            onSuccess: () => {
                toast.success("ลบสมาชิกออกจากห้องเรียนสำเร็จ!");
                router.push(`/classroom/${classroomId}`);
            },
            onError: () => {
                toast.error("เกิดข้อผิดพลาด ลบสมาชิกออกจากห้องเรียนสำเร็จไม่สำเร็จ!")
            }
        })
    }

    const onLeave = async () => {
        const ok = await confirmLeave();

        if (!ok) return;


        removeMember({ id: memberId }, {
            onSuccess: () => { 
                toast.success("คุณออกจากห้องเรียนสำเร็จ!");
                router.replace('/classroom');
            },
            onError: () => {
                toast.error("เกิดข้อผิดพลาด คุณออกจากห้องเรียนไม่สำเร็จ!")
            }
        })
    }



    if (memberLoading) {
        return <Loader/>
    }

    if(!member){
        router.push(`/classroom/${classroomId}`);
        return;
    }

    const avatarFallback = member?.user?.fname?.[0].toUpperCase() ?? "M";

    return <>
        <Header
            memberName={`${member.user.fname} ${member.user.lname}`}
            memberImage={member.user.image}
        />
        <LeaveDialog />
        <RemoveDialog />
        <div className="h-full w-full flex-col">
            <div className="flex justify-between items-center bg-secondary/50 h-[45px] overflow-hidden px-4">
                <p className="text-lg font-bold">โปรไฟล์</p>
            </div>
            <div className="w-full flex flex-col justify-center items-center p-4">
                <Avatar className="max-w-[256px] max-h-[256px] size-full rounded-sm mr-1">
                    <AvatarImage className="rounded-sm" alt={avatarFallback} src={member.image?.toString()} />
                    <AvatarFallback className="rounded-sm aspect-square text-6xl"> {avatarFallback}</AvatarFallback>
                </Avatar>
            </div>
            <div className="flex flex-col p-4">
                <p className="text-xl font-bold">{member?.user.fname + ' ' + member?.user.lname}</p>
                <p className="text-xs font-semibold text-muted-foreground">บทบาท:{roleMapping[member?.user.role + '']}</p>
                <p className="text-xs font-semibold text-muted-foreground">รหัสประจำตัว:{member?.user?.identificationCode}</p>


                {member?.status === "owner" ? (
                    <div className="flex items-center gap-2 mt-4">
                        <Button variant={"secondary"} className="w-full min-w-[160px]">
                            {statusMapping[member?.status]}
                        </Button>
                    </div>
                ) :
                    < >
                        {
                            currentUser.data?.role === "student" ? (
                                <div className="flex items-center gap-2 mt-4 ">
                                    {
                                        currentUser.data?._id === member?.user._id ? (
                                            <>
                                                <Button variant={"secondary"} className="w-2/4 min-w-[160px] capitalize text-green-600">
                                                    {statusMapping[member.status]}
                                                </Button>
                                                <Button disabled={isRemovingMember} onClick={onLeave} variant={"secondary"} className="text-red-500 w-2/4 min-w-[140px] capitalize cursor-pointer">
                                                    {isRemovingMember ? (
                                                        <span className="flex gap-1"> <LoaderCircle className="animate-spin" />ออกจากห้องแชท</span>
                                                    ) : (
                                                        <span className="flex gap-1"> ออกจากห้องเรียน</span>
                                                    )}
                                                </Button>
                                            </>

                                        ) : (
                                            <Button variant={"secondary"} className="w-full min-w-[160px] capitalize text-green-600">
                                                {statusMapping[member?.status + '']}
                                            </Button>
                                        )
                                    }

                                </div>
                            ) : currentUser.data?.role === "teacher" ? (
                                <div className="flex items-center gap-2 mt-4">
                                    <Button variant={"secondary"} className="w-2/4 min-w-[160px] cursor-pointer text-green-600">
                                        {statusMapping[member?.status + '']}
                                    </Button>
                                    {
                                        currentUser.data?._id === member?.user._id ? (
                                            <Button disabled={false} onClick={onLeave} variant={"secondary"} className="text-red-500 w-2/4 min-w-[140px] capitalize cursor-pointer">
                                                {isRemovingMember ? (
                                                    <span className="flex gap-1"> <LoaderCircle className="animate-spin" />ออกจากห้องแชท</span>
                                                ) : (
                                                    <span className="flex gap-1">ออกจากห้องเรียน</span>
                                                )}
                                            </Button>
                                        ) : (
                                            <Button disabled={false} onClick={onRemove} variant={"secondary"} className="text-red-500 w-2/4 min-w-[140px] capitalize cursor-pointer">
                                                {isRemovingMember ? (
                                                    <span className="flex gap-1"> <LoaderCircle className="animate-spin" />ออกจากห้องแชท</span>
                                                ) : (
                                                    <span className="flex gap-1">ลบสมาชิกออกจากห้องเรียน</span>
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
                        {member?.user?.email && (
                            <Link
                                href={`mailto:${member.user.email}`}
                                className="text-sm hover:underline text-primary cursor-pointer"
                            >
                                {member.user.email}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

        </div >

    </>
}

export default MemberIdPage;


const roleMapping: Record<string, string> = {
    student: "นักเรียน",
    teacher: "ครู",
  };
const statusMapping: Record<string, string> = {
    owner: "ผู้สร้างห้อง",
    assistant: "ผู้ช่วยครู",
    active: "เข้าร่วมแล้ว",
    pending: "รอการอนุมัติ",
    inactive: "ถูกเชิญแต่ยังไม่เข้าร่วม",
    null: "---"
}