import { useEffect, useRef, useState } from "react";

interface JitsiMeetProps {
    displayName: string;
    onRoomLinkGenerated?: (link: string) => void; // Callback สำหรับส่งลิงก์กลับ
}

export default function JitsiMeet({ displayName, onRoomLinkGenerated }: JitsiMeetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<any>(null);
    const [roomLink, setRoomLink] = useState<string>("");

    useEffect(() => {
        if (typeof window === "undefined") return; // ป้องกัน SSR

        const loadScript = () => {
            return new Promise<void>((resolve, reject) => {
                if ((window as any).JitsiMeetExternalAPI) {
                    resolve(); // โหลดไปแล้ว
                    return;
                }

                const existingScript = document.getElementById("jitsi-api");
                if (existingScript) {
                    existingScript.addEventListener("load", () => resolve());
                    return;
                }

                const script = document.createElement("script");
                script.src = "https://meet.jit.si/external_api.js";
                script.id = "jitsi-api";
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => reject("Jitsi script load failed");
                document.body.appendChild(script);
            });
        };

        loadScript().then(() => {
            const JitsiAPI = (window as any).JitsiMeetExternalAPI;

            if (containerRef.current && JitsiAPI) {
                containerRef.current.innerHTML = "";

                const domain = "meet.jit.si";
                const options = {
                    roomName: displayName,
                    width: "100%",
                    height: "95vh",
                    parentNode: containerRef.current,
                    userInfo: {
                        displayName: "me",
                    },
                    configOverwrite: {
                        startWithAudioMuted: true,
                        startWithVideoMuted: true,
                    },
                    interfaceConfigOverwrite: {
                        SHOW_JITSI_WATERMARK: false,
                    },
                };

                apiRef.current = new JitsiAPI(domain, options);

                apiRef.current.addEventListener("videoConferenceJoined", () => {
                    apiRef.current.executeCommand("displayName", displayName);
                });

                const link = `https://${domain}/${displayName}`;
                setRoomLink(link);

                if (onRoomLinkGenerated) {
                    onRoomLinkGenerated(link);
                }
            } else {
                console.error("JitsiMeetExternalAPI is not available.");
            }
        });

        return () => {
            if (apiRef.current) {
                apiRef.current.dispose();
            }
        };
    }, [displayName, onRoomLinkGenerated]);


    return (
        <div>
            <div
                ref={containerRef}
                style={{
                    width: "100%",
                    height: "100vh",
                    borderRadius: 8,
                }}
            />
            <p>Room Link: <a href={roomLink} target="_blank" rel="noopener noreferrer">{roomLink}</a></p> {/* แสดงลิงก์ห้องประชุม */}
        </div>
    );
}
