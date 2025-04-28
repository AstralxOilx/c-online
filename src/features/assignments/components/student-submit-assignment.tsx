"use client"

import { useClassroomId } from "@/hooks/use-classroom-id";
import { Id } from "../../../../convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoaderCircle, XIcon } from "lucide-react";
import { useGetSubmitAssignments } from "../api/use-get-submitassignments";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCheckAssignment } from "../api/use-check-assignment";
import { useAllowResubmissionAssignment } from "../api/use-allow-resubmission-assignment";




interface ThreadProps {
  assignmentId: Id<"assignments">;
  onClose: () => void;
}


const formatDate = (date:string) => {
  return new Date(date).toLocaleDateString("th-TH", {
    weekday: "short",  // วันในสัปดาห์ (เช่น จ., อา.)
    year: "numeric",   // ปี (เช่น 2025)
    month: "long",     // เดือน (เช่น มกราคม)
    day: "numeric"     // วันที่ (เช่น 5)
  });
};

export const StudentSubmitAssignment = ({
  assignmentId,
  onClose,
}: ThreadProps) => {

  // const router = useRouter();
  const classroomId = useClassroomId();

  const [files, setFiles] = useState<File[]>([]);

  const [openState, setOpenState] = useState<{ [key: string]: boolean }>({});




  const [AllowResubmissionAssignment, confirmAllowResubmissionAssignment] = useConfirm(
    "ให้นักเรียนส่งงานที่หมอบหมายนี้ใหม่?",
    "การกระทำนี้ไม่สามารถย้อนกลับได้!"
  );


  const [SendAssignmentDialog, confirmSendAssignment] = useConfirm(
    "ตรวจงานที่หมอบหมายนี้?",
    "การกระทำนี้ไม่สามารถย้อนกลับได้!"
  );





  const { data: submitAssignment, status, loadMore } = useGetSubmitAssignments({ assignmentId });
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const { mutate: checkAssignment, isPending: isUpdatingCheckAssignment, isSuccess, isError } = useCheckAssignment();
  const { mutate: allowResubmissionAssignment, isPending: isUpdatingAllowResubmissionAssignment, isSuccess: isSuccessAllowResubmission, isError: isErrorAllowResubmission } = useAllowResubmissionAssignment();

  const handleToggleOpen = (id: string, submit: any) => {
    setOpenState(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));

    if (!openState[id]) {
      setSelectedStudent(submit);
    } else {
      setSelectedStudent(null);
    }
  };


  const handleAllowResubmission = async () => {
    const ok = await confirmAllowResubmissionAssignment();
    if (!ok) return;

    if (selectedStudent) {
      allowResubmissionAssignment(
        {
          submitAssignmentId: selectedStudent._id as Id<"submitAssignments">,
        },
        {
          onSuccess: () => {
            toast.success("ให้นักเรียนส่งงานมาใหม่สำเร็จ!");
          },
          onError: (error) => {
            toast.error(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.message}`);
          },
        }
      );
    }
  };

  const handleSaveChanges = async () => {

    const ok = await confirmSendAssignment();
    if (!ok) return;

    if (selectedStudent) { 
      checkAssignment(
        {
          submitAssignmentId: selectedStudent._id as Id<"submitAssignments">,
          score: selectedStudent.score ?? 0,
          feedback: selectedStudent.feedback ?? '',
        },
        {
          onSuccess: () => {
            toast.success("บันทึกข้อมูลสำเร็จ!");
          },
          onError: (error) => {
            toast.error(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.message}`);
          },
        }
      );
    }
  };

  useEffect(() => {
  }, [isSuccess, isError]);



  const downloadFile = async (file: { url: string; name: string }) => {
    const response = await fetch(file.url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    window.URL.revokeObjectURL(url);
  };









  return (
    <>
      <AllowResubmissionAssignment />
      <SendAssignmentDialog />
      <div className="flex flex-col h-full overflow-y-auto messages-scrollbar mb-16">
        <div className="h-full w-full flex justify-start items-center flex-col gap-y-2 p-1">
          <div className=" w-full p-2 rounded-sm grid gap-1">
            <div className="flex justify-between items-center bg-secondary/50 h-[45px] overflow-hidden px-4">
              <p className="text-lg font-bold">ดูผลงานนักเรียน</p>
              <Button className="cursor-pointer" onClick={onClose} size={"sm"} variant={"ghost"}>
                <XIcon className="size-5 stroke-[1.5]" />
              </Button>
            </div>
            <div className="flex flex-col h-full overflow-y-auto messages-scrollbar mb-16 p-4">
              <div className="">
                {submitAssignment.map((submit) => (
                  <div key={submit._id} className="grid gap-1">
                    <Button
                      variant={"ghost"}
                      className="cursor-pointer flex items-center justify-between"
                      onClick={() => handleToggleOpen(submit._id, submit)} // ส่งข้อมูล submit เมื่อคลิก
                    >
                      {submit.user?.fname + ' ' + submit.user?.lname}
                      <span>
                        {submit.isChecked ? (
                          <span className="text-sm text-green-500">ตรวจแล้ว</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">ยังไม่ตรวจ</span>
                        )}
                      </span>
                    </Button>

                    <Dialog open={openState[submit._id]} onOpenChange={() => handleToggleOpen(submit._id, submit)}>
                      <DialogContent className="h-96 overflow-y-auto messages-scrollbar">
                        <DialogHeader>
                          <DialogTitle>ตรวจงานที่หมอบหมาย?</DialogTitle>
                          <DialogDescription> </DialogDescription>
                          {/* ข้อมูลที่ต้องการแสดง */}
                          {selectedStudent && selectedStudent._id === submit._id && (
                            <div>
                              <p>ชื่อ: {selectedStudent.user?.fname} {selectedStudent.user?.lname}</p>
                              <p>
                                สถานะ:{" "}
                                {selectedStudent.status === "submitted" ? (
                                  <span className="text-green-500">ส่งตรงเวลา</span>
                                ) : selectedStudent.status === "late" ? (
                                  <span className="text-yellow-500">ส่งช้า</span>
                                ) : selectedStudent.status === "canResubmit" ? (
                                  <span className="text-muted-foreground">ให้นักเรียนส่งงานที่หมอบหมายนี้ใหม่</span>
                                ) : (
                                  <span className="text-muted-foreground">สถานะไม่ระบุ</span>
                                )}
                              </p> 
                              {/* ช่องกรอกคะแนน */}
                              <div className="mt-4">
                                <label className="block font-medium">คะแนน:</label>
                                <Input
                                  disabled={isUpdatingCheckAssignment}
                                  type="number"
                                  value={selectedStudent.score ?? 0}
                                  onChange={(e) => setSelectedStudent({
                                    ...selectedStudent,
                                    score: isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value),
                                  })}
                                  className="border rounded px-2 py-1"
                                  min={0}
                                />
                              </div>

                              {/* ช่องกรอกความคิดเห็น */}
                              <div className="mt-4">
                                <label htmlFor="feedback" className="block font-medium">ความคิดเห็น:</label>
                                <textarea
                                  disabled={isUpdatingCheckAssignment}
                                  id="feedback"
                                  value={selectedStudent.feedback ?? ""}
                                  onChange={(e) => setSelectedStudent({
                                    ...selectedStudent,
                                    feedback: e.target.value,
                                  })}
                                  className="border rounded px-2 py-1 w-full min-h-[80px]"
                                />
                              </div>

                              {/* แสดงไฟล์ที่นักเรียนแนบมา */}
                              <div className="mt-4">
                                <p>ไฟล์ที่แนบมา:</p>
                                {submit.files && submit.files.length > 0 ? (
                                  <ul>
                                    {submit.files.map((file, index) => (
                                      <li key={index} className="mt-2">
                                        <a
                                          href={file.url ?? undefined}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-500"
                                        >
                                          {file.name}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p>ไม่มีไฟล์ที่แนบมา</p>
                                )}
                              </div>

                              {/* ปุ่มบันทึกคะแนน */}
                              <div className="mt-4">
                                <Button disabled={isUpdatingCheckAssignment} onClick={handleSaveChanges} className="mt-2 w-full">
                                  {isUpdatingCheckAssignment ? (
                                    <span className="flex gap-1 items-center justify-center">
                                      <LoaderCircle className=" animate-spin " />บันทึก
                                    </span>
                                  ) : "บันทึก"}
                                </Button>
                              </div>

                              {/* ปุ่มอนุญาตให้ส่งงานใหม่ */}
                              <div className="mt-4">
                                <Button
                                  variant={"secondary"}
                                  disabled={isUpdatingAllowResubmissionAssignment}
                                  onClick={handleAllowResubmission}
                                  className="mt-2 w-full"
                                >
                                  {isUpdatingAllowResubmissionAssignment ? (
                                    <span className="flex gap-1 items-center justify-center">
                                      <LoaderCircle className=" animate-spin " />ให้นักเรียนส่งงานมาใหม่
                                    </span>
                                  ) : "ให้นักเรียนส่งงานมาใหม่"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}