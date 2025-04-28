import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const getChannelMember = async (ctx: QueryCtx, channelId: Id<"channels">, userId: Id<"users">) => {
    return ctx.db
        .query("channelMembers")
        .withIndex("by_user_id_channel_id", (q) => q.eq("userId", userId).eq("channelId", channelId))
        .unique();
}

export const toggle = mutation({
    args: {
        messageId: v.id("messages"),
        value: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const message = await ctx.db.get(args.messageId);

        if (!message) {
            throw new Error("ไม่พบข้อความนี้!");
        }

        const member = await getChannelMember(ctx, message.channelId, userId);

        if (!member) {
            throw new Error("Unauthorized");
        }

        const existingMessageReactionFromUser = await ctx.db
            .query("reactions")
            .filter((q) =>
                q.and(
                    q.eq(q.field("messageId"), args.messageId),
                    q.eq(q.field("channelMemberId"), member._id),
                    q.eq(q.field("value"), args.value),

                )
            )
            .first();

        if (existingMessageReactionFromUser) {
            await ctx.db.delete(existingMessageReactionFromUser._id);
            return existingMessageReactionFromUser._id;
        } else {
            const newReactionId = await ctx.db.insert("reactions", {
                value: args.value,
                channelMemberId: member._id,
                messageId: message._id,
                classroomId: message.classroomId
            });

            return newReactionId;
        }

    },
})