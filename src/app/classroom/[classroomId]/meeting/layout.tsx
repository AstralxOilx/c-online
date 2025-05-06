"use client";

 

import "@stream-io/video-react-sdk/dist/css/styles.css";
import StreamVideoProvider from "@/providers/stream-client-provider";
 

interface ClassroomLayoutProps {
    children: React.ReactNode;
}

const MeetingLayout = ({ children }: ClassroomLayoutProps) => {
     
    return (

        <>
            <StreamVideoProvider>{children}</StreamVideoProvider>
        </>

    );
}

export default MeetingLayout;