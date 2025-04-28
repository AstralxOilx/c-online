import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ChevronRight } from "lucide-react";
import { th } from "date-fns/locale";

interface ThreadBarProps {
    count?: number;
    image?: string;
    timestamp?: number;
    name?: string;
    onClick?: () => void;
};

export const ThreadBar = ({
    count,
    image,
    name = "member",
    timestamp,
    onClick,
}: ThreadBarProps) => {
    const avatarFallback = name.charAt(0).toUpperCase();
    if (!count || !timestamp) return null;
    return (
        <button
            onClick={onClick}
            className="cursor-pointer p-1 rounded-md hover:bg-background/50 border border-transparent hover:border-border flex items-center justify-start group/thread-bar transition max-w-[600px]"
        >
            <div className="flex items-center gap-2 overflow-hidden">
                <Avatar className="size-5 rounded-sm mr-1">
                    <AvatarImage className="rounded-sm" alt={avatarFallback} src={image} />
                    <AvatarFallback className="rounded-sm">{avatarFallback}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-primary hover:underline font-bold truncate">
                    ตอบกลับ {count} ความคิดเห็น
                </span>
                <span className="text-xs text-muted-foreground truncate group-hover/thread-bar:hidden block ">
                    {formatDistanceToNow(timestamp, { addSuffix: true, locale: th, })}
                </span>
                <span className="text-xs text-muted-foreground truncate group-hover/thread-bar:block hidden">
                    ดูกระทู้
                </span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground ml-auto opacity-0 group-hover/thread-bar:opacity-100 transition shrink-0" />
        </button>
    )
}