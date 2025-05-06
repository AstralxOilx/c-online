
import { useChannelId } from "@/hooks/use-channel-Id";
import Quill from "quill";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useCreateMessage } from "@/features/messages/api/use-crate-message";

import dynamic from "next/dynamic";
import { useClassroomId } from "@/hooks/use-classroom-id";
import { useRouter } from "next/navigation";
import { useCurrentMemberChannel } from "@/features/members/api/use-current-member-channel";
import Loader from "@/components/loader";
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });



interface ChatInputProps {
    placeholder: string;
}

type CreateMessageValues = {
    channelId: Id<"channels">;
    classroomId: Id<"classrooms">;
    body: string;
    image: Id<"_storage"> | undefined;
}


export const ChatInput = ({ placeholder }: ChatInputProps) => {
    const [editorKey, setEditorKey] = useState(0);
    const editorRef = useRef<Quill | null>(null);

    const router = useRouter();

    const [isPending, setIsPending] = useState(false);

    const classroomId = useClassroomId();
    const channelId = useChannelId();

    const { mutate: generateUploadUrl } = useGenerateUploadUrl();
    const { mutate: createMessage } = useCreateMessage();

    const [isRedirecting, setIsRedirecting] = useState(false);

    const {
        data: isMemberChannel,
        isLoading: isMemberChannelLoading,
    } = useCurrentMemberChannel({ channelId: channelId! });

    useEffect(() => {
        if (!channelId) return;

        if (!isMemberChannel && !isMemberChannelLoading) {
            setIsRedirecting(true); // เริ่ม redirect
            router.push("/classroom");
        }
    }, [channelId, isMemberChannel, isMemberChannelLoading]);

    if (!channelId || isMemberChannelLoading || isRedirecting) {
        return <Loader />;
    }

    const handleSubmit = async ({
        body,
        image,
    }: {
        body: string;
        image: File | null;
    }) => {
        // console.log({ body, image });
        try {
            setIsPending(true);
            editorRef?.current?.enable(false);

            const values: CreateMessageValues = {
                channelId,
                classroomId,
                body,
                image: undefined,
            }

            if (image) {
                const url = await generateUploadUrl({}, { throwError: true });

                // console.log(url);

                if (!url) {
                    throw new Error("url not fond");
                }

                const result = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": image.type },
                    body: image,
                });

                // console.log(result);

                if (!result.ok) {
                    throw new Error("อัปโหลดรูปภาพไม่สำเร็จ!")
                }

                const { storageId } = await result.json();

                // console.log(storageId)

                values.image = storageId;
            }

            // console.log(values)
            await createMessage(values, { throwError: true });



            setEditorKey((prevKey) => prevKey + 1);
            // editorRef.current?.setContents([]);
        } catch (error) {
            toast.error("ส่งข้อความไม่สำเร็จ!")
        } finally {
            setIsPending(false);
            editorRef?.current?.enable(true);
        }
    }


    return (
        <div className="px-5 w-full">
            <Editor
                key={editorKey}
                placeholder={placeholder}
                onSubmit={handleSubmit}
                disabled={isPending}
                innerRef={editorRef}
            />
        </div>
    )
}