import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SignInFlow } from "../types";
import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";



interface SignUpCardProps {
    setState: (state: SignInFlow) => void;
}



export const SignUpCard = ({ setState }: SignUpCardProps) => {

    const { signIn } = useAuthActions();

    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [role, setRole] = useState(''); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [identificationCode, setIdentificationCode] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');

    const onPasswordSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPending(true);
        setError("");

        if (!fname && !lname) {
            setError("กรุณาระบุชื่อ และนามสกุลให้ครบถ้วน");
            setPending(false);
            return;
        }

        if (password.length < 6) {
            setError("รหัสผ่าน ต้องมีอย่างน้อย 6 ตัวอักษร");
            setPending(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("รหัสผ่านไม่ตรงกัน");
            setPending(false);
            return;
        }


        try {
            const sessionId = await signIn("password", {
                fname,
                lname,
                email,
                role: role, 
                identificationCode,
                password,
                flow: "signUp",
            })
 
        } catch (error) {
            setError("อีเมล์ถูกใช้แล้ว");
            setPending(false);
        }

    };

    return (
        <Card className="w-full h-full p-8 ">
            <CardHeader className="px-0 pt-0">
                <CardTitle>ลงทะเบียนเพื่อดำเนินการต่อ</CardTitle>
                <CardDescription>
                    ใช้อีเมลของคุณหรือบริการอื่นเพื่อดำเนินการต่อ
                </CardDescription>
            </CardHeader>
            {!!error && (
                <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-destructive mb-2">
                    <TriangleAlert className="size-4" />
                    <p>{error}</p>
                </div>
            )}
            <CardContent className="space-y-5 px-0 pb-0">
                <form onSubmit={onPasswordSignUp} className="space-y-2.5 grid gap-2"> 
                    <Input
                        disabled={pending}
                        value={fname}
                        onChange={(e) => setFname(e.target.value)}
                        placeholder="ชื่อ"
                        type="text"
                        required
                    />  <Input
                        disabled={pending}
                        value={lname}
                        onChange={(e) => setLname(e.target.value)}
                        placeholder="นามสกุล"
                        type="text"
                        required
                    />
                    <Select value={role} onValueChange={setRole} required>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="บทบาท" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="student">นักเรียน/นักศึกษา</SelectItem>
                            <SelectItem value="teacher">ครู/อาจารย์</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        disabled={pending}
                        value={identificationCode}
                        onChange={(e) => setIdentificationCode(e.target.value)}
                        placeholder="รหัสประจำตัว นักเรียน/ครู"
                        type="text"
                        required
                    />
                    <Input
                        disabled={pending}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="อีเมล์"
                        type="email"
                        required
                    />
                    <Input
                        disabled={pending}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="รหัสผ่าน"
                        type="password"
                        required
                    />
                    <Input
                        disabled={pending}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="ยืนยันรหัสผ่าน"
                        type="password"
                        required
                    />
                    <Button
                        disabled={pending}
                        type="submit"
                        size={"lg"}
                        className="cursor-pointer w-full"
                    >
                        สมัครสมาชิก
                    </Button>
                </form>
                <Separator />
                <p className="text-xs text-muted-foreground">
                    คุณมีบัญชีอยู่แล้ว?&nbsp;
                    <span
                        onClick={() => setState("signIn")}
                        className="text-primary hover:underline cursor-pointer">ลงชื่อเข้าใช้</span>
                </p>
            </CardContent>
        </Card>
    )
}