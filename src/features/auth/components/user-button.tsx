"use client";


import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "../api/use-current-user";
import { Code, GitCommitHorizontal, LoaderCircle, LogOut, Mail, User } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

export const UserButton = () => {

    const { data, isLoading } = useCurrentUser();
    const { signOut } = useAuthActions();

    if (isLoading) {
        return <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
    }

    if (!data) {
        return null;
    }

    const { image, fname, lname, role, identificationCode, email } = data;

    const avatarFallback = fname!.charAt(0).toLocaleUpperCase();


    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger className="outline-none relative ">
                    <Avatar className="size-10 hover:opacity-75 transition rounded-md">
                        <AvatarImage alt={"profile"} src={image} />
                        <AvatarFallback className="rounded-md"> {avatarFallback}</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" side="right" className="w-60">
                    <DropdownMenuLabel className="px-2 py-1 text-sm flex gap-1 items-center">
                        <Mail className="size-4 mr-2 text-sm text-muted-foreground" />
                        <span className="text-sm text-muted-foreground"> {email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuLabel className="px-2 py-1 text-sm flex gap-1 items-center">
                        <GitCommitHorizontal className="size-4 mr-2 text-sm text-muted-foreground"/>
                        {
                            role === "admin" ? <span className="text-sm text-muted-foreground">แอดมิน</span>
                                : role === "student" ? <span className="text-sm text-muted-foreground">นักเรียน/นักศึกษา</span>
                                    : role === "teacher" ? <span className="text-sm text-muted-foreground">ครู/อาจารย์</span>
                                        : <span className="text-xs text-muted-foreground">---</span>
                        }
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="px-2 py-1 text-sm flex gap-1 items-center">
                        <User className="size-4 mr-2 text-sm text-muted-foreground" />
                        <span className="text-sm text-muted-foreground"> {fname}&nbsp;{lname}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuLabel className="px-2 py-1 text-sm flex gap-1 items-center">
                        <Code className="size-4 mr-2 text-sm text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{identificationCode}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="h-10 cursor-pointer">
                        <LogOut className="size-4 mr-2" />
                        <span>ออกจากระบบ</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

