 
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useCurrentChannelMember, useCurrentMember } from "@/features/members/api/use-current-member";
import { cn } from "@/lib/utils";
import { Hint } from "./hint";
import { EmojiPopover } from "./emoji-popover";
import { MdOutlineAddReaction } from "react-icons/md";
import { useClassroomId } from "@/hooks/use-classroom-id";
import { useChannelId } from "@/hooks/use-channel-Id";

interface ReactionProps {
    data: Array<
        Omit<Doc<"reactions">, "channelMemberId"> & {
            count: number;
            memberIds: Id<"channelMembers">[];
        }
    >;
    onChange: (value: string) => void;
};

export const Reactions = ({
    data,
    onChange,
}: ReactionProps) => {

    const channelId = useChannelId();

    const { data: currentMember } = useCurrentChannelMember({channelId});

    const currentMemberId = currentMember?._id;

    if (data.length === 0 || !currentMemberId) {
        return null;
    }

    return (
        <div className="flex items-center gap-1 mt-1 mb-1">
            {
                data.map((reaction) => (
                    <Hint key={reaction._id} label={`แสดงความรู้สึก ${reaction.value} จำนวน ${reaction.count} คน`}>
                        <button
                            onClick={() => onChange(reaction.value)}
                            className={cn(
                                " cursor-pointer h-6 px-2 rounded-full bg-slate-200/70 border border-transparent text-slate-800 flex items-center gap-x-1",
                                reaction.memberIds.includes(currentMemberId) &&
                                "bg-blue-100/70 border-primary text-primary"
                            )}>
                            {reaction.value}
                            <span className={cn(
                                "text-xs font-semibold text-muted-foreground",
                                reaction.memberIds.includes(currentMemberId) && "text-primary",
                            )}
                            >{reaction.count}</span>
                        </button>
                    </Hint>
                ))
            }
            <EmojiPopover
                hint="แสดงความรู้สึก"
                onEmojiSelect={(emoji) => onChange(emoji)}
            >
                <div 
                    className="cursor-pointer h-7 px-3 rounded-full bg-slate-200/70 border border-transparent hover:border-slate-500 text-slate-800 flex items-center gap-x-1">
                    <MdOutlineAddReaction className="size-4" />
                </div>
            </EmojiPopover>
        </div>
    )
}