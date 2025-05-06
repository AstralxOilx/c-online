"use client";

import { useToggleSidebar } from "@/hooks/use-toggle-sidebar";
import { Sidebar } from "./sidebar";
import { Toolbar } from "./toolbar";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import StreamVideoProvider from "@/providers/stream-client-provider";
import { useCurrentMemberClassroom } from "@/features/members/api/use-current-member-classroom";
import { useClassroomId } from "@/hooks/use-classroom-id";
import { useEffect, useState } from "react";
import Loader from "@/components/loader";
import { useRouter } from "next/navigation";


interface ClassroomLayoutProps {
    children: React.ReactNode;
}

const ClassroomLayout = ({ children }: ClassroomLayoutProps) => {
    const { isOpen } = useToggleSidebar();
   
    // return null; // หรือ UI อื่น ๆ ขณะรอ redirect

    return (

        <>
            <div className="h-full">
                <Toolbar />
                <div className="flex">
                    {isOpen && <Sidebar />}
                    <StreamVideoProvider>{children}</StreamVideoProvider>
                </div>
            </div>

        </>

    );
}

export default ClassroomLayout;