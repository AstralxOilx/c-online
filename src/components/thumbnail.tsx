
import {
    Dialog,
    DialogContent, 
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
 


interface ThumbnailProps {
    url: string | null | undefined;
}

export const Thumbnail = ({ url }: ThumbnailProps) => {
    if (!url) return null;


    return (
        <Dialog>
            <DialogTrigger>
                <div className=" relative overflow-hidden max-w-[360px] border rounded-md my-2 cursor-zoom-in ">
                    <img
                        src={url}
                        alt="msg img"
                        className="rounded-md object-center size-full"
                    />
                </div>
            </DialogTrigger>
            <DialogTitle/>
            <DialogContent className="max-w-[800px] border-none bg-transparent p-0 shadow-none">
                <img
                    src={url}
                    alt="msg img"
                    className="rounded-md object-center size-full"
                />
            </DialogContent>
        </Dialog>
    )

}