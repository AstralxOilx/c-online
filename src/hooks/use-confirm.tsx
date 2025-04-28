import { JSX, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle, 
} from "@/components/ui/dialog";


export const useConfirm = (
    title: string,
    message: string,
): [() => JSX.Element, () => Promise<unknown>] => {

    const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null)

    const confirm = () => new Promise((resolve, reject) => {
        setPromise({ resolve })
    });

    const handleClose = () => {
        setPromise(null);
    };

    const handleCancel = () => {
        promise?.resolve(false);
        handleClose();
    };

    const handleConfirm = () => {
        promise?.resolve(true);
        handleClose();
    };


    const ConfirmDialog = () => (
        <Dialog open={promise !== null} >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        onClick={handleCancel}
                        variant={"outline"}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        variant={"default"}
                    >
                        ตกลก
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );


    return [ConfirmDialog, confirm]
}