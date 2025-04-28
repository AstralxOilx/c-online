"use client";
import { Bell, School } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@/features/auth/components/user-button";
import { SidebarButton } from "./sidebar-button";
import { ClassroomSwitcher } from "./classroom-switcher"; 


export const Sidebar = () => {
    
    const router = useRouter();
    const pathname = usePathname();

    return (
        <aside className="pt-4 w-[70px] h-full bg-background flex flex-col gap-y-4 items-center pb-4 " >
            <ClassroomSwitcher />
            <SidebarButton icon={School} label="ห้องเรียน" isActive={pathname.includes("/classroom")} onLink={() => { router.push('/classroom') }} />
            <SidebarButton icon={Bell} label="แจ้งเตือน" />
            <div className="flex flex-col items-center justify-center gap-y-1 mt-auto">
                <UserButton />
            </div>
        </aside >
    )
} 