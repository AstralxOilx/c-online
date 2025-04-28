
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import { useGetClassrooms } from "@/features/classrooms/api/user-get-classrooms";
import { useCreateClassroomModal } from "@/features/classrooms/store/use-create-classroom-modal";
import { useJoinClassroomModal } from "@/features/classrooms/store/use-join-classroom-modal";
import { useClassroomId } from "@/hooks/use-classroom-id";
import { EllipsisVertical, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export const ClassroomSwitcher = () => {

    const router = useRouter();
 
    const classroomId = useClassroomId();
    const [_isCreateModalOpen, setCreateModalOpen] = useCreateClassroomModal();
    const [_isJoinModalOpen, setJoinModalOpen] = useJoinClassroomModal();

    const { data: classrooms, isLoading: classroomsLoading } = useGetClassrooms();
    const { data: user, isLoading: userLoading } = useCurrentUser();

    const filteredClassrooms = classrooms?.filter(
        (classrooms) => classrooms?._id !== classroomId
    );

    const handleCreateOrJoinRoom = () => {
        if(user?.role === "teacher"){
            setCreateModalOpen(true);
        }else if (user?.role == "student"){
            setJoinModalOpen(true);
        } 
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="secondary"
                    className=" rounded-md border size-10 relative overflow-hidden bg-primary text-slate-100 hover:bg-bg-primary/90 cursor-pointer font-semibold text-xl"
                >
                    <Plus className="size-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start" className="w-64 overflow-y-auto page-scrollbar">
                <span className="text-xs text-muted-foreground py-4 px-2">
                    เพิ่มห้องเรียนของคุณ!
                </span>
                {
                    userLoading ? (
                        <DropdownMenuItem></DropdownMenuItem>
                    ) :
                        (
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={handleCreateOrJoinRoom}
                            >
                                <div className="size-9 relative overflow-hidden bg-[#f2f2f2] text-slate-800 font-semibold text-lg rounded-md flex items-center justify-center mr-2">
                                    <Plus className="size-6" />
                                </div>
                                {
                                    user?.role === "teacher" ? "สร้างห้องเรียนใหม่" : "เข้าร่วมห้องเรียน"
                                }
                            </DropdownMenuItem>
                        )
                }
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="grid gap-0.5">
                    <span className="text-xs text-muted-foreground">
                        ห้องเรียนของคุณ!
                    </span>
                </DropdownMenuLabel>
                {
                    classroomsLoading ? (
                        <div>กำลังโหลด...</div>
                    ) : (
                        filteredClassrooms?.map((classroom) => (
                            <DropdownMenuItem
                                key={classroom._id}
                                className="cursor-pointer capitalize"
                                onClick={() => router.push(`/classroom/${classroom._id}`)}
                            >
                                <div className="shrink-0 size-9 relative overflow-hidden bg-primary text-[#f2f2f2] font-semibold text-lg rounded-md flex items-center justify-center mr-2">
                                    {classroom.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="grid gap-1">
                                    <p className="truncate">{classroom.name}</p>
                                    <p className="flex text-xs truncate text-muted-foreground items-center gap-1">
                                        <span>ผู้สอน</span>
                                        <EllipsisVertical className="h-3 w-3" />
                                        {classroom.userId === user?._id ? (
                                            <span>คุณ</span>
                                        ) : (
                                            <span>{classroom.owner?.name}</span>
                                        )}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )
                }
            </DropdownMenuContent>
        </DropdownMenu >

    )
}