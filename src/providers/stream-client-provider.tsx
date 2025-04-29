"use client";

import Loader from "@/components/loader";
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import {
    StreamVideo,
    StreamVideoClient,
} from "@stream-io/video-react-sdk";
import React, { ReactNode, useEffect, useState } from "react"; 
import { getStreamToken } from "../../actions/stream.actions";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
    const [videoClient, setVideoClient] = useState<StreamVideoClient>();
    const { data: user, isLoading: userLoading } = useCurrentUser();

    useEffect(() => {
        if (userLoading || !user) return;

        const init = async () => {
            const token = await getStreamToken(user._id); // ส่ง user._id ไปให้ server

            const client = new StreamVideoClient({
                apiKey,
                user: {
                    id: user._id,
                    name: `${user.fname} ${user.lname}`,
                    image: user.image,
                },
                tokenProvider: () => Promise.resolve(token),
            });

            setVideoClient(client);
        };

        init();
    }, [user, userLoading]);

    if (!videoClient) return (
        <p>ทดสอบ...</p>
    );
 
    return (
        <StreamVideo client={videoClient}>
            {children}
        </StreamVideo>
    );
};
export default StreamVideoProvider;