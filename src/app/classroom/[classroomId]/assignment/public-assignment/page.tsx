"use client"

import { LoaderCircle } from "lucide-react";
import { useClassroomId } from "@/hooks/use-classroom-id";
import { usePanel } from "@/hooks/use-panel";
import { useGetAssignmentPublic } from "@/features/assignments/api/use-get-assignment-public";
import { useRouter } from "next/navigation";



function AssignmentPage() {
  const classroomId = useClassroomId();

  const router = useRouter();

  const { data: assignmentPrivate, isLoading: loadingAssignmentPrivate } = useGetAssignmentPublic({ classroomId });


  const { onEditAssignment, onStudentAssignment } = usePanel();

  if (loadingAssignmentPrivate) {
    return (
      <div className="h-full flex-1 flex justify-center items-center flex-col gap-2 ">
        <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!assignmentPrivate) {
    router.replace(`../../${classroomId}`);
    return;
  }

  return (
    <div className="p-4 h-screen flex flex-col items-center bg-gray-100 py-4 overflow-y-auto messages-scrollbar">
      <div className="w-full space-y-4">
        {assignmentPrivate.assignments.map((assignment) => (
          <div
            key={assignment._id}
            className="flex items-center justify-between border rounded-sm p-4 bg-white shadow-sm hover:shadow-md transition-all"
          >
            <div>
              <h2 className="text-xl font-bold text-primary">{assignment.name}</h2>

              {/* ถ้า publish เป็น false จะมีข้อความ "ยังไม่เผยแพร่" และแสดงคะแนน */}
              {assignment.publish && (
                <div>
                  <div className="flex gap-1">
                    <p className="text-sm text-green-600">เผยแพร่</p>
                    <p className="text-sm">ส่งแล้ว:{assignment.submitCount}คน</p>
                  </div>
                  <p>คะแนนเต็ม: {assignment.score} คะแนน</p>
                </div>
              )}

              {assignment.description && (
                <p className="text-gray-600 text-sm mt-2">{assignment.description}</p>
              )}
            </div>
            <div className="space-y-2">
              <button
                className="p-2 cursor-pointer w-full bg-primary text-white rounded-md hover:bg-primary/90 transition"
                onClick={() => {
                  onStudentAssignment(assignment._id);
                }}
              >
                ดูผลงานนักเรียน
              </button>

              <button
                className="p-2 cursor-pointer w-full bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                onClick={() => {
                  onEditAssignment(assignment._id);
                }}
              >
                แก้ไขการบ้าน
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>

  )
}

export default AssignmentPage