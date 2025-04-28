import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";


const populateThread = async (ctx: QueryCtx, messageId: Id<"messages">) => {
    const messages = await ctx.db
        .query("messages")
        .withIndex("by_parent_message_id", (q) => q.eq("parentMessageId", messageId))
        .collect();

    if (messages.length === 0) {
        return {
            count: 0,
            image: undefined,
            timestamp: 0,
            name: "",
        }
    }

    const lastMessage = messages[messages.length - 1];
    const lastMessageMember = await populateMember(ctx, lastMessage.channelMemberId);

    if (!lastMessageMember) {
        return {
            count: messages.length,
            image: undefined,
            timestamp: 0,
        }
    }

    const lastMessageUser = await populateUser(ctx, lastMessageMember.userId);

    return {
        count: messages.length,
        image: lastMessageUser?.image,
        timestamp: lastMessage._creationTime,
        fname: lastMessageUser?.fname,
        lname: lastMessageUser?.lname,
    }


}

const populateReactions = (ctx: QueryCtx, memberId: Id<"messages">) => {
    return ctx.db
        .query("reactions")
        .withIndex("by_message_id", (q) => q.eq("messageId", memberId))
        .collect();
}


const populateUser = (ctx: QueryCtx, userId: Id<"users">) => {
    return ctx.db.get(userId);
}


const populateMember = (ctx: QueryCtx, memberId: Id<"channelMembers">) => {
    return ctx.db.get(memberId);
}



const getClassroomMember = async (ctx: QueryCtx, classroomId: Id<"classrooms">, userId: Id<"users">) => {
    return ctx.db
        .query("classroomMembers")
        .withIndex("by_classroom_id_user_id", (q) => q.eq("classroomId", classroomId).eq("userId", userId))
        .unique();
}

const getChannelMember = async (ctx: QueryCtx, channelId: Id<"channels">, userId: Id<"users">) => {
    return ctx.db
        .query("channelMembers")
        .withIndex("by_user_id_channel_id", (q) => q.eq("userId", userId).eq("channelId", channelId))
        .unique();
}



export const remove = mutation({
    args: {
        id: v.id("messages")
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const message = await ctx.db.get(args.id);

        if (!message) {
            throw new Error("ไม่พบข้อความนี้!");
        }

        const member = await getChannelMember(ctx, message.channelId, userId);

        if (!member || member._id !== message.channelMemberId) {
            throw new Error("Unauthorized");
        }


        if (message.image) {
            await ctx.storage.delete(message.image);
        }

        await ctx.db.delete(args.id);

        return args.id;

    }
})

export const update = mutation({
    args: {
        id: v.id("messages"),
        body: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const message = await ctx.db.get(args.id);

        if (!message) {
            throw new Error("ไม่พบข้อความนี้!");
        }

        const member = await getChannelMember(ctx, message.channelId, userId);

        if (!member || member._id !== message.channelMemberId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.id, {
            body: args.body,
            updatedAt: Date.now(),
        });

        return args.id;

    }
})

export const getById = query({
    args: {
        id: v.id("messages")
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const message = await ctx.db.get(args.id);

        if (!message) {
            return null;
        }

        const currentMember = await getClassroomMember(ctx, message.classroomId, userId);

        if (!currentMember) {
            return null;
        }

        const member = await populateMember(ctx, message.channelMemberId);

        if (!member) {
            return null;
        }

        const user = await populateUser(ctx, member.userId);

        if (!user) {
            return null;
        }

        const reactions = await populateReactions(ctx, message._id);

        const reactionsWithCounts = reactions.map((reaction) => {
            return {
                ...reaction,
                count: reactions.filter((r) => r.value === reaction.value).length,
            };
        });

        const dedupedReactions = reactionsWithCounts.reduce(
            (acc, reaction) => {
                const existingReaction = acc.find(
                    (react) => react.value === reaction.value,

                )
                if (existingReaction) {
                    existingReaction.memberIds = Array.from(
                        new Set([...existingReaction.memberIds, reaction.channelMemberId])
                    )
                } else {
                    acc.push({ ...reaction, memberIds: [reaction.channelMemberId] });
                }

                return acc;
            },
            [] as (Doc<"reactions"> & {
                count: number;
                memberIds: Id<"channelMembers">[];
            })[]
        );

        const reactionsWithoutMemberIdProperty = dedupedReactions.map(
            ({ channelMemberId, ...rest }) => rest,
        );

        return {
            ...message,
            image: message.image
                ? await ctx.storage.getUrl(message.image)
                : undefined,
            user,
            member,
            reactions: reactionsWithoutMemberIdProperty,
        }

    }
})

export const get = query({
    args: {
        channelId: v.id("channels"),
        conversationId: v.optional(v.id("conversations")),
        parentMessageId: v.optional(v.id("messages")),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        let _conversationId = args.conversationId;

        if (!args.conversationId && !args.channelId && args.parentMessageId) {
            const parentMessage = await ctx.db.get(args.parentMessageId);

            if (!parentMessage) {
                throw new Error("ไม่พบข้อความของ Parent message")
            }

            _conversationId = parentMessage.conversationId;
        }

        const results = await ctx.db
            .query("messages")
            .withIndex("by_channel_id_parent_message_id_conversation_id", (q) =>
                q
                    .eq("conversationId", args.conversationId)
                    .eq("channelId", args.channelId)
                    .eq("parentMessageId", args.parentMessageId)
            )
            .order("desc")
            .paginate(args.paginationOpts);


        return {
            ...results,
            page: (
                await Promise.all(
                    results.page.map(async (message) => {
                        const member = await populateMember(ctx, message.channelMemberId);
                        const user = member ? await populateUser(ctx, member.userId) : null;

                        if (!member || !user) {
                            return null;
                        }

                        const reactions = await populateReactions(ctx, message._id);
                        const thread = await populateThread(ctx, message._id);
                        const image = message.image
                            ? await ctx.storage.getUrl(message.image)
                            : undefined;

                        const reactionsWithCounts = reactions.map((reaction) => {
                            return {
                                ...reaction,
                                count: reactions.filter((react) => react.value === reaction.value).length,
                            }
                        });

                        const dedupedReactions = reactionsWithCounts.reduce(
                            (acc, reaction) => {
                                const existingReaction = acc.find(
                                    (react) => react.value === reaction.value,

                                )
                                if (existingReaction) {
                                    existingReaction.memberIds = Array.from(
                                        new Set([...existingReaction.memberIds, reaction.channelMemberId])
                                    )
                                } else {
                                    acc.push({ ...reaction, memberIds: [reaction.channelMemberId] });
                                }

                                return acc;
                            },
                            [] as (Doc<"reactions"> & {
                                count: number;
                                memberIds: Id<"channelMembers">[];
                            })[]
                        );


                        const reactionsWithoutMemberIdProperty = dedupedReactions.map(
                            ({ channelMemberId, ...rest }) => rest,
                        );

                        return {
                            ...message,
                            image,
                            member,
                            user,
                            reactions: reactionsWithoutMemberIdProperty,
                            threadCount: thread.count,
                            threadImage: thread.image,
                            threadName: thread.name,
                            threadTimestamp: thread.timestamp,
                        }
                    })
                )
            ).filter(
                (message): message is NonNullable<typeof message> => message !== null
            )
        }
    }
})

export const create = mutation({
    args: {
        body: v.string(),
        image: v.optional(v.id("_storage")),
        classroomId: v.id("classrooms"),
        channelId: v.id("channels"),
        conversationId: v.optional(v.id("conversations")),
        parentMessageId: v.optional(v.id("messages")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const classroomMember = await getClassroomMember(ctx, args.classroomId, userId);

        if (!classroomMember) {
            throw new Error("Unauthorized");
        }

        const channelMember = await getChannelMember(ctx, args.channelId, userId);

        if (!channelMember) {
            throw new Error("Unauthorized");
        }

        let _conversationId = args.conversationId;

        if (!args.conversationId && !args.channelId && args.parentMessageId) {
            const parentMessage = await ctx.db.get(args.parentMessageId);

            if (!parentMessage) {
                throw new Error("Parent message not fond");
            }

            _conversationId = parentMessage.conversationId;
        }


        const messageId = await ctx.db.insert("messages", {
            channelMemberId: channelMember._id,
            body: args.body,
            image: args.image,
            channelId: args.channelId,
            conversationId: _conversationId,
            classroomId: args.classroomId,
            parentMessageId: args.parentMessageId,
        });

        return messageId;

    },
})