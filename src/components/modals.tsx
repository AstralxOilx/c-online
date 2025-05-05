"use client";
 
import { CreateChannelModal } from "@/features/channels/components/create-channel-modal";
import { CreateClassroomModal } from "@/features/classrooms/components/create-classroom-modal"; 
import { JoinClassroomModal } from "@/features/classrooms/components/join-classroom-modal";
import { EditProfileModal } from "@/features/members/components/edit-profile";
import { useEffect, useState } from "react";

export const Modals = () => {
    const [mounted, setMounted] = useState(false);


    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <>
            <CreateChannelModal />
            <CreateClassroomModal />
            <JoinClassroomModal/>
            <EditProfileModal/>
        </>
    )
}