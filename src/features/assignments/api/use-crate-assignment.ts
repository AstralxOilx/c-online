import { useMutation } from "convex/react";
import { useCallback, useMemo, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

type FileInfo = {
  name: string;
  storageId: Id<"_storage">;
};

type RequestType = {
  name: string;
  description: string;
  score: number;
  publish: boolean;
  dueDate: string;
  classroomId: Id<"classrooms">;
  files?: FileInfo[];
};

type ResponseType = void | null;

type Options = {
  onSuccess?: (data: ResponseType | null) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
};

export const useCreateAssignmentWithFiles = () => {
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
  const createAssignment = useMutation(api.assignments.createAssignmentWithFiles);

  const [data, setData] = useState<ResponseType | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<"success" | "error" | "settled" | "pending" | null>(null);

  const isPending = useMemo(() => status === "pending", [status]);
  const isSuccess = useMemo(() => status === "success", [status]);
  const isError = useMemo(() => status === "error", [status]);
  const isSettled = useMemo(() => status === "settled", [status]);

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
        fileObjects, // 👈 remove this
        ...rest
      } = values;
  
      const response = await createAssignment({
        ...rest,
        score: Number(values.score),
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
  }, [generateUploadUrl, createAssignment]);
  

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
