import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SignInFlow } from "../types";
import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

interface SignInCardProps {
    setState: (state: SignInFlow) => void;
}

export const SignInCard = ({ setState }: SignInCardProps) => {

    const { signIn } = useAuthActions();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');

    const onPasswordSignIn = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPending(true);
        signIn("password", { email, password, flow: "signIn" })
            .catch(() => {
                setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
            })
            .finally(() => {
                setPending(false);
            })
    }


    return (
        <Card className="w-full h-full p-8 ">
            <CardHeader className="px-0 pt-0">
                <CardTitle>เข้าสู่ระบบเพื่อดำเนินการต่อ</CardTitle>
                <CardDescription>
                    ใช้อีเมลของคุณหรือบริการอื่นเพื่อดำเนินการต่อ
                </CardDescription>
            </CardHeader>
            {!!error && (
                <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-destructive mb-6">
                    <TriangleAlert className="size-4" />
                    <p>{error}</p>
                </div>
            )}
            <CardContent className="space-y-5 px-0 pb-0">
                <form onSubmit={onPasswordSignIn} className="space-y-3 grid gap-2">
                    <Input
                        disabled={pending}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="อีเมล"
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
                    <Button
                        disabled={pending}
                        type="submit"
                        size={"lg"}
                        className="cursor-pointer w-full"
                    >
                        ลงชื่อเข้าใช้
                    </Button>
                </form>
                <Separator />
                <div className="flex flex-col gap-y-3">
                </div>
                <p className="text-xs text-muted-foreground">
                    คุณยังไม่มีบัญชี?&nbsp;
                    <span
                        onClick={() => setState("signUp")}
                        className="text-primary hover:underline  cursor-pointer ">สมัครสมาชิก</span>
                </p>

            </CardContent>
        </Card>
    )
}