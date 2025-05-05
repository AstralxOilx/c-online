import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// export const current = query({
//     args: {},
//     handler: async (ctx) => {
//         const userId = await  getAuthUserId(ctx);

//         if (userId === null) {
//             return null;
//         }

//         return await ctx.db.get(userId);
//     },
// });
export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูลรวมถึง image
    const user = await ctx.db.get(userId);

    // ถ้ามี field image ในฐานข้อมูลให้ดึงออกมา
    if (user && user.image) {
      return {
        ...user,
        image: user.image
                ? await ctx.storage.getUrl(user.image)
                : undefined,
      };
    }

    return user;
  },
});


export const update = mutation({
  args: {
    id: v.id("users"),
    fname: v.optional(v.string()),
    lname: v.optional(v.string()),
    identificationCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }



    await ctx.db.patch(args.id, {
      fname: args.fname,
      lname: args.lname,
      identificationCode: args.identificationCode,
    });

    return args.id;

  }
});


export const updateImageProfile = mutation({
  args: {
    id: v.id("users"),
    image: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const user = await ctx.db.get(args.id);

    if (!user) {
      throw new Error("User not found");
    }

    // ถ้ามีรูปเดิม และมีการส่งรูปใหม่เข้ามาให้ลบ
    if (user.image && args.image && user.image !== args.image) {
      await ctx.storage.delete(user.image);
    }

    // อัปเดตรูปใหม่ในฟิลด์ image
    await ctx.db.patch(args.id, {
      image: args.image, // ไม่ต้องใส่ null, แค่ undefined ก็พอ
    });

    return {
      success: true,
      message: "Profile image updated successfully",
    };
  },
});
