import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";


const populateUser = (ctx: QueryCtx, id: Id<"users">) => {
    return ctx.db.get(id);
}

export const addChannelMember = mutation({
    args: {
        channelId: v.id("channels"),
        userId: v.id("users"),
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

        if (user.role !== "teacher") {
            throw new Error("Forbidden");
        }

        const channel = await ctx.db.get(args.channelId);

        if (!channel) throw new Error("ไม่พบ Channel นี้");

        await ctx.db.insert("channelMembers", {
            channelId: args.channelId,
            userId: args.userId,
            status: "active",
        });
        // return channelMember;
    }
});

export const getAvailableMembers = query({
    args: {
        classroomId: v.id("classrooms"),
        channelId: v.id("channels"),
    },
    handler: async (ctx, args) => {
        // ดึงสมาชิกทั้งหมดในคลาสนี้
        const classroomMembers = await ctx.db
            .query("classroomMembers")
            .withIndex("by_classroom_id", (q) => q.eq("classroomId", args.classroomId))
            .collect();

        // ดึงสมาชิกทั้งหมดในแชนแนลนี้
        const channelMembers = await ctx.db
            .query("channelMembers")
            .withIndex("by_channel_id", (q) => q.eq("channelId", args.channelId))
            .collect();

        // Set ของ userId ที่อยู่ใน channelMembers
        const channelMemberUserIds = new Set(channelMembers.map((cm) => cm.userId));

        // Filter เฉพาะคนที่ยังไม่ได้อยู่ใน channelMembers
        const availableMembers = classroomMembers.filter(
            (member) => !channelMemberUserIds.has(member.userId)
        );

        // ดึงข้อมูล user ของ availableMembers ทีละคน
        const result = await Promise.all(
            availableMembers.map(async (member) => {
                const user = await populateUser(ctx, member.userId);
                return {
                    ...member,
                    user, // แนบข้อมูล user เข้าไป
                };
            })
        );

        return result;
    },
});

export const getById = query({
    args: { id: v.id("classroomMembers") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const member = await ctx.db.get(args.id);

        if (!member) {
            return null;
        }

        const currentMember = await ctx.db
            .query("classroomMembers")
            .withIndex("by_classroom_id_user_id", (q) =>
                q.eq("classroomId", member.classroomId).eq("userId", userId),
            );

        if (!currentMember) {
            return null;
        }

        const user = await populateUser(ctx, member.userId);

        if (!user) {
            return null;
        }

        return {
            ...member,
            user,
        }
    }
})


export const getByIdChannelMember = query({
    args: { id: v.id("channelMembers") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const member = await ctx.db.get(args.id);

        if (!member) {
            throw new Error("Member not found");
        }

        const currentMember = await ctx.db
            .query("channelMembers")
            .withIndex("by_user_id", (q) =>
                q.eq("userId", userId),
            );

        if (!currentMember) {
            throw new Error("User not found in the channel");
        }

        const user = await populateUser(ctx, member.userId);

        if (!user) {
            throw new Error("User data not found");
        }

        return {
            ...member,
            user,
        };
    },
});

export const getChannelMember = query({
    args: { channelId: v.id("channels") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            return []
        }

        const member = await ctx.db
            .query("channelMembers")
            .withIndex("by_user_id_channel_id", (q) => q.eq("userId", userId).eq("channelId", args.channelId))
            .unique();

        if (!member) {
            return [];
        }

        const data = await ctx.db
            .query("channelMembers")
            .withIndex("by_channel_id", (q) => q.eq("channelId", args.channelId))
            .collect();

        const members = [];

        for (const member of data) {
            const user = await populateUser(ctx, member.userId);

            if (user) {
                members.push({
                    ...member,
                    user,
                });
            }

        }
        return members;
    },
});

export const get = query({
    args: { classroomId: v.id("classrooms") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            return []
        }

        const member = await ctx.db
            .query("classroomMembers")
            .withIndex("by_classroom_id_user_id", (q) => q.eq("classroomId", args.classroomId).eq("userId", userId))
            .unique();

        if (!member) {
            return [];
        }

        const data = await ctx.db
            .query("classroomMembers")
            .withIndex("by_classroom_id", (q) => q.eq("classroomId", args.classroomId))
            .collect();

        const members = [];

        for (const member of data) {
            const user = await populateUser(ctx, member.userId);

            if (user) {
                members.push({
                    ...member,
                    user,
                });
            }

        }

        return members;
    },
});


export const current = query({
    args: { classroomId: v.id("classrooms") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            return null
        }


        const member = await ctx.db
            .query("classroomMembers")
            .withIndex("by_classroom_id_user_id", (q) => q.eq("classroomId", args.classroomId).eq("userId", userId))
            .unique();

        if (!member) {
            return null;
        }

        return member;
    },
});

export const currentChannel = query({
    args: { channelId: v.id("channels") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            return null
        }


        const member = await ctx.db
            .query("channelMembers")
            .withIndex("by_user_id_channel_id", (q) => q.eq("userId", userId).eq("channelId", args.channelId))
            .unique();

        if (!member) {
            return null;
        }

        return member;
    },
});


// export const update = mutation({
//     args: {
//         id: v.id("classroomMembers"),
//         role: v.union(v.literal("teacher"), v.literal("student")),
//     },

//     handler: async (ctx, args) => {
//         const userId = await auth.getUserId(ctx);

//         if (!userId) {
//             throw new Error("Unauthorized");
//         }

//         const member = await ctx.db.get(args.id);

//         if (!member) {
//             throw new Error("ไม่พบข้อมูลผู้ใช้!");
//         }

//         const currentMember = await ctx.db
//             .query("members")
//             .withIndex("by_workspace_id_user_id", (q) =>
//                 q.eq("workspaceId", member.workspaceId).eq("userId", userId),
//             )
//             .unique();


//         if (!currentMember || currentMember.role !== "teacher") {
//             throw new Error("Unauthorized");
//         }

//         await ctx.db.patch(args.id, {
//             role: args.role,
//         });

//         return args.id;

//     }
// });


export const removeChannelMember = mutation({
    args: {
        id: v.id("channelMembers"),
    },

    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const member = await ctx.db.get(args.id);

        if (!member) {
            throw new Error("ไม่พบข้อมูลผู้ใช้!");
        }

        const currentMember = await ctx.db
            .query("channelMembers")
            .withIndex("by_user_id_channel_id", (q) =>
                q.eq("userId", userId).eq("channelId", member.channelId),
            )
            .unique();


        if (!currentMember) {
            throw new Error("Unauthorized");
        }

        if (member.status === "owner") {
            throw new Error("ไม่สามารถลบตัวตนออกได้หากตัวตนนั้นเป็นผู้สร้าง!");
        }



        await ctx.db.delete(args.id);

        return args.id;

    }
});

export const remove = mutation({
    args: {
        id: v.id("classroomMembers"),
    },

    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const member = await ctx.db.get(args.id);

        if (!member) {
            throw new Error("ไม่พบข้อมูลผู้ใช้!");
        }

        const currentMember = await ctx.db
            .query("classroomMembers")
            .withIndex("by_classroom_id_user_id", (q) =>
                q.eq("classroomId", member.classroomId).eq("userId", userId),
            )
            .unique();

        if (!currentMember) {
            throw new Error("Unauthorized");
        }

        if (member.status === "owner") {
            throw new Error("ไม่สามารถลบตัวตนออกได้หากตัวตนนั้นเป็นผู้สร้าง!");
        }

        // ลบ memberChannel ที่เกี่ยวข้อง
        const memberChannels = await ctx.db
            .query("channelMembers")
            .withIndex("by_user_id", (q) => q.eq("userId", member.userId))
            .collect();

        for (const channelMember of memberChannels) {
            await ctx.db.delete(channelMember._id);
        }

        // ลบ classroomMember
        await ctx.db.delete(args.id);

        return args.id;
    },
});


export const getClassroomMember = query({
    args: { classroomId: v.id("classrooms") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            return []
        }

        const statuses: ("owner" | "active")[] = ["active", "owner"];


        const allData = await Promise.all(
            statuses.map((status) =>
                ctx.db
                    .query("classroomMembers")
                    .withIndex("by_classroom_id_status", (q) =>
                        q.eq("classroomId", args.classroomId).eq("status", status)
                    )
                    .collect()
            )
        );

        // รวมสมาชิกทั้งสองกลุ่ม
        const data = allData.flat();

        const members = (
            await Promise.all(
                data.map(async (member) => {
                    const user = await populateUser(ctx, member.userId);
                    if (user) {
                        return { ...member, user };
                    }
                    return null;
                })
            )
        ).filter(Boolean); // ตัดสมาชิกที่ไม่เจอ user

        return members;
    },
});
