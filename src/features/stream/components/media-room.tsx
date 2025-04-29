"use client"

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import '@livekit/components-styles';

import {Loader2} from "lucide-react";
import { useCurrentUser } from "@/features/auth/api/use-current-user";

interface MediaRoomProps {
    chatId: string;
    video: boolean;
    audio: boolean;
};


export const MediaRoom  = ({
    chatId,
    video,
    audio,
}:MediaRoomProps) =>{
    const { data:user, isLoading } = useCurrentUser();
    const [token,setToken] = useState("");

    useEffect(()=>{
        if(!user?.fname || !user.lname) return;

        const name = `${user?.fname} ${user?.lname}`;

        (async () => {
            try {
                const resp = await fetch(`/api/livekit?room=${chatId}&username=${name}`);
                const data = await resp.json();
                setToken(data.token);
            } catch (error) {
                console.log(error);
            }
        })()
        
    },[user?.fname,user?.lname,chatId]);

    if(token === ""){
        return (
            <div className="h-screen flex justify-center items-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="text-xs text-zinc-500">Loading...</p>
          </div>
        )
    }

    return (
        <LiveKitRoom
            data-lk-theme="default"
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            token={token}
            connect={true}
            video={video}
            audio={audio}
        >
            <VideoConference/>
        </LiveKitRoom>
    )
    

}