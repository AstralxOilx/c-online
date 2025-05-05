import { useMutation } from "convex/react";
import { useCallback, useMemo, useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

type RequestType = {
    id: Id<"users">;
    image?: Id<"_storage">;
};

type ResponseType = {
    success: boolean;
    message: string;
};

type Options = {
    onSuccess?: (data: ResponseType) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
    throwError?: boolean;
};

export const useUpdateProfileImage = () => {
    const [data, setData] = useState<ResponseType | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [status, setStatus] = useState<"success" | "error" | "settled" | "pending" | null>(null);

    const isPending = useMemo(() => status === "pending", [status]);
    const isSuccess = useMemo(() => status === "success", [status]);
    const isError = useMemo(() => status === "error", [status]);
    const isSettled = useMemo(() => status === "settled", [status]);

    const mutation = useMutation(api.users.updateImageProfile);

    const mutate = useCallback(
        async (values: RequestType, options?: Options) => {
            try {
                setData(null);
                setError(null);
                setStatus("pending");

                const response: ResponseType = await mutation(values);

                setData(response); // ตั้งค่าผลลัพธ์ที่ได้จาก API
                options?.onSuccess?.(response); // เรียกใช้ onSuccess (ถ้ามี)
                setStatus("success");
                return response;
            } catch (error) {
                setError(error as Error);
                setStatus("error");
                options?.onError?.(error as Error); // เรียกใช้ onError (ถ้ามี)
                if (options?.throwError) {
                    throw error;
                }
            } finally {
                setStatus("settled");
                options?.onSettled?.(); // เรียกใช้ onSettled (ถ้ามี)
            }
        },
        [mutation]
    );

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
