import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";


const generateUniqueCode = async (ctx: any): Promise<string> => {
    let code = "";
    let isDuplicate = true;

    while (isDuplicate) {
        code = Array.from(
            { length: 6 },
            () =>
                "0123456789abcdefghijklmnoporstuvwxyz"[
                Math.floor(Math.random() * 36)
                ]
        ).join("");
        const existing = await ctx.db
            .query("classrooms")
            .withIndex("by_join_code", (q: Record<string, any>) => q.eq("joinCode", code))
            .unique();



        isDuplicate = !!existing;
    }

    return code;
};


export const getInfoById = query({
    args: { id: v.id("classrooms") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const member = await ctx.db
            .query("classroomMembers")
            .withIndex("by_classroom_id_user_id", (q) => q.eq("classroomId", args.id).eq("userId", userId),)
            .unique();

        const workspace = await ctx.db.get(args.id);

        return {
            name: workspace?.name,
            isMember: !!member,
        }

    }
})

export const joinLink = mutation({
    args: {
        joinCode: v.string(),
        classroomId: v.id("classrooms"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }


        const classroom = await ctx.db.get(args.classroomId);

        if (!classroom) {
            throw new Error("ไม่พบห้องเรียนนี้!");
        }

        if (classroom.joinCode !== args.joinCode.toLowerCase()) {
            throw new Error("รหัสเข้าร่วมไม่ถูกต้อง!");
        }

        const existingMember = await ctx.db
            .query("classroomMembers")
            .withIndex("by_classroom_id_user_id", (q) => q.eq("classroomId", args.classroomId).eq("userId", userId))
            .unique();

        if (existingMember) {
            throw new Error("เป็นสมาชิกที่ในห้องนี้อยู่แล้ว!");
        }

        await ctx.db.insert("classroomMembers", {
            userId,
            classroomId: classroom._id,
            status: "active",

        });

        const generalChannel = await ctx.db.query("channels")
            .withIndex("by_classroom_id_general", (q) =>
                q.eq("classroomId", args.classroomId).eq("general", true)
            )
            .unique();

        // ถ้ามี general channel ค่อย insert
        if (generalChannel) {
            await ctx.db.insert("channelMembers", {
                userId,
                channelId: generalChannel._id,
                status: "active",
            });
        }


        return classroom._id;

    }
});

export const joinCode = mutation({
    args: {
        joinCode: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        // 1. ตรวจสอบ join code และค้นหา classroom ที่ตรงกัน
        const classroom = await ctx.db
            .query("classrooms")
            .withIndex("by_join_code", (q) => q.eq("joinCode", args.joinCode))
            .unique();

        if (!classroom) {
            throw new Error("รหัสเข้าร่วมไม่ถูกต้อง");
        }

        // 2. ตรวจสอบว่าผู้ใช้เป็นสมาชิกอยู่แล้วหรือไม่
        const existingMember = await ctx.db
            .query("classroomMembers")
            .withIndex("by_classroom_id_user_id", (q) =>
                q.eq("classroomId", classroom._id).eq("userId", userId)
            )
            .unique();

        if (existingMember) {
            throw new Error("คุณเป็นสมาชิกของห้องนี้อยู่แล้ว");
        }

        // 3. เพิ่มผู้ใช้เข้าเป็นสมาชิกของ classroom
        await ctx.db.insert("classroomMembers", {
            userId,
            classroomId: classroom._id,
            status: "active",
        });

        // 4. เพิ่มผู้ใช้เข้าเป็นสมาชิกของ general channel (ถ้ามี)
        const generalChannel = await ctx.db
            .query("channels")
            .withIndex("by_classroom_id_general", (q) =>
                q.eq("classroomId", classroom._id).eq("general", true)
            )
            .unique();

        if (generalChannel) {
            await ctx.db.insert("channelMembers", {
                userId,
                channelId: generalChannel._id,
                status: "active",
            });
        }

        // 5. คืนค่า classroomId
        return classroom._id;
    },
});



export const newJoinCode = mutation({
    args: {
        classroomId: v.id("classrooms"),
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

        const joinCode = await generateUniqueCode(ctx);

        await ctx.db.patch(args.classroomId, {
            joinCode,
        });

        return args.classroomId;
    }
});

export const crate = mutation({
    args: {
        name: v.string(),
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

        const joinCode = await generateUniqueCode(ctx);

        const classroomId = await ctx.db.insert("classrooms", {
            name: args.name,
            userId,
            joinCode,
        });

        const memberId = await ctx.db.insert('classroomMembers', {
            userId,
            classroomId,
            status: "owner"
        });


        const channelId = await ctx.db.insert("channels", {
            name: "general",
            classroomId,
            general: true,
        });

        const channelMember = await ctx.db.insert("channelMembers", {
            userId,
            channelId,
            status: "owner",
        });

        return classroomId;
    }
});

export const update = mutation({
    args: {
        id: v.id("classrooms"),
        name: v.string(),
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


        await ctx.db.patch(args.id, {
            name: args.name,
        });

        return args.id;
    }
});

export const remove = mutation({
    args: {
        id: v.id("classrooms"),
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

        // , conversations, messages, reactions
        const [classroomMembers, channels] = await Promise.all([
            ctx.db
                .query("classroomMembers")
                .withIndex("by_classroom_id", (q) => q.eq("classroomId", args.id))
                .collect(),
            ctx.db
                .query("channels")
                .withIndex("by_classroom_id", (q) => q.eq("classroomId", args.id))
                .collect(),

            // ctx.db
            //     .query("conversations")
            //     .withIndex("by_classroom_id", (q) => q.eq("classroomId", args.id))
            //     .collect(),
            // ctx.db
            //     .query("messages")
            //     .withIndex("by_classroom_id", (q) => q.eq("classroomId", args.id))
            //     .collect(),
            // ctx.db
            //     .query("reactions")
            //     .withIndex("by_classroom_id", (q) => q.eq("classroomId", args.id))
            //     .collect(),
        ]);

        for (const member of classroomMembers) {
            await ctx.db.delete(member._id)
        }

        for (const channel of channels) {
            try {
                await ctx.db.delete(channel._id);
            } catch (e) {
                console.error(`Failed to delete channel ${channel._id}:`, e);
            }

            const members = await ctx.db
                .query("channelMembers")
                .withIndex("by_channel_id", (q) => q.eq("channelId", channel._id))
                .collect();

            await Promise.all(members.map(async (member) => {
                try {
                    await ctx.db.delete(member._id);
                } catch (e) {
                    console.error(`Failed to delete member ${member._id}:`, e);
                }
            }));
        }




        // for (const conversation of conversations) {
        //     await ctx.db.delete(conversation._id)
        // }

        // for (const message of messages) {
        //     await ctx.db.delete(message._id)
        // }

        // for (const reaction of reactions) {
        //     await ctx.db.delete(reaction._id)
        // }


        await ctx.db.delete(args.id);

        return args.id;
    }
});

export const getById = query({
    args: { id: v.id("classrooms") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized")
        }

        const member = await ctx.db
            .query("classroomMembers")
            .withIndex("by_classroom_id_user_id", (q) => q.eq("classroomId", args.id).eq("userId", userId),)
            .unique();

        if (!member) return null;

        return await ctx.db.get(args.id);
    },
});

export const get = query({
    args: {},
    handler: async (ctx) => {
      const userId = await getAuthUserId(ctx);
  
      if (!userId) {
        return [];
      }
  
      const members = await ctx.db
        .query("classroomMembers")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .collect();
  
      const classroomsWithOwner = [];
  
      for (const member of members) {
        const classroom = await ctx.db.get(member.classroomId);
  
        if (classroom) {
          const owner = await ctx.db.get(classroom.userId);
  
          classroomsWithOwner.push({
            ...classroom,
            owner: owner
              ? {
                  id: owner._id,
                  name: `${owner.fname} ${owner.lname}`,
                  email: owner.email,
                }
              : null,
            memberStatus: member.status, // เพิ่มสถานะของสมาชิก
            memberCreatedAt: member._creationTime, // เพิ่มเวลาที่เข้าร่วมห้อง
          });
        }
      }
  
      // เรียงจากการเข้าร่วมล่าสุด (โดยใช้ memberCreatedAt)
      return classroomsWithOwner.sort(
        (a, b) => new Date(b.memberCreatedAt).getTime() - new Date(a.memberCreatedAt).getTime()
      );
    },
  });
  