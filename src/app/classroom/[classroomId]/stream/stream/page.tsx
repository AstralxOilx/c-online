"use client"

import { MediaRoom } from "@/features/stream/components/media-room";
import { useClassroomId } from "@/hooks/use-classroom-id";
import { LoaderCircle } from "lucide-react";

const StreamIdPage = () => {
    const classroomId = useClassroomId();

    if (!classroomId) {
        return (
            <div className="h-screen flex justify-center items-center">
                <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <>

            <MediaRoom
                chatId={classroomId + ''}
                video={false}
                audio={false}
            />
        </>
    )
}
export default StreamIdPage;