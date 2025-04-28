import { LucideIcon } from "lucide-react"; 
import { IconType } from "react-icons/lib";
import { Button } from "@/components/ui/button";
import Link from "next/link"; 

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils"; 
import { useClassroomId } from "@/hooks/use-classroom-id";

const SidebarItemVariants = cva(
    "flex items-center gap-1.5 justify-start font-normal h-8 px-[18px] text-sm overflow-hidden rounded-sm ",
    {
        variants: {
            variant: {
                default: "text-gray-600",
                active: "shadow-xs text-primary bg-background hover:bg-background hover:text-primary rounded-l-none rounded-r-sm border-l-2 border-primary"
            },
        },
        defaultVariants: {
            variant: "default",
        }
    },
);

interface SidebarItemProps {
    label: string;
    id: string;
    icon: LucideIcon | IconType;
    variant?: VariantProps<typeof SidebarItemVariants>["variant"]; 
    groups?: string;
}

export const SidebarItem = ({
    label,
    id,
    icon: Icon,
    variant, 
    groups = "channel",
}: SidebarItemProps) => {

     const classroomId = useClassroomId();

    return (
        <>

            <Button
                asChild
                variant={"ghost"}
                size={"sm"}
                className={cn(SidebarItemVariants({ variant }))}
            >
                <Link href={`/classroom/${classroomId}/${groups}/${id}`}>
                    <Icon className="size-3.5 mr-1 shrink-0"/>
                    <span className="text-sm truncate">{label}</span>
                </Link>
            </Button>

        </>
    );
}