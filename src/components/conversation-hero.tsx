

 
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";


interface ConversationHeroProps {
    name?: string;
    image?: string;
}

export const ConversationHero = ({ name = "member", image }: ConversationHeroProps) => {

    const avatarFallback = name.charAt(0).toUpperCase();

    return (
        <div className="mt-[88px] mx-5 mb-4">
            <div className="flex items-center gap-x-1 mb-2">
                <Avatar className="size-12  rounded-sm mr-1 border">
                    <AvatarImage className="rounded-sm" src={image} />
                    <AvatarFallback className="rounded-sm" >
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>
                <p className="text-2xl font-bold">
                    {name}
                </p>
            </div>
            <p className="font-normal text-slate-800 mb-4">
                เริ่มการสนทนา ของคุณระหว่าง <strong>{name}</strong>
            </p>
        </div>
    )
}