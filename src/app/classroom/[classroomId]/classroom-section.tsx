// import { Hint } from "@/components/hint";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon, PlusIcon } from "lucide-react";
import { FaCaretDown } from "react-icons/fa";
import { IconType } from "react-icons/lib";
import { useToggle } from 'react-use';

interface ClassroomSectionProps {
    children: React.ReactNode;
    label: string;
    hint: string;
    onNew?: () => void;
    icon: LucideIcon | IconType;

}

export const ClassroomSection = ({
    children,
    label,
    hint,
    onNew,
    icon: Icon,
}: ClassroomSectionProps) => {

    const [on, toggle] = useToggle(true);

    return (
        <>
            <div className="flex flex-col mt-3 px-2">
                <div className="flex items-center px-0 group">
                    <Button
                        onClick={toggle}
                        variant={"ghost"}
                        size={"sm"}
                        className="p-0.5 text-sm text-gray-800 shrink-0 cursor-pointer"
                    >
                        <Icon className="size-4 mr-1 shrink-0"/>
                        <span className=" truncate ">{label}</span>
                        <FaCaretDown className={cn(
                            "size-4 transition-transform",
                            !on && "-rotate-90"
                        )} />
                    </Button>
                    {
                        onNew && (
                            <Hint label={hint} side="top" align="center">
                                <Button
                                    onClick={onNew}
                                    size={"icon"}
                                    variant={"secondary"}
                                    className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity ml-auto p-0.5 text-sm text-gray-800 size-6 shrink-0"
                                >
                                    <PlusIcon className="size-6" />
                                </Button>
                            </Hint>
                        )
                    }
                </div>
                {on && children}
            </div>
        </>
    )
}