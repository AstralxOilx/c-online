import { MessageSquareTextIcon, Pencil, Smile, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { Hint } from "./hint";
import { EmojiPopover } from "./emoji-popover";



interface ToolbarProps {
    isAuthor: boolean;
    isPending: boolean;
    handleEdit: () => void;
    handleThread: () => void;
    handleDelete: () => void;
    handleReaction: (value: string) => void;
    hideThreadButton?: boolean;
}

export const Toolbar = ({
    isAuthor,
    isPending,
    handleEdit,
    handleThread,
    handleDelete,
    handleReaction,
    hideThreadButton,
}: ToolbarProps) => {

    return (
        <div className="absolute top-0 right-5">
            <div className="group-hover:opacity-100 opacity-0 transition-opacity border bg-background rounded-md shadow-sm">
                <EmojiPopover
                    hint="แสดงความรู้สึก"
                    onEmojiSelect={(emoji) => handleReaction(emoji)}
                >
                    <Button
                        variant={"ghost"}
                        size={"icon"}
                        disabled={isPending}
                        className="cursor-pointer"
                    >
                        <Smile className="size-4" />
                    </Button>
                </EmojiPopover>
                {!hideThreadButton && (
                    <Hint label="ตอบกลับ">
                        <Button
                            variant={"ghost"}
                            size={"icon"}
                            disabled={isPending}
                            className="cursor-pointer" 
                            onClick={handleThread}
                        >
                            <MessageSquareTextIcon className="size-4" />
                        </Button>
                    </Hint>
                )}
                {isAuthor && (
                    <Hint label="แก้ไข">
                        <Button
                            variant={"ghost"}
                            size={"icon"}
                            disabled={isPending}
                            className="cursor-pointer"
                            onClick={handleEdit}
                        >
                            <Pencil className="size-4" />
                        </Button>
                    </Hint>
                )}
                {isAuthor && (
                    <Hint label="ลบ">
                        <Button
                            variant={"ghost"}
                            size={"icon"}
                            disabled={isPending}
                            className="cursor-pointer"
                            onClick={handleDelete}
                        >
                            <Trash className="size-4" />
                        </Button>
                    </Hint>
                )}
            </div>
        </div>
    )
}