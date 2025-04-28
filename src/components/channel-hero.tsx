

import { format } from "date-fns";
import { th } from 'date-fns/locale';


interface ChannelHeroProps {
    name: string;
    creationTime: number;
}

export const ChannelHero = ({ name, creationTime }: ChannelHeroProps) => {

    return (
        <div className="mt-[88px] mx-5 mb-4">
            <p className="text-2xl font-bold flex items-center mb-2">
               # {name}
            </p>
            <p className="font-normal text-slate-800 mb-4">
                channel นี้สร้างขึ้นเมื่อ {format(creationTime, "d MMMM yyyy", { locale: th })}. นี่คือจุดเริ่มต้นของ <strong>{name}</strong> channel.
            </p>
        </div>
    )
}