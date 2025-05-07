import { Button } from "@/components/ui/button";  
 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";



interface HeaderProps {
    memberName?: string;
    memberImage?: string;
    onClick?: () => void;
}

export const Header = ({
    memberName = "member",
    memberImage,
    onClick,
}: HeaderProps) => {

    const avatarFallback = memberName.charAt(0).toUpperCase();

    return (
        <>
            <div className="bg-secondary/50 h-[45px] flex items-center px-4 overflow-hidden">
                <Button
                    variant={"ghost"}
                    className="text-lg font-semibold px-2 overflow-hidden w-auto"
                    size={"sm"}
                    onClick={onClick}
                >
                    <Avatar className="size-6  rounded-sm ml-2 border">
                        <AvatarImage className="rounded-sm" src={memberImage} />
                        <AvatarFallback className="rounded-sm" >
                            {avatarFallback}
                        </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{memberName}</span> 
                </Button>
            </div>
        </>
    );

}