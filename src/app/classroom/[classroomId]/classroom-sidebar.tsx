

import {
    Backpack,
    ChartLine,
    ClipboardCheck,
    HashIcon,
    LoaderCircle,
    MessagesSquare,
    UserCheck,
    UserX,
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
import { UserItem } from "./user-item";
import { useGetActiveMembers } from "@/features/members/api/use-get-active-members";
import { useGetActiveMembersPending } from "@/features/members/api/use-get-pending-members";
import { useGetActiveMembersInactive } from "@/features/members/api/use-get-inactive-members";

export const ClassroomSidebar = () => {

    const router = useRouter();
    const classroomId = useClassroomId();
    const channelId = useChannelId();
    const [_isChannelModalOpen, setChannelModalOpen] = useCreateChannelModal();

    const pathname = usePathname();
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const { data: classroom, isLoading: classroomLoading } = useGetClassroom({ id: classroomId });
    const { data: channels, isLoading: channelsLoading } = useGetChannels({ classroomId });
    const { data: members, isLoading: membersLoading } = useGetActiveMembers({ classroomId });
    const { data: membersPending, isLoading: membersPendingLoading } = useGetActiveMembersPending({ classroomId });
    const { data: membersInactive, isLoading: membersInactiveLoading } = useGetActiveMembersInactive({ classroomId });


    if (classroomLoading || userLoading || channelsLoading || membersLoading || membersPendingLoading || membersInactiveLoading) {
        return (
            <div className="flex flex-col h-full items-center justify-center">
                <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!classroom || !channels || !user || !members) {
        router.replace('/classroom');
        return;
    }

    return (
        <div className="flex flex-col bg-secondary/30 h-full overflow-auto page-scrollbar">
            <ClassroomHeader data={classroom} isTeacher={user?.role === "teacher"} />
            <ClassroomSection
                icon={ChartLine}
                label="แดชบอร์ด"
                hint="แดชบอร์ด"
            >
                <SidebarItem
                    key={'dashboard'}
                    icon={HashIcon}
                    label={'dashboard'}
                    id={'dashboard'}
                    groups="dashboard"
                    variant={pathname.includes("/dashboard") ? "active" : "default"}
                />
            </ClassroomSection>
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
                                label={"ประวัติการเข้าเรียน"}
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
                                label={"ประวัติการเข้าเรียน"}
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
                                label={"ประวัติการส่งงาน/คะแนน"}
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
                                label={"ประวัติการส่งงาน/คะแนน"}
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
                    key={"meeting"}
                    icon={HashIcon}
                    label={"meeting"}
                    id={"meeting"}
                    groups="meeting"
                    variant={pathname.includes("/meeting") ? "active" : "default"}
                />

            </ClassroomSection>
            <ClassroomSection
                icon={UserCheck}
                label="สมาชิกที่เข้าร่วมแล้ว"
                hint="สมาชิกที่เข้าร่วมแล้ว"
            >
                {members
                    ?.filter((item) => item?.user?._id === user._id) // 🔍 เฉพาะสมาชิกที่ตรงกับตัวผู้ใช้
                    .map((item) => {
                        if (!item || !item._id) return null;
                        const isYou = item.user._id === user._id;
                        return (
                            <UserItem
                                key={item._id}
                                id={item._id}
                                label={`${item.user.fname} ${item.user.lname} (คุณ) / ${roleMapping[item.user.role]}`}
                                image={item.user.imageUrl?.toString() || ''}
                            />
                        );
                    })}

                {members
                    ?.filter((item) => item?.user?._id !== user._id) // ❌ ไม่เอาคนที่เป็น "คุณเอง"
                    .map((item) => {
                        if (!item || !item._id) return null;
                        return (
                            <UserItem
                                key={item._id}
                                id={item._id}
                                label={`${item.user.fname} ${item.user.lname} / ${roleMapping[item.user.role]}`}
                                image={item.user.imageUrl?.toString() || ''}
                            />
                        );
                    })}
            </ClassroomSection>
            {
                user.role === "teacher" ? (
                    <>
                        {/* <ClassroomSection
                            icon={User}
                            label="สมาชิกที่รออนุมัติ"
                            hint="สมาชิกที่รออนุมัติเข้าร่วมแล้ว"
                        >
                            {membersPending?.map((item) => {
                                if (!item || !item._id) return null;
                                const isYou = item?.user._id === user._id;
                                return (
                                    <UserItem
                                        key={item?._id}
                                        id={item?._id}
                                        label={isYou ? `${item?.user.fname} ${item?.user.lname} (คุณ) / ${roleMapping[item.user.role]}` : `${item?.user.fname} ${item?.user.lname} / ${roleMapping[item.user.role]}`}
                                        image={item?.user.imageUrl?.toString() || ''}
                                    />
                                );
                            })}
                        </ClassroomSection> */}
                        <ClassroomSection
                            icon={UserX}
                            label="สมาชิกที่ถูกระงับการใช้งาน"
                            hint="สมาชิกที่ถูกระงับการใช้งาน"
                        >
                            {membersInactive?.map((item) => {
                                if (!item || !item._id) return null;
                                const isYou = item?.user._id === user._id;
                                return (
                                    <UserItem
                                        key={item?._id}
                                        id={item?._id}
                                        label={isYou ? `${item?.user.fname} ${item?.user.lname} (คุณ) / ${roleMapping[item.user.role]}` : `${item?.user.fname} ${item?.user.lname} / ${roleMapping[item.user.role]}`}
                                        image={item?.user.imageUrl?.toString() || ''}
                                    />
                                );
                            })}
                        </ClassroomSection>
                    </>
                ) : null
            }
        </div>
    )
}

const roleMapping: Record<string, string> = {
    student: "นักเรียน",
    teacher: "ครู",
};