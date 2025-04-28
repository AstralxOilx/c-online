import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";


export const create = mutation({
    args: {
        name: v.string(),
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


        const parsedName = args.name
            .replace(/\s+/g, "-")
            .toLowerCase();


        const channelId = await ctx.db.insert("channels", {
            name: parsedName,
            classroomId: args.classroomId,
            general: false,
        });

        await ctx.db.insert("channelMembers", {
            userId,
            channelId,
            status: "owner",
        });

        return channelId;

    }
});

export const update = mutation({
    args: {
        id: v.id("channels"),
        name: v.string()
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

        const channel = await ctx.db.get(args.id);

        if (!channel) throw new Error("ไม่พบ Channel นี้")


        await ctx.db.patch(args.id, {
            name: args.name,
        });

        return args.id;

    }
});

export const remove = mutation({
    args: {
        id: v.id("channels"),
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

        const channelMember = await ctx.db.query("channelMembers")
            .withIndex("by_user_id_channel_id", (q) => q.eq("userId", userId).eq("channelId", args.id))
            .unique()

        if (channelMember?.status !== "owner") {
            throw new Error("Unauthorized");
        }

        const channel = await ctx.db.get(args.id);
        if (!channel) throw new Error("Channel not found")

        const [channelMembers] = await Promise.all([
            ctx.db
                .query("channelMembers")
                .withIndex("by_channel_id", (q) => q.eq("channelId", args.id))
                .collect(),
        ])

        for (const member of channelMembers) {
            await ctx.db.delete(member._id);
        }

        const [messages] = await Promise.all([
            ctx.db
            .query("messages")
            .withIndex("by_channel_id" , (q) => q.eq("channelId",args.id))
            .collect(),
        ])

        for (const message of messages) {
            await ctx.db.delete(message._id);
        }


        if (channel.general !== true) {
            await ctx.db.delete(args.id);
        } else {
            throw new Error("ไม่สามารถลบ general channel ได้");
        }



        return args.id;
    }
});

export const getById = query({
    args: {
        id: v.id("channels"),
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

        const existingMembership = await ctx.db.query("channelMembers")
            .withIndex("by_user_id_channel_id", (q) =>
                q.eq("userId", userId).eq("channelId", args.id)
            )
            .unique();

         if(!existingMembership){
            return null
         }   
        const channel = await ctx.db.get(args.id);

        if (!channel) {
            return null;
        }

        return channel;
    }
})


export const get = query({
    args: {
        classroomId: v.id("classrooms"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            return [];
        }

        const user = await ctx.db.get(userId);

        if (!user) {
            throw new Error("User not found");
        }

        const channelMembers = await ctx.db
            .query("channelMembers")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .collect();

        if (channelMembers.length === 0) {
            return [];
        }

        // 2. ดึง channelId ทั้งหมดที่ user อยู่
        const channelIds = channelMembers.map((m) => m.channelId);

        // 3. ดึงข้อมูล channels ที่ตรงกับ channelIds
        const channels = await Promise.all(
            channelIds.map(async (id) => await ctx.db.get(id))
        );

        // 4. กรองเอาเฉพาะ channel ที่ belong กับ classroomId ที่กำหนด
        const filteredChannels = channels.filter(
            (channel) => channel && channel.classroomId === args.classroomId
        );

        return filteredChannels;

    }
})