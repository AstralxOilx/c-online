"use client";

import { useToggleSidebar } from "@/hooks/use-toggle-sidebar";
import { Sidebar } from "./sidebar";
import { Toolbar } from "./toolbar";

import "@stream-io/video-react-sdk/dist/css/styles.css"; 
import StreamVideoProvider from "@/providers/stream-client-provider";
  

interface ClassroomLayoutProps {
    children: React.ReactNode;
}

const ClassroomLayout = ({ children }: ClassroomLayoutProps) => {
    const { isOpen } = useToggleSidebar();
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