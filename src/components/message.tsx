import dynamic from "next/dynamic";

import { Doc, Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import { format, isToday, isYesterday } from "date-fns";
import { th } from 'date-fns/locale';
import { Hint } from "./hint";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";  
import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRemoveMessage } from "@/features/messages/api/use-remove-message";
import { useConfirm } from "@/hooks/use-confirm";
// import { useToggleReaction } from "@/features/reactions/api/use-toggle-reaction";
import { Reactions } from "./reactions";
import { Thumbnail } from "./thumbnail";
import { useToggleReaction } from "@/features/reactions/api/use-toggle-reaction";
import { Toolbar } from "./toolbar";
import { ThreadBar } from "./thread-bar";
import { usePanel } from "@/hooks/use-panel";
// import { usePanel } from "@/hooks/use-panel"; 

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });
const Renderer = dynamic(() => import("@/components/renderer"), { ssr: false });


interface MessageProps {
    id: Id<"messages">;
    memberId: Id<"channelMembers">;
    authorImage?: string;
    authorName?: string;
    isAuthor: boolean;
    reactions: Array<
        Omit<Doc<"reactions">, "channelMemberId"> & {
            count: number;
            memberIds: Id<"channelMembers">[];
        }
    >;
    body: Doc<"messages">["body"];
    image: string | null | undefined;
    createdAt: Doc<"messages">["_creationTime"];
    updatedAt: Doc<"messages">["updatedAt"];
    isEditing: boolean;
    isCompact?: boolean;
    setEditingId: (id: Id<"messages"> | null) => void;
    hideThreadButton?: boolean;
    threadCount?: number;
    threadImage?: string;
    threadName?: string;
    threadTimestamp?: number;
}

const formatFullTime = (date: Date) => {
    return `${isToday(date) ? "วันนี้" : isYesterday(date) ? "เมื่อวาน" : format(date, "d MMMM yyyy", { locale: th })} ${format(date, "HH:mm:ss น.")}`
}

export const Message = ({
    id,
    memberId,
    authorImage,
    authorName = "member",
    isAuthor,
    reactions,
    body,
    image,
    createdAt,
    updatedAt,
    isEditing,
    isCompact,
    setEditingId,
    hideThreadButton,
    threadCount,
    threadImage,
    threadName,
    threadTimestamp,

}: MessageProps) => {

    const [ConfirmDialog, confirm] = useConfirm(
        "คุณต้องการที่จะลบข้อความนี้?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );

    const { parentMessageId, onOpenMessage, onOpenProfile, onClose } = usePanel();

    const { mutate: updateMessage, isPending: isUpdatingMessage } = useUpdateMessage();
    const { mutate: removeMessage, isPending: isRemovingMessage } = useRemoveMessage();
    const { mutate: toggleReaction, isPending: isTogglingReaction } = useToggleReaction();

    const isPending = isUpdatingMessage || isTogglingReaction;

    const handleUpdate = ({ body }: { body: string }) => {
        updateMessage({ id, body }, {
            onSuccess: () => {
                toast.success("แก้ไขข้อความสำเร็จแล้ว!");
                setEditingId(null);
            },
            onError: () => {
                toast.success("เกิดข้อผิดพลาด แก้ไขข้อความไม่สำเร็จ!");
            }
        })
    }

    const handleDelete = async () => {
        const ok = await confirm();
        if (!ok) return;

        removeMessage({ id }, {
            onSuccess: () => {
                toast.success("ลบข้อความสำเร็จแล้ว!");
                if (parentMessageId === id) {
                    onClose();
                }
            },
            onError: () => {
                toast.error("เกิดข้อผิดพลาด ลบข้อความไม่สำเร็จ!")
            }
        })
    }

    const handleReaction = (value: string) => {
        toggleReaction({
            messageId: id, value
        }, {
            onError: () => {
                toast.error("ไม่สามารถสลับการตอบสนองได้");
            }
        }
        )
    }

    if (isCompact) {
        return (
            <>
                <ConfirmDialog />
                <div className={cn(
                    "flex flex-col gap-2 p-1.5 px-5 hover:bg-secondary/60 group relative",
                    isEditing && "bg-accent hover:bg-accent",
                    isRemovingMessage &&
                    "bg-accent transform translate-all scale-y-0 origin-bottom duration-200",
                )}>
                    <div className="flex items-start gap-2">
                        <Hint label={formatFullTime(new Date(createdAt))}>
                            <button
                                className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100  hover:underline w-[40px] leading-[22px] text-center"
                            >
                                {format(new Date(createdAt), "HH:mm")}
                            </button>
                        </Hint>
                        {
                            isEditing ? (
                                <div className="w-full h-full">
                                    <Editor
                                        onSubmit={handleUpdate}
                                        disabled={isPending}
                                        defaultValue={JSON.parse(body)}
                                        onCancel={() => setEditingId(null)}
                                        variant="update"
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col w-full">
                                    <Renderer value={body} />
                                    <Thumbnail url={image} />
                                    {updatedAt ? (
                                        <span className="text-xs text-muted-foreground">
                                            (แก้ไขแล้ว)
                                        </span>
                                    ) : null}
                                    <Reactions data={reactions} onChange={handleReaction} />
                                    <ThreadBar
                                        count={threadCount}
                                        image={threadImage}
                                        timestamp={threadTimestamp}
                                        name={threadName}
                                        onClick={() => onOpenMessage(id)}
                                    />
                                </div>
                            )
                        }
                    </div>
                    {!isEditing && (
                        <Toolbar
                            isAuthor={isAuthor}
                            isPending={isPending}
                            handleEdit={() => setEditingId(id)}
                            handleThread={() => onOpenMessage(id)}
                            handleDelete={handleDelete}
                            hideThreadButton={hideThreadButton}
                            handleReaction={handleReaction}
                        />
                    )}
                </div>
            </>
        )
    }

    const avatarFallback = authorName.charAt(0).toUpperCase();

    return (
        <>
            <ConfirmDialog />
            <div className={cn(
                "flex flex-col gap-2 p-1.5 px-5 hover:bg-secondary/60 group relative",
                isEditing && "bg-accent hover:bg-accent",
                isRemovingMessage &&
                "bg-accent transform translate-all scale-y-0 origin-bottom duration-200"
            )}>
                <div className="flex items-start gap-2">
                    <button onClick={() => onOpenProfile(memberId)} className=" cursor-pointer">
                        <Avatar className="size-9 rounded-sm mr-1">
                            <AvatarImage className="rounded-sm" alt={avatarFallback} src={authorImage} />
                            <AvatarFallback className="rounded-sm"> {avatarFallback}</AvatarFallback>
                        </Avatar>
                    </button>
                    {
                        isEditing ? (
                            <div className="w-full h-full">
                                <Editor
                                    onSubmit={handleUpdate}
                                    disabled={isPending}
                                    defaultValue={JSON.parse(body)}
                                    onCancel={() => setEditingId(null)}
                                    variant="update"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col w-full overflow-hidden">
                                <div className="text-sm">
                                    <button onClick={() => onOpenProfile(memberId)} className={cn(
                                        "font-bold text-foreground hover:underline cursor-pointer",
                                        isAuthor && "text-primary"
                                    )}>
                                        {authorName} {
                                            isAuthor ? (
                                                <span className="text-[11px] text-muted-foreground">
                                                    (คุณ)
                                                </span>
                                            ) : null
                                        }
                                    </button>
                                    <span>&nbsp;&nbsp;</span>
                                    <Hint label={formatFullTime(new Date(createdAt))}>
                                        <button className="text-xs text-muted-foreground hover:underline">
                                            {format(new Date(createdAt), "HH:mm น.")}
                                        </button>
                                    </Hint>
                                </div>
                                <Renderer value={body} />
                                <Thumbnail url={image} />
                                {updatedAt ? (
                                    <span className="text-xs text-muted-foreground">
                                        (แก้ไขแล้ว)
                                    </span>
                                ) : null}
                                <Reactions data={reactions} onChange={handleReaction} />
                                <ThreadBar
                                    count={threadCount}
                                    image={threadImage}
                                    timestamp={threadTimestamp}
                                    onClick={() => onOpenMessage(id)}
                                    name={threadName}
                                />
                            </div>
                        )
                    }
                </div>
                {!isEditing && (
                    <Toolbar
                        isAuthor={isAuthor}
                        isPending={isPending}
                        handleEdit={() => setEditingId(id)}
                        handleThread={() => onOpenMessage(id)}
                        handleDelete={handleDelete}
                        hideThreadButton={hideThreadButton}
                        handleReaction={handleReaction}
                    />
                )}
            </div>
        </>
    )

}