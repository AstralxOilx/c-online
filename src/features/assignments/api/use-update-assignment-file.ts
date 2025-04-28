import { useMutation } from "convex/react";
import { useState, useMemo, useCallback } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

type FileInfo = {
    name: string;
    storageId: Id<"_storage">;  // storageId จะเก็บ ID ที่ได้จากการอัปโหลดไฟล์
};

type RequestType = {
    assignmentId: Id<"assignments">;
    files?: FileInfo[];  // เปลี่ยนจากต้องมี เป็น optional
};

type ResponseType = Id<"files"> | null;

type Options = {
    onSuccess?: (data: ResponseType) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
    throwError?: boolean;
};

export const useUpdateAssignmentFile = () => {
    const [data, setData] = useState<ResponseType>(null);
    const [error, setError] = useState<Error | null>(null);
    const [status, setStatus] = useState<"success" | "error" | "settled" | "pending" | null>(null);

    const isPending = useMemo(() => status === "pending", [status]);
    const isSuccess = useMemo(() => status === "success", [status]);
    const isError = useMemo(() => status === "error", [status]);
    const isSettled = useMemo(() => status === "settled", [status]);


    const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
    const createAssignmentFile = useMutation(api.assignments.upDateFile);

    // const mutation = useMutation(api.assignments.upDateFile);

    const mutate = useCallback(async (
        values: RequestType & { fileObjects?: File[] },
        options?: Options
    ) => {
        try {
            setError(null);
            setStatus("pending");

            const uploadedFiles: FileInfo[] = [];

            if (values.fileObjects?.length) {
                for (const file of values.fileObjects) {
                    const uploadUrl = await generateUploadUrl();
                    const res = await fetch(uploadUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": file.type,
                        },
                        body: file,
                    });

                    if (!res.ok) throw new Error("การอัปโหลดไฟล์ล้มเหลว");

                    const { storageId } = await res.json();
                    uploadedFiles.push({
                        name: file.name,
                        storageId,
                    });
                }
            }

            // แยก fileObjects ออกก่อนส่งเข้า backend
            const {
                fileObjects, 
                ...rest
            } = values;

            const response = await createAssignmentFile({
                ...rest,
                files: uploadedFiles,
              });
              

            setData(response);
            setStatus("success");
            options?.onSuccess?.(response);
            return response;
        } catch (err) {
            const error = err as Error;
            setError(error);
            setStatus("error");
            options?.onError?.(error);
            if (options?.throwError) throw error;
        } finally {
            setStatus("settled");
            options?.onSettled?.();
        }
    }, [generateUploadUrl, createAssignmentFile]);


    return {
        mutate,
        data,
        error,
        isPending,
        isSuccess,
        isSettled,
        isError,
    };
}; 
