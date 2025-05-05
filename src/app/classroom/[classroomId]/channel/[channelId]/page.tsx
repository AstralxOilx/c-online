"use client";

import { Button } from "@/components/ui/button";
import { useChannelId } from "@/hooks/use-channel-Id";
import { AlertTriangle, LoaderCircle, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Header } from "./header";
import { ChatInput } from "./chat-input";
import { useGetChannel } from "@/features/channels/api/use-get-channel";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { MessageList } from "@/components/message-list";
import { useGetClassroom } from "@/features/classrooms/api/user-get-classroom";
import { useClassroomId } from "@/hooks/use-classroom-id";



const ChannelIdPage = () => {


    const router = useRouter();

    const channelId = useChannelId();
    const classroomId = useClassroomId();


    const { results, status, loadMore } = useGetMessages({ channelId });
    const { data: channel, isLoading: channelLoading } = useGetChannel({ id: channelId });
    const { data: classroom, isLoading: classroomLoading } = useGetClassroom({ id: classroomId });


    if (channelLoading || status === "LoadingFirstPage") {
        return (
            <div className="h-full flex-1 flex justify-center items-center flex-col gap-2 ">
                <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }


    if (!channel || !classroom) {
        return (
            <div className="flex flex-col gap-y-2 h-full items-center justify-center">
                <AlertTriangle className="size-8 text-red-700" />
                <p className="text-red-700 text-sm">
                    ไม่พบข้อมูล ลองใหม่อีกครั้ง!
                </p>
                <Button
                    variant={"outline"}
                    onClick={() => router.replace("/")}
                    className="cursor-pointer"
                >
                    <RefreshCcw />
                    Refresh Data
                </Button>
            </div>
        );
    }


    return (
        <div className="flex flex-col h-full ">
            <Header title={channel.name} />

            <MessageList
                channelName={channel.name}
                channelCreationTime={channel._creationTime}
                data={results}
                loadMore={loadMore} 
                isLoadingMore={status === "LoadingMore"}
                canLoadMore={status === "CanLoadMore"}
            />

            <ChatInput placeholder={`#ลองพูดคุย อะไรสักอย่างในห้อง ${channel.name} นี้ดูสิ ?...`} />
        </div>

    );
}

export default ChannelIdPage;