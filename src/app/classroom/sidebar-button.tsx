import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons/lib";

interface SidebarButtonProps {
    icon: LucideIcon | IconType;
    label: string;
    isActive?: boolean;
    onLink?: () => void;
}

export const SidebarButton = ({
    icon: Icon,
    label,
    isActive,
    onLink,
}: SidebarButtonProps) => {

    return (
        <div  
            onClick={onLink}
             className="flex flex-col items-center justify-center gap-y-0.5 cursor-pointer group ">
            <Button 
                className={cn("shadow-2xl bg-white text-primary size-9 p-2 group-hover:bg-primary cursor-pointer",
                    isActive && "bg-primary text-white"
                )}
            >
                <Icon className="size-6 group-hover:scale-110 transition-all group-hover:text-white" />
            </Button>
            <span className="text-[11px] text-primary group-hover:text-primary/80">
                {label}
            </span>
        </div>
    );
};