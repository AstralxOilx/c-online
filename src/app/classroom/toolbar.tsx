"use client";

import { Button } from "@/components/ui/button"
import { AlignJustify, TextSearch, X } from "lucide-react"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetClassroom } from "@/features/classrooms/api/user-get-classroom";
import { useClassroomId } from "@/hooks/use-classroom-id";
import { useToggleSidebar } from "@/hooks/use-toggle-sidebar";
import { useGetClassrooms } from "@/features/classrooms/api/user-get-classrooms";
import clsx from "clsx";



export const Toolbar = () => {

    const router = useRouter();
    const classroomId = useClassroomId();

    const [open, setOpen] = useState(false);
    const { toggle, isOpen } = useToggleSidebar();


    const { data: classrooms, isLoading: classroomsLoading } = useGetClassrooms();

    const filteredClassrooms = classrooms?.filter(
        (classrooms) => classrooms?._id !== classroomId
    );

    const onClassroomClick = (classroomId: string) => {
        setOpen(false);
        router.push(`/classroom/${classroomId}`)
    }

    return (
        <nav className="bg-background flex items-center justify-between h-10 p-1.5">
            <div className="p-2 ml-auto flex-1 flex items-center justify-start">
                <Button
                    variant={"ghost"}
                    onClick={toggle}
                    className="cursor-pointer rounded-sm"
                >
                    {
                        isOpen ? <X className="size-4" /> : <AlignJustify className="size-4" />
                    }

                </Button>
            </div>
            <div className="min-w-[280px] max-[642px] grow-[2] shrink">
                <Button
                    onClick={() => setOpen(true)}
                    size={"sm"}
                    variant={"ghost"}
                    className="shadow cursor-pointer w-full text-gray-500 justify-start h-8 px-2"
                >
                    <TextSearch className="size-4 mr-2" />
                    <span className="truncate">
                        ค้นหา
                    </span>
                </Button>

                <CommandDialog open={open} onOpenChange={setOpen}>
                    <CommandInput placeholder="ค้นหา...ห้องเรียน" />
                    <CommandList className="overflow-y-auto page-scrollbar">
                        <CommandEmpty>ไม่พบข้อมูล!</CommandEmpty>
                        <CommandGroup heading="">
                            {filteredClassrooms?.map((cls) => (
                                <CommandItem
                                    key={cls._id} onSelect={() => onClassroomClick(cls._id)}
                                    className="flex items-center justify-between p-1 border"
                                >
                                    <span className="font-semibold grid">
                                        <span>{cls.name}</span>
                                        <span className="text-xs text-muted-foreground">ผู้สร้าง:{cls.owner?.name}</span>
                                    </span>
                                    <span className={clsx(
                                        "text-xs font-semibold py-2 px-4 ",
                                        statusColor[cls.memberStatus]
                                    )}>
                                        {statusMapping[cls.memberStatus]} 
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </CommandDialog>


            </div>
            <div className="ml-auto flex-1 flex items-center justify-end" />
        </nav>
    )
}

const statusMapping: Record<string, string> = {
    owner: "คุณเป็นผู้สร้าง",
    assistant: "เข้าห้องเรียน",
    active: "เข้าห้องเรียน",
    pending: "รอการอนุมัติ",
    inactive: "ถูกระงับการใช้งาน",
    // null: "---"
}

const statusColor: Record<string, string> = {
    owner: "bg-primary  text-white border rounded-md",
    assistant: "bg-primary  text-white border rounded-md",
    active: "bg-primary  text-white border rounded-md",
    pending: "bg-yellow-500 border-yellow-600 text-white border rounded-md",
    inactive: "bg-gray-100 border-gray-500 text-gray-500 border rounded-md",
}
