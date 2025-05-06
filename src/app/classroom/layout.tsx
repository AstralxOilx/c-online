"use client";

import { useToggleSidebar } from "@/hooks/use-toggle-sidebar";
import { Sidebar } from "./sidebar";
import { Toolbar } from "./toolbar";
 


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
                    {children}
                    {/* <StreamVideoProvider>{children}</StreamVideoProvider> */}
                </div>
            </div>

        </>

    );
}

export default ClassroomLayout;