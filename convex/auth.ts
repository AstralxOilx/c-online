import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";
import { ConvexError } from "convex/values";
import { z } from "zod";

const ParamsSchema = z.object({
  email: z.string().email(),
});

type Role = "student" | "teacher" | "admin"; 

const CustomPassword = Password<DataModel>({
  validatePasswordRequirements: (password: string) => {
    if (
      password.length < 6
    ) {
      throw new ConvexError("รหัสผ่านไม่ถูก รูปแบบ");
    }
  },
  profile(params) {
    const { error, data } = ParamsSchema.safeParse(params);
    if (error) {
      throw new ConvexError(error.format());
    }
    return {
      fname: params.fname as string,
      lname: params.lname as string,
      role: (params.role as Role) ?? "student",
      identificationCode: params.identificationCode as string,
      email: data.email, 
    };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [CustomPassword],
});
