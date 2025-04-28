import { AlertCircle, LoaderCircle, XIcon } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useGetMessage } from "../api/use-get-message";
import { Message } from "@/components/message";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useCreateMessage } from "../api/use-crate-message";
import { useChannelId } from "@/hooks/use-channel-Id";
import { toast } from "sonner";
import { useGetMessages } from "../api/use-get-messages";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { th } from 'date-fns/locale';
import { useClassroomId } from "@/hooks/use-classroom-id";


const Editor = dynamic(() => import("@/components/editor"), { ssr: false })

interface ThreadProps {
    messageId: Id<"messages">;
    onClose: () => void;
}

type CreateMessageValues = {
    channelId: Id<"channels">;
    classroomId: Id<"classrooms">;
    parentMessageId: Id<"messages">;
    body: string;
    image: Id<"_storage"> | undefined;
}
const TIME_THRESHOLD = 5;

const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "วันนี้";
    if (isYesterday(date)) return "เมื่อวาน";

    return format(date, "d MMMM yyyy", { locale: th });
}

export const Thread = ({
    messageId,
    onClose,
}: ThreadProps) => {
    const channelId = useChannelId();
    const classroomId = useClassroomId();

    const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
    const [editorKey, setEditorKey] = useState(0);
    const [isPending, setIsPending] = useState(false);
    const editorRef = useRef<Quill | null>(null);

    const { mutate: generateUploadUrl } = useGenerateUploadUrl();
    const { mutate: createMessage } = useCreateMessage();


    const { data: currentMember } = useCurrentMember({ classroomId });
    const { data: message, isLoading: loadingMessage } = useGetMessage({ id: messageId });

    const { results, status, loadMore } = useGetMessages({
        channelId,
        parentMessageId: messageId,
    });

    const canLoadMore = status === "CanLoadMore";
    const isLoadingMore = status === "LoadingMore";


    if (loadingMessage || status === "LoadingFirstPage") {
        return (
            <div className="h-full w-full flex-col">
                <div className="flex justify-between items-center bg-secondary/50 h-[45px] overflow-hidden px-4">
                    <p className="text-lg font-bold">กระทู้</p>
                    <Button className="cursor-pointer" onClick={onClose} size={"sm"} variant={"ghost"}>
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="h-full flex justify-center items-center flex-col gap-2 ">
                    <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }


    const handleSubmit = async ({
        body,
        image,
    }: {
        body: string;
        image: File | null;
    }) => {
        // console.log({ body, image });
        try {
            setIsPending(true);
            editorRef?.current?.enable(false);

            const values: CreateMessageValues = {
                channelId,
                parentMessageId: messageId,
                classroomId,
                body,
                image: undefined,
            }

            if (image) {
                const url = await generateUploadUrl({}, { throwError: true });

                // console.log(url);

                if (!url) {
                    throw new Error("url not fond");
                }

                const result = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": image.type },
                    body: image,
                });

                // console.log(result);

                if (!result.ok) {
                    throw new Error("อัปโหลดรูปภาพไม่สำเร็จ!")
                }

                const { storageId } = await result.json();

                // console.log(storageId)

                values.image = storageId;
            }

            // console.log(values)
            await createMessage(values, { throwError: true });



            setEditorKey((prevKey) => prevKey + 1);
            // editorRef.current?.setContents([]);
        } catch (error) {
            toast.error("ส่งข้อความไม่สำเร็จ!")
        } finally {
            setIsPending(false);
            editorRef?.current?.enable(true);
        }
    }

    const groupedMessages = results?.reduce(
        (groups, message) => {
            const date = new Date(message._creationTime);
            const dateKey = format(date, "yyyy-MM-dd");

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }

            groups[dateKey].unshift(message);
            return groups

        },
        {} as Record<string, typeof results>
    )

    if (!message) {
        return (
            <div className="h-full w-full flex-col">
                <div className="flex justify-between items-center bg-secondary/50 h-[45px] overflow-hidden px-4">
                    <p className="text-lg font-bold">กระทู้</p>
                    <Button className="cursor-pointer" onClick={onClose} size={"sm"} variant={"ghost"}>
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="h-full w-full flex justify-center items-center flex-col gap-y-2 ">
                    <AlertCircle className="size-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">ไม่พบข้อความ!</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center bg-secondary/50 h-[45px] overflow-hidden px-4">
                <p className="text-lg font-bold">กระทู้</p>
                <Button className="cursor-pointer" onClick={onClose} size={"sm"} variant={"ghost"}>
                    <XIcon className="size-5 stroke-[1.5]" />
                </Button>
            </div>
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
                                        authorName={message.user.fname + " " + message.user.lname}
                                        reactions={message.reactions}
                                        body={message.body}
                                        image={message.image}
                                        updatedAt={message.updatedAt}
                                        createdAt={message._creationTime}
                                        threadCount={message.threadCount}
                                        threadImage={message.threadImage}
                                        threadTimestamp={message.threadTimestamp}
                                        threadName={message.threadName}
                                        isEditing={editingId === message._id}
                                        setEditingId={setEditingId}
                                        isCompact={isCompact}
                                        hideThreadButton
                                        isAuthor={message.user._id === currentMember?.userId}
                                    />
                                )
                            })
                        }
                    </div>
                ))}
                <div
                    className="h-1 "
                    ref={(el) => {
                        if (el) {
                            const observer = new IntersectionObserver(
                                ([entry]) => {
                                    if (entry.isIntersecting && canLoadMore) {
                                        loadMore();
                                    }
                                },
                                { threshold: 1.0 }
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
                                <LoaderCircle className="size-4 animate-spin" />
                            </span>
                        </div>
                    )
                }
                <Message
                    hideThreadButton
                    memberId={message.channelMemberId}
                    authorImage={message.user.image}
                    authorName={message.user.fname + " " + message.user.lname}
                    isAuthor={message.user._id === currentMember?.userId}
                    body={message.body}
                    image={message.image}
                    createdAt={message._creationTime}
                    updatedAt={message.updatedAt}
                    id={message._id}
                    reactions={message.reactions}
                    isEditing={editingId === message._id}
                    setEditingId={setEditingId}
                />
            </div>

            <div className="px-4">
                <Editor
                    key={editorKey}
                    onSubmit={handleSubmit}
                    disabled={isPending}
                    innerRef={editorRef}
                    placeholder="ตอบกลับ..."
                // variant="create"
                />
            </div>

        </div>
    )
}