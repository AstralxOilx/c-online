

import {
    AlertTriangle,
    Backpack,
    ClipboardCheck,
    HashIcon,
    LoaderCircle,
    MessagesSquare,
    RefreshCcw,
    Video,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import { useClassroomId } from "@/hooks/use-classroom-id";
import { useGetClassroom } from "@/features/classrooms/api/user-get-classroom";
import { ClassroomHeader } from "./classroom-header";
import { ClassroomSection } from "./classroom-section";
import { SidebarItem } from "./sidebar-item";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useChannelId } from "@/hooks/use-channel-Id";
import { Button } from "@/components/ui/button";

export const ClassroomSidebar = () => {

    const router = useRouter();
    const classroomId = useClassroomId();
    const channelId = useChannelId();
    const [_isChannelModalOpen, setChannelModalOpen] = useCreateChannelModal();

    const pathname = usePathname();

    const { data: user, isLoading: userLoading } = useCurrentUser();

    const { data: classroom, isLoading: classroomLoading } = useGetClassroom({ id: classroomId });
    const { data: channels, isLoading: channelsLoading } = useGetChannels({ classroomId });

    if (classroomLoading || userLoading || channelsLoading) {
        return (
            <div className="flex flex-col h-full items-center justify-center">
                <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!classroom || !channels || !user) {
        return (
            <div className="flex flex-col gap-y-2 h-full items-center justify-center">
                <AlertTriangle className="size-8 text-red-700" />
                <p className="text-red-700 text-sm">
                    ไม่พบข้อมูล ลองใหม่อีกครั้ง!
                </p>
                <Button
                    variant={"outline"}
                    onClick={() => router.replace("/")}
                    className="cursor-pointer"
                >
                    <RefreshCcw />
                    Refresh Data
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col bg-secondary/30 h-full">
            <ClassroomHeader data={classroom} isTeacher={user?.role === "teacher"} />
            <ClassroomSection
                icon={MessagesSquare}
                label="ช่องแชท"
                hint="สร้างช่องแชทใหม่"
                onNew={user.role === "teacher" ? () => setChannelModalOpen(true) : undefined}
            >
                {channels
                    .filter((item) => item !== null)
                    .map((item) => (
                        <SidebarItem
                            key={item._id}
                            icon={HashIcon}
                            label={item.name}
                            id={item._id}
                            variant={channelId === item._id ? "active" : "default"}
                        />
                    ))}
            </ClassroomSection>
            <ClassroomSection
                icon={ClipboardCheck}
                label="เช็คชื่อ"
                hint="สร้างช่องแชทใหม่"
            // onNew={user.role === "teacher" ? () => setChannelModalOpen(true) : undefined}
            >
                {
                    user.role === "teacher" ? (
                        <>
                            <SidebarItem
                                key={"create-check-in"}
                                icon={HashIcon}
                                label={"สร้างการเช็คชื่อ"}
                                id={"create-check-in"}
                                groups="attendance"
                                variant={pathname.includes("/create-check-in") ? "active" : "default"}

                            />
                            <SidebarItem
                                key={"record"}
                                icon={HashIcon}
                                label={"ประวัติ"}
                                id={"record"}
                                groups="attendance"
                                variant={pathname.includes("/record") ? "active" : "default"}

                            />
                        </>
                    ) : (
                        <>
                            <SidebarItem
                                key={"check-in"}
                                icon={HashIcon}
                                label={"เช็คชื่อ"}
                                id={"check-in"}
                                groups="attendance"
                                variant={pathname.includes("/check-in") ? "active" : "default"}

                            />
                            <SidebarItem
                                key={"record"}
                                icon={HashIcon}
                                label={"ประวัติ"}
                                id={"record"}
                                groups="attendance"
                                variant={pathname.includes("/record") ? "active" : "default"}

                            />
                        </>
                    )
                }
            </ClassroomSection>
            <ClassroomSection
                icon={Backpack}
                label="งานที่หมอบหมาย"
                hint="งานที่หมอบหมาย"
            // onNew={user.role === "teacher" ? () => setChannelModalOpen(true) : undefined}
            >

                {
                    user.role === "teacher" ? (
                        <>
                            <SidebarItem
                                key={"add-assignment"}
                                icon={HashIcon}
                                label={"เพิ่มการบ้านใหม่"}
                                id={"add-assignment"}
                                groups="assignment"
                                variant={pathname.includes("/add-assignment") ? "active" : "default"}
                            />
                            <SidebarItem
                                key={"private-assignment"}
                                icon={HashIcon}
                                label={"การบ้านที่ยังไม่แผยแพร่"}
                                id={"private-assignment"}
                                groups="assignment"
                                variant={pathname.includes("/private-assignment") ? "active" : "default"}
                            />
                            <SidebarItem
                                key={"public-assignment"}
                                icon={HashIcon}
                                label={"การบ้านที่แผยแพร่"}
                                id={"public-assignment"}
                                groups="assignment"
                                variant={pathname.includes("/public-assignment") ? "active" : "default"}
                            />
                            <SidebarItem
                                key={"score-assignment"}
                                icon={HashIcon}
                                label={"คะแนน"}
                                id={"score-assignment"}
                                groups="assignment"
                                variant={pathname.includes("/score-assignment") ? "active" : "default"}
                            />
                        </>
                    ) : (
                        <>
                            <SidebarItem
                                key={"n-assignment"}
                                icon={HashIcon}
                                label={"ยังไม่ส่ง"}
                                id={"n-assignment"}
                                groups="assignment"
                                variant={pathname.includes("/n-assignment") ? "active" : "default"}
                            />
                            <SidebarItem
                                key={"completed-assignment"}
                                icon={HashIcon}
                                label={"ส่งแล้ว"}
                                id={"completed-assignment"}
                                groups="assignment"
                                variant={pathname.includes("/completed-assignment") ? "active" : "default"}
                            />
                            <SidebarItem
                                key={"score-assignment"}
                                icon={HashIcon}
                                label={"คะแนน"}
                                id={"score-assignment"}
                                groups="assignment"
                                variant={pathname.includes("/score-assignment") ? "active" : "default"}
                            />
                        </>
                    )
                }
            </ClassroomSection>
            <ClassroomSection
                icon={Video}
                label="เริ่มเรียน"
                hint="เริ่มเรียน"
            // onNew={user.role === "teacher" ? () => setChannelModalOpen(true) : undefined}
            >
                <SidebarItem
                    key={"stream"}
                    icon={HashIcon}
                    label={"สตรีม"}
                    id={"stream"}
                    groups="stream"
                    variant={pathname.includes("/stream") ? "active" : "default"}
                />

            </ClassroomSection>
        </div>
    )
}