"use client"

import { Button } from "@/components/ui/button";
import { LoaderCircle, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { useClassroomId } from "@/hooks/use-classroom-id";
import { useCreateAssignmentWithFiles } from "@/features/assignments/api/use-crate-assignment";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import Loader from "@/components/loader";



function AssignmentPage() {
  const classroomId = useClassroomId();

  const [ConfirmDialog, confirm] = useConfirm(
    "คุณแน่ใจแล้วใช่ไหม ?",
    "การกระทำนี้ไม่สามารถย้อนกลับได้!"
  );

  const [open, setOpen] = useState(false);

  const router = useRouter();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  useEffect(() => {
    if (!user || !classroomId) return;

    if (user.role !== "teacher") {
      router.replace(`/classroom/${classroomId}`);
    }
  }, [user, classroomId]);


  const { mutate, isPending } = useCreateAssignmentWithFiles();

  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    score: 10,
    publish: true,
    dueDate: "",
  });



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement; // Cast e.target เป็น HTMLInputElement

    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === "checkbox" ? checked : value, // ถ้าเป็น checkbox ใช้ checked, ถ้าไม่ใช่ให้ใช้ value
    }));
  };




  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };


  const handleSubmit = async () => {

    const ok = await confirm();
    if (!ok) return;

    if (!form.name) {
      toast.error("กรุณาระบุชื่อการบ้าน!");
      return;
    }

    if (!form.dueDate) {
      toast.error("กรุณาระบุกำหนดส่ง!");
      return;
    }

    await mutate({
      name: form.name,
      description: form.description,
      score: Number(form.score),
      publish: form.publish,
      dueDate: new Date(form.dueDate).toISOString(),
      classroomId,
      fileObjects: files,
    }, {
      onSuccess: () => {
        toast.success("สร้างการบ้านสำเร็จ!");
        setForm({
          name: "",
          description: "",
          score: 10,
          publish: true,
          dueDate: "",
        });
        setFiles([]);
        setOpen(!open);
      },
      onError: () => {
        toast.success("เกิดข้อผิดพลาด สร้างการบ้านไม่สำเร็จ!");
      },
    });
  };

  if (userLoading || user?.role !== "teacher") {
    return <Loader />
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-8">
      <ConfirmDialog />
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl overflow-y-auto messages-scrollbar max-h-[90vh]">
        <h2 className="text-xl font-semibold text-center text-gray-700 mb-6">เพิ่มการบ้านใหม่</h2>

        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">หัวข้อ</label>
          <Input
            type="text"
            id="name"
            disabled={isPending}
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            placeholder="หัวข้อ"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">คำอธิบาย</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="mt-1 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            placeholder="คำอธิบาย"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="score" className="block text-sm font-medium text-gray-700">คะแนนเต็ม</label>
          <Input
            type="number"
            id="score"
            name="score"
            disabled={isPending}
            value={form.score}
            onChange={handleChange}
            className="mt-1 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            placeholder="คะแนนเต็ม"
          />
        </div>

        <div className="mb-6 flex items-center">
          <label htmlFor="publish" className="mr-2 text-sm font-medium text-gray-700">แผยแพร่</label>
          <input
            type="checkbox"
            id="publish"
            name="publish"
            disabled={isPending}
            checked={form.publish}
            onChange={handleChange}
            className="focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">กำหนดส่ง</label>
          <Input
            type="datetime-local"
            id="dueDate"
            disabled={isPending}
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
            className="mt-1 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>

        <div className="mb-6 w-full">
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">ไฟล์</label>
          <div className="mt-2 w-full">
            <Input
              name="file"
              id="file"
              disabled={isPending}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file"
              className="w-full px-4 py-2 bg-primary text-white text-center rounded-md cursor-pointer transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring--primary hover:bg-blue-700"
            >
              เลือกไฟล์
            </label>
          </div>


          {files.length > 0 && (
            <ul className="mt-4 text-sm text-gray-600 space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded-md shadow-sm">
                  <span className="flex gap-2 items-center text-gray-700">
                    <Paperclip className="text-gray-500" />
                    {file.name}
                  </span>
                  <Button
                    disabled={isPending}
                    variant="ghost"
                    onClick={() => handleRemoveFile(index)}
                    className="cursor-pointer hover:text-red-700 text-xs text-red-500"
                  >
                    ลบ
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full mt-4 py-3 cursor-pointer"
        >
          {isPending ? <span className="flex gap-1 items-center justify-center"><LoaderCircle className="animate-spin" />เพิ่มการบ้าน</span> : "เพิ่มการบ้าน"}
        </Button>
      </div>
    </div>
  )
}

export default AssignmentPage