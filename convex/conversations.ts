import { v } from "convex/values";
import { mutation } from "./_generated/server"; 
import { getAuthUserId } from "@convex-dev/auth/server";

export const createOrGet = mutation({
    args: {
        memberId: v.id("channelMembers"),
        channelId: v.id("channels"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const currentMember = await ctx.db
            .query("channelMembers")
            .withIndex("by_user_id_channel_id", (q) => q.eq("userId", userId).eq("channelId", args.channelId),)
            .unique();

        const otherMember = await ctx.db.get(args.memberId);

        if (!currentMember || !otherMember) {
            throw new Error("ไม่พบข้อมูลผู้ใช้นี้!");
        }

        const existingConversation = await ctx.db
            .query("conversations")
            .filter((q) => q.eq(q.field("channelId"), args.channelId))
            .filter((q) =>
                q.or(
                    q.and(
                        q.eq(q.field("menubarOneId"), currentMember._id),
                        q.eq(q.field("menubarTwoId"), otherMember._id),
                    ),
                    q.and(
                        q.eq(q.field("menubarOneId"), otherMember._id),
                        q.eq(q.field("menubarTwoId"), currentMember._id),
                    )
                )
            )
            .unique();

        if (existingConversation) {
            return existingConversation._id;
        }

        const conversationId = await ctx.db.insert("conversations", {
            channelId: args.channelId,
            menubarOneId: currentMember._id,
            menubarTwoId: otherMember._id,
        });

        // const conversation = await ctx.db.get(conversationId);

        // if(!conversation){
        //     throw new Error("ไม่พบ Conversation!");
        // }

        return conversationId;

    }
})