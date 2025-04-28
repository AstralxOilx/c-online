

import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { th } from 'date-fns/locale';
import { Message } from "./message";
import { ChannelHero } from "./channel-hero";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";  
import { GetMessagesReturnType } from "@/features/messages/api/use-get-messages";
import { LoaderCircle } from "lucide-react";  
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import { ConversationHero } from "./conversation-hero";

interface MessageListProps {
    memberName?: string;
    memberImage?: string;
    channelName?: string;
    channelCreationTime?: number;
    variant?: "channel" | "thread" | "conversation";
    data: GetMessagesReturnType | undefined;
    loadMore: () => void;
    isLoadingMore: boolean;
    canLoadMore: boolean;
};

const TIME_THRESHOLD = 4;

const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "วันนี้";
    if (isYesterday(date)) return "เมื่อวาน";

    return format(date, "d MMMM yyyy", { locale: th });
}

export const MessageList = ({
    memberName,
    memberImage,
    channelName,
    channelCreationTime,
    variant = "channel",
    data,
    loadMore,
    isLoadingMore,
    canLoadMore,
}: MessageListProps) => {

    const [editingId, setEditingId] = useState<Id<"messages"> | null>(null); 

    const { data: currentMember } = useCurrentUser();

    const groupedMessages = data?.reduce(
        (groups, message) => {
            const date = new Date(message._creationTime);
            const dateKey = format(date, "yyyy-MM-dd");

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }

            groups[dateKey].unshift(message);
            return groups

        },
        {} as Record<string, typeof data>
    )



    return (
        <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
            {Object.entries(groupedMessages || {}).map(([dataKey, messages]) => (
                <div key={dataKey}>
                    <div className=" text-center my-2 relative">
                        <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                        <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border-gray-300 shadow-sm">
                            {formatDateLabel(dataKey)}
                        </span>
                    </div>
                    {
                        messages.map((message, index) => {

                            const prevMessage = messages[index - 1];
                            const isCompact = prevMessage &&
                                prevMessage.user._id === message.user._id &&
                                differenceInMinutes(
                                    new Date(message._creationTime),
                                    new Date(prevMessage._creationTime)
                                ) < TIME_THRESHOLD;

                            return (
                                <Message
                                    key={message._id}
                                    id={message._id}
                                    memberId={message.channelMemberId}
                                    authorImage={message.user.image}
                                    authorName={message.user.fname+' '+message.user.lname}
                                    reactions={message.reactions}
                                    body={message.body}
                                    image={message.image}
                                    updatedAt={message.updatedAt}
                                    createdAt={message._creationTime}
                                    threadCount={message.threadCount}
                                    threadImage={message.threadImage}
                                    threadTimestamp={message.threadTimestamp}
                                    isEditing={editingId === message._id}
                                    setEditingId={setEditingId}
                                    isCompact={isCompact}
                                    hideThreadButton={variant === "thread"}
                                    isAuthor={message.user._id === currentMember?._id}
                                    threadName={message.user.fname}
                                /> 
                            )
                        })
                    }
                </div>
            ))}
            <div 
                className="h-1 "
                ref={(el) => {
                    if(el) {
                        const observer = new IntersectionObserver(
                            ([entry]) => {
                                if(entry.isIntersecting && canLoadMore) {
                                    loadMore();
                                }
                            },
                            {threshold:1.0}
                        );

                        observer.observe(el);
                        return () => observer.disconnect();
                    }
                }}
            />
            {
                isLoadingMore && (
                    <div className=" text-center my-2 relative">
                        <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                        <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border-gray-300 shadow-sm">
                            <LoaderCircle className="size-4 animate-spin"/>
                        </span>
                    </div>
                )
            }
            {variant === "channel" && channelName && channelCreationTime && (
                <ChannelHero
                    name={channelName}
                    creationTime={channelCreationTime}
                />
            )}
            {variant === "conversation" && (
                <ConversationHero
                    name={memberName}
                    image={memberImage}
                />
            )}
        </div>
    )
}