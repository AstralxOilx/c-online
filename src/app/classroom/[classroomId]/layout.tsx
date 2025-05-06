"use client";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ClassroomSidebar } from "./classroom-sidebar";
import { usePanel } from "@/hooks/use-panel";
import { Thread } from "@/features/messages/components/thread";
import { Profile } from "@/features/members/components/profile";
import { Id } from "../../../../convex/_generated/dataModel";
import { LoaderCircle } from "lucide-react";
import { MemberChannel } from "@/features/members/components/channel-member";
import { EditAssignment } from "@/features/assignments/components/edit-assignment";
import { StudentSubmitAssignment } from "@/features/assignments/components/student-submit-assignment";
import { SubmitAssignmentById } from "@/features/submitAssignment/components/submitmitAssignment";
import { useClassroomId } from "@/hooks/use-classroom-id";
import { useRouter } from "next/navigation";
import { useCurrentMemberClassroom } from "@/features/members/api/use-current-member-classroom";
import Loader from "@/components/loader";
import { useEffect, useState } from "react";



interface ClassroomIdLayoutProps {
    children: React.ReactNode;
}

const ClassroomIdLayout = ({ children }: ClassroomIdLayoutProps) => {

    const { parentMessageId, profileMemberId, memberChannelId, editAssignmentId, studentSubmitAssignmentId, submitAssignmentId, onClose } = usePanel();

    const showPanel = !!submitAssignmentId || !!parentMessageId || !!profileMemberId || !!memberChannelId || !!editAssignmentId || !!studentSubmitAssignmentId;
    const classroomId = useClassroomId();
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);

    const {
      data: isMemberClassroom,
      isLoading: isMemberClassroomLoading,
    } = useCurrentMemberClassroom({ classroomId: classroomId! });
    
    useEffect(() => {
      if (!classroomId) return;
    
      if (!isMemberClassroom && !isMemberClassroomLoading) {
        setIsRedirecting(true); // เริ่ม redirect
        router.back();
      }
    }, [classroomId, isMemberClassroom, isMemberClassroomLoading]);
    
    if (!classroomId || isMemberClassroomLoading || isRedirecting) {
      return <Loader />;
    }

    return (
        <>
            <div className="h-full w-full">
                <div className="flex h-[calc(100vh-40px)]">
                    <ResizablePanelGroup
                        direction="horizontal"
                        autoSaveId={"ca-workspace-layout"}
                    >
                        <ResizablePanel
                            defaultSize={20}
                            minSize={0}
                            className="bg-secondary/30"
                        >
                            <ClassroomSidebar />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel
                            minSize={1} defaultSize={80}
                        >

                            {children}

                        </ResizablePanel>
                        {
                            showPanel && (
                                <>
                                    <ResizableHandle withHandle />
                                    <ResizablePanel
                                        minSize={1}
                                        defaultSize={29}
                                    >
                                        {
                                            parentMessageId ? (
                                                <div className="h-full w-full">
                                                    <Thread
                                                        messageId={parentMessageId as Id<"messages">}
                                                        onClose={onClose}
                                                    />
                                                </div>
                                            ) : profileMemberId ? (
                                                <Profile
                                                    memberId={profileMemberId as Id<"channelMembers">}
                                                    onClose={onClose}
                                                />
                                            )
                                                : memberChannelId ? (
                                                    <MemberChannel
                                                        channelId={memberChannelId as Id<"channels">}
                                                        onClose={onClose}
                                                    />
                                                )
                                                    : editAssignmentId ? (
                                                        <EditAssignment
                                                            assignmentId={editAssignmentId as Id<"assignments">}
                                                            onClose={onClose}
                                                        />
                                                    )
                                                        : studentSubmitAssignmentId ? (
                                                            <StudentSubmitAssignment
                                                                assignmentId={studentSubmitAssignmentId as Id<"assignments">}
                                                                onClose={onClose}
                                                            />
                                                        )
                                                            : submitAssignmentId ? (
                                                                <SubmitAssignmentById
                                                                    assignmentId={submitAssignmentId as Id<"assignments">}
                                                                    onClose={onClose}
                                                                />
                                                            )
                                                                : (
                                                                    <div className="flex h-full items-center justify-center">
                                                                        <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
                                                                    </div>
                                                                )
                                        }
                                    </ResizablePanel>
                                </>
                            )
                        }
                    </ResizablePanelGroup>

                </div>
            </div>
        </>
    );
}

export default ClassroomIdLayout;