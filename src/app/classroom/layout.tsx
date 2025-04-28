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
                <div className="flex h-[calc(100vh-40px)]">
                    {isOpen && <Sidebar />}
                    {children}
                </div>
            </div>

        </>

    );
}

export default ClassroomLayout;