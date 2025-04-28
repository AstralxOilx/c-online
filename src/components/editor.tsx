

import Quill, { type QuillOptions } from "quill";
import { Delta, Op } from "quill/core";
import "quill/dist/quill.snow.css";



import { MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { PiTextAa } from "react-icons/pi";
import { ImageIcon, Smile, XIcon } from "lucide-react";
import { MdSend } from "react-icons/md";

import { Hint } from "./hint";
import { cn } from "@/lib/utils"; 
import { Input } from "./ui/input";

import Image from "next/image";
import { EmojiPopover } from "./emoji-popover";

type EditorValue = {
    image: File | null;
    body: string;
}

interface EditorProps {
    onSubmit: ({ image, body }: EditorValue) => void;
    onCancel?: () => void;
    placeholder?: string;
    defaultValue?: Delta | Op[];
    variant?: "create" | "update";
    disabled?: boolean;
    innerRef?: MutableRefObject<Quill | null>;
}


const Editor = ({
    onSubmit,
    onCancel,
    placeholder = "ลองพูดคุยอะไรสักอย่าง ไหม?...",
    disabled = false,
    innerRef,
    defaultValue = [],
    variant = "create"
}: EditorProps) => {

    const [isToolbarVisible, setIsToolbarVisible] = useState(false);

    const [text, setText] = useState("");
    const [image, setImage] = useState<File | null>(null)

    const submitRef = useRef(onSubmit);
    const placeholderRef = useRef(placeholder);
    const quillRef = useRef<Quill | null>(null);
    const defaultValueRef = useRef(defaultValue);
    const containerRef = useRef<HTMLDivElement>(null);
    const disabledRef = useRef(disabled);

    const imageElementRef = useRef<HTMLInputElement>(null);

    useLayoutEffect(() => {
        submitRef.current = onSubmit;
        placeholderRef.current = placeholder;
        defaultValueRef.current = defaultValue;
        disabledRef.current = disabled;
    })


    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const editorContainer = container.appendChild(
            container.ownerDocument.createElement("div"),
        );

        const options: QuillOptions = {
            theme: "snow",
            placeholder: placeholderRef.current,
            modules: {
                toolbar: [
                    // [{ font: [] }, { size: [] }], // เปลี่ยนฟอนต์ และขนาดตัวอักษร
                    ["bold", "italic", "underline", "strike"], // ตัวหนา ตัวเอียง ขีดเส้นใต้ ขีดฆ่า
                    // [{ color: [] }, { background: [] }], // เปลี่ยนสีตัวอักษร & พื้นหลัง
                    // [{ script: "sub" }, { script: "super" }], // ตัวห้อย ตัวเสริม
                    // [{ header: [1, 2, 3, 4, 5, 6, false] }], // หัวข้อ H1 - H6
                    // [{ list: "ordered" }, { list: "bullet" }], // ลิสต์ตัวเลข & จุด
                    // [{ align: [] }], // จัดวางซ้าย กลาง ขวา
                    // ["blockquote", "code-block"], // Blockquote & Code Block
                    // ["link", "image", "video"], // แทรกลิงก์ รูปภาพ วิดีโอ
                    ["clean"], // ปุ่มล้างการฟอร์แมต
                ],
                keyboard: {
                    bindings: {
                        enter: {
                            key: "Enter",
                            handler: () => {
                                const text = quill.getText();
                                const addedImage = imageElementRef.current?.files?.[0] || null;
                                const isEmpty = !addedImage && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

                                if(isEmpty) return;

                                const body = JSON.stringify(quill.getContents());

                                submitRef.current?.({body,image: addedImage});
                            }
                        },
                        shift_enter: {
                            key: "Enter",
                            shiftKey: true,
                            handler: () => {
                                quill.insertText(quill.getSelection()?.index || 0, "\n")
                            }
                        }
                    }
                }
            }
        };


        const quill = new Quill(editorContainer, options);

        quillRef.current = quill;
        quillRef.current.focus();

        if (innerRef) {
            innerRef.current = quill;
        }

        quill.setContents(defaultValueRef.current);
        setText(quill.getText());

        quill.on(Quill.events.TEXT_CHANGE, () => {
            setText(quill.getText());
        })

        return () => {

            quill.off(Quill.events.TEXT_CHANGE);

            if (container) {
                container.innerHTML = "";
            }

            if (quillRef.current) {
                quillRef.current = null;
            }

            if (innerRef) {
                innerRef.current = null;
            }
        }


    }, [innerRef]);


    const toggleToolbar = () => {
        setIsToolbarVisible((current) => !current);
        const toolbarElement = containerRef.current?.querySelector(".ql-toolbar");

        if (toolbarElement) {
            toolbarElement.classList.toggle("hidden");
        }
    }

    const onEmojiSelect = (emojiValue: string) => {
        const quill = quillRef.current;

        quill?.insertText(quill?.getSelection()?.index || 0, emojiValue);
    }

    const isEmpty = !image && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;
    return (
        <div className="flex flex-col">
            <Input
                type="file"
                accept="image/*"
                ref={imageElementRef}
                onChange={(event) => setImage(event.target.files![0])}
                className="hidden"
            />
            <div className={
                cn(
                    "flex flex-col border border-stone-100 rounded-md overflow-hidden focus-within:border-stone-300 focus-within:shadow-xs transition bg-background ",
                    disabled && "opacity-50"
                )
            }>
                <div ref={containerRef} className="h-full ql-custom" />
                {
                    !!image && (
                        <div className="p-2">
                            <div className="relative size-[62px] flex items-center justify-center group/image">
                                <Hint label="ลบรูปภาพ">
                                    <Button
                                        onClick={() => {
                                            setImage(null);
                                            imageElementRef.current!.value = "";
                                        }}
                                        size={"icon"}
                                        className="cursor-pointer hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2 text-white size-6 z-[4] border-2 border-white items-center justify-center"
                                    >
                                        <XIcon className="size-4" />
                                    </Button>
                                </Hint>
                                <Image
                                    src={URL.createObjectURL(image)}
                                    alt="Uploaded"
                                    fill
                                    className="rounded-xl overflow-hidden border object-cover "
                                />
                            </div>
                        </div>
                    )
                }
                <div className="flex px-2 z-[5] pb-2">
                    <Hint label={!isToolbarVisible ? "ซ่อนแทบเครื่องมือ" : "แสดงแทบเครื่องมือ"}>
                        <Button
                            disabled={disabled}
                            size={"icon"}
                            variant={"ghost"}
                            onClick={toggleToolbar}
                            className="cursor-pointer"
                        >
                            <PiTextAa className="size-4" />
                        </Button>
                    </Hint>
                    <EmojiPopover onEmojiSelect={onEmojiSelect}>
                        <Button
                            disabled={disabled}
                            size={"icon"}
                            variant={"ghost"}
                            className="cursor-pointer"
                        >
                            <Smile className="size-4" />
                        </Button>
                    </EmojiPopover>
                    {variant === "create" && (
                        <Hint label="รูปภาพ">
                            <Button
                                disabled={disabled}
                                size={"icon"}
                                variant={"ghost"}
                                onClick={() => imageElementRef.current?.click()}
                                className="cursor-pointer"
                            >
                                <ImageIcon className="size-4" />
                            </Button>
                        </Hint>
                    )}
                    {variant === "update" && (
                        <div className="ml-auto flex items-center gap-x-2">
                            <Button
                                className="ml-auto cursor-pointer"
                                disabled={false}
                                size={"sm"}
                                onClick={onCancel}
                                variant={"ghost"}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                className="ml-auto cursor-pointer"
                                disabled={disabled || isEmpty}
                                size={"sm"}
                                onClick={
                                    () => {
                                        onSubmit({
                                            body: JSON.stringify(quillRef.current?.getContents()),
                                            image,
                                        })
                                    }}
                                variant={"default"}
                            >
                                อัปเดต
                            </Button>
                        </div>
                    )}
                    {variant === "create" && (
                        <Button
                            className={cn(
                                "ml-auto cursor-pointer",
                                isEmpty
                                    ? "bg-background text-gray-500"
                                    : "text-background"
                            )
                            }
                            disabled={disabled || isEmpty}
                            size={"sm"}
                            onClick={
                                () => {
                                    onSubmit({
                                        body: JSON.stringify(quillRef.current?.getContents()),
                                        image,
                                    })
                                }
                            }
                        >
                            <MdSend className="size-4" />
                        </Button>
                    )}
                </div>
            </div>
            {variant === "create" && (
                <div className={cn(
                    "p-2 text-[10px] text-muted-foreground flex justify-end opacity-0",
                    !isEmpty && "opacity-100"
                )}>
                    <p>
                        <strong>Shift + Enter</strong> เพื่อเพิ่มบรรทัดใหม่
                    </p>
                </div>
            )}
        </div>
    )
}

export default Editor;