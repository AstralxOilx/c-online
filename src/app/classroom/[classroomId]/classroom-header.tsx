
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Doc } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { InviteModal } from "./invite-modal";
import { PreferencesModal } from "./preferences-modal";
import { useClassroomId } from "@/hooks/use-classroom-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import Loader from "@/components/loader";


interface ClassroomHeaderProps {
    data: Doc<"classrooms">;
    isTeacher: boolean;
}

export const ClassroomHeader = ({ data, isTeacher }: ClassroomHeaderProps) => {

    const [preferencesOpen, setPreferencesOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const classroomId = useClassroomId();

    const { data: currentMember, isLoading: isLoadingCurrentMember } = useCurrentMember({
        classroomId
    });

    if (isLoadingCurrentMember) {
        return <Loader/>
    }


    return (
        <>
            <InviteModal open={inviteOpen} setOpen={setInviteOpen} name={data.name} joinCode={data.joinCode} />
            <PreferencesModal open={preferencesOpen} setOpen={setPreferencesOpen} initialValue={data.name} permission={data.permission}/>
            <div className="flex items-center justify-between px-4 h-[49px] gap-0.5">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            className="rounded-md truncate cursor-pointer font-semibold w-auto text-md p-1.5 overflow-hidden"
                            size={"sm"}
                            variant={"ghost"}
                        >
                            <span className="text-md truncate">{data?.name}</span>
                            <ChevronDown className="size-4 ml-1 shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="start" className="w-64">
                        <DropdownMenuItem
                            className="cursor-pointer capitalize"
                        >
                            <div className="size-9 relative overflow-hidden bg-primary text-white font-semibold text-xl rounded-md flex items-center justify-center">
                                {data?.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col items-start">
                                <p className="font-bold">{data?.name}</p>
                                <p className="text-xs text-muted-foreground">กำลังใช้งาน</p>
                            </div>
                        </DropdownMenuItem> 
                        {isTeacher && currentMember?.status === "owner" && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer py-2"
                                    onClick={() => setInviteOpen(true)}
                                >
                                    <span className="truncate">เชิญบุคคลอื่นเข้าสู่ {data?.name}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer py-2"
                                    onClick={() => setPreferencesOpen(true)}
                                >
                                    <span className="truncate">การตั้งค่า</span>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className=" flex items-center gap-0.5" />
            </div>
        </>
    )
}