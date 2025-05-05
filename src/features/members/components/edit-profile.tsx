
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle, Plus, UserCog } from "lucide-react";
import { useEditProfileModal } from "../store/use-edit-profile-modal";
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import { useUpdateProfileText } from "../api/use-update-profile-text";
import { Id } from "../../../../convex/_generated/dataModel";
import { useUpdateProfileImage } from "../api/use-update-profile-img";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";



type ProfileValues = {
    id: Id<"users">;
    image: Id<"_storage"> | undefined;
}




export const EditProfileModal = () => {

    const router = useRouter();
    const [open, setOpen] = useEditProfileModal();
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const { mutate: upDateProfileText, isPending: upDateProfileTextPending } = useUpdateProfileText();

    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [identificationCode, setIdentificationCode] = useState('');


    const [error, setError] = useState<string | null>(null);
    const { mutate: generateUploadUrl } = useGenerateUploadUrl();
    const { mutate: upDateImageProfile, isPending: upDateImageProfilePending } = useUpdateProfileImage();
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);



    useEffect(() => {
        if (user) {
            setFname(user.fname);
            setLname(user.lname);
            setIdentificationCode(user.identificationCode);
        }

    }, [user]);

    const handleClose = () => {
        setOpen(false);
        if (user) {
            setFname(user.fname);
            setLname(user.lname);
            setIdentificationCode(user.identificationCode);
            //เมื่อปิด
        }
    }
    const handleUpdateText = async () => {
        upDateProfileText({
            fname: fname.trim(),
            lname: lname.trim(),
            identificationCode: identificationCode.trim(),
            id: user?._id as Id<"users">,
        }, {
            onSuccess() {
                toast.success("บันทึกสำเร็จ!");
            }
        });
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            if (!user?._id) {
                throw new Error("ไม่พบข้อมูลผู้ใช้");
            }

            // แสดง preview ทันที
            const localUrl = URL.createObjectURL(file);
            setPreviewImage(localUrl);

            setIsUploading(true);
            setUploadProgress(0);

            const values: ProfileValues = {
                id: user._id as Id<"users">,
                image: undefined,
            };

            const url = await generateUploadUrl({}, { throwError: true });
            if (!url) throw new Error("ไม่สามารถสร้าง URL อัปโหลดได้");

            // ❗ อัปโหลดด้วย XMLHttpRequest เพื่อ track progress
            const xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", file.type);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = (event.loaded / event.total) * 100;
                    setUploadProgress(percent);
                }
            };

            xhr.onload = async () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    const { storageId } = response;

                    values.image = storageId;

                    await upDateImageProfile(values, {
                        onSuccess: () => {
                            setIsUploading(false);
                            setUploadProgress(100);
                            toast.success("อัปโหลดสำเร็จ!");
                        },
                        onError: (err) => {
                            setIsUploading(false);
                            toast.error("เกิดข้อผิดพลาดขณะอัปเดตรูป");
                        },
                    });
                } else {
                    setIsUploading(false);
                    toast.error("อัปโหลดล้มเหลว");
                }
            };

            xhr.onerror = () => {
                setIsUploading(false);
                toast.error("เกิดข้อผิดพลาดระหว่างการอัปโหลด");
            };

            xhr.send(file);
        } catch (err) {
            setIsUploading(false);
            toast.error("เกิดข้อผิดพลาด");
        }
    };




    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md overflow-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCog className="w-5 h-5" />
                        โปรไฟล์ผู้ใช้
                    </DialogTitle>
                    <DialogDescription>แก้ไขข้อมูลส่วนตัวของคุณ</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* รูปโปรไฟล์ */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <Avatar style={{ width: '6rem', height: '6rem' }} className=" rounded-md">
                                <AvatarImage className="object-cover rounded-sm w-full h-full" alt="avatarFallback" src={user?.image?.toString()} />
                                <AvatarFallback className="flex items-center justify-center w-full h-full rounded-sm bg-primary text-white text-xl">
                                    {user?.fname?.[0]?.toUpperCase() ?? "M"}
                                </AvatarFallback>
                            </Avatar>
                            <label
                                htmlFor="profileImage"
                                className="absolute bottom-0 left-0 right-0 bg-black text-white text-xs py-1 text-center opacity-0 group-hover:opacity-100 group-hover:bg-black cursor-pointer rounded-b-full transition"
                            >
                                เปลี่ยนรูป
                            </label>
                            <Input
                                id="profileImage"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                        </div>

                        {isUploading && (
                            <p className="text-sm text-muted-foreground mt-2">
                                กำลังอัปโหลด... ({Math.round(uploadProgress)}%)
                            </p>
                        )}

                        {error && (
                            <p className="text-sm text-red-500 mt-1">{error}</p>
                        )}
                    </div>

                    {/* ฟอร์มข้อมูล */}
                    <div className="grid gap-3">
                        <div>
                            <label className="text-sm text-muted-foreground">รหัสประจำตัว</label>
                            <Input
                                value={identificationCode}
                                onChange={(e) => setIdentificationCode(e.target.value)}
                                placeholder={user?.identificationCode}
                                disabled={upDateProfileTextPending}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">ชื่อ</label>
                            <Input
                                value={fname}
                                onChange={(e) => setFname(e.target.value)}
                                placeholder={user?.fname}
                                disabled={upDateProfileTextPending}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">นามสกุล</label>
                            <Input
                                value={lname}
                                onChange={(e) => setLname(e.target.value)}
                                placeholder={user?.lname}
                                disabled={upDateProfileTextPending}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            disabled={upDateProfileTextPending}
                            onClick={handleUpdateText}
                            className="flex items-center gap-2"
                        >
                            {upDateProfileTextPending ? (
                                <LoaderCircle className="w-4 h-4 animate-spin" />
                            ) : (
                                <UserCog className="w-4 h-4" />
                            )}
                            บันทึก
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

    )
}
