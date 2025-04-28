"use client";


// import data from "@emoji-mart/data";
// import Picker from "@emoji-mart/react";

// import EmojiPicker from "@emoji-mart/react";

import EmojiPicker,{ type EmojiClickData} from 'emoji-picker-react'; 


import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

interface EmojiPopoverProps {
    children: React.ReactNode;
    hint?: string;
    onEmojiSelect: (emoji: string) => void;
}

export const EmojiPopover = ({
    children,
    hint = "อิโมจิ",
    onEmojiSelect,
}: EmojiPopoverProps) => {

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const onSelect = (value: EmojiClickData) => { 

        onEmojiSelect(value.emoji);
        setPopoverOpen(false);

        setTimeout(() => {
            setTooltipOpen(false);
        }, 500);
    };

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <TooltipProvider>
                <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen} delayDuration={50}>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            {children}
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="font-semibold text-xs">{hint}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <PopoverContent className="p-0 w-full border-none shadow-none">
                {/* <Picker data={data} onEmojiSelect={onSelect} theme="light" /> */}
                <EmojiPicker onEmojiClick={onSelect} />
            </PopoverContent>
        </Popover>

    );
}