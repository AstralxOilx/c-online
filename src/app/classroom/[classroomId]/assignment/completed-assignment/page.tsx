"use client";

import { useRouter } from "next/navigation";

import { AlertTriangle, LoaderCircle, RefreshCcw } from "lucide-react";
import { useClassroomId } from "@/hooks/use-classroom-id";
import { useGetAssignmentStatusStudent } from "@/features/assignments/api/use-get-assignment-student";
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import { Button } from "@/components/ui/button";
import { usePanel } from "@/hooks/use-panel";
import { useEffect } from "react";
import Loader from "@/components/loader";

const CompletedAssignment = () => {
  const router = useRouter();
  const classroomId = useClassroomId();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (!user || !classroomId) return;

    if (user.role !== "student") {
      router.replace(`/classroom/${classroomId}`);
    }
  }, [user, classroomId]);

  const { onSubmitAssignment } = usePanel();
  const { data: assignment, isLoading: loadingAssignment } = useGetAssignmentStatusStudent({
    classroomId
  });


  if (loadingAssignment || userLoading) {
    return (
      <div className="h-full flex-1 flex justify-center items-center flex-col gap-2 ">
        <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !assignment) {
    router.replace(`../../${classroomId}`);
    return;
  }

  if (userLoading) {
    return <Loader />
  }


  const submittedAssignments = assignment?.submitted ?? [];
  return (
    <>
      <div className="p-4 h-screen flex flex-col items-center py-4 overflow-y-auto messages-scrollbar">
        <div className="w-full space-y-2">
          <div>
            <h2 className="text-lg font-bold mb-2">การบ้านที่ส่งแล้ว</h2>
            <div className="w-full space-y-2">
              {/* ตรวจสอบว่ามีการบ้านที่ยังไม่ส่ง */}
              {submittedAssignments.length > 0 ? (
                submittedAssignments.map((item) => (
                  <div
                    onClick={() => { onSubmitAssignment(item.assignmentId) }}
                    key={item.assignmentId}
                    className="flex items-center justify-between border p-4 rounded-sm shadow-lg mb-4 hover:bg-accent transition duration-300"
                  >
                    <div>
                      <p>{item.name}</p>
                      <p className="text-xs text-muted-foreground">คะแนน:{item.score ?? 0}/{item.fullScore}</p>
                    </div>
                    <div>
                      <span
                        className={`text-sm ${item.status === "submitted" ? "text-green-500" :
                          item.status === "late" ? "text-red-500" :
                            item.status === "canResubmit" ? "text-yellow-500" : "text-gray-500"
                          }`}
                      >
                        {item.status === "submitted" && "ส่งแล้ว"}
                        {item.status === "late" && "เกินกำหนด"}
                        {item.status === "canResubmit" && "ส่งใหม่ได้"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">ไม่มีการบ้านที่ส่ง</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompletedAssignment;
