import { useQuery } from "convex/react"; 
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

interface UseCurrentMemberProps {
    classroomId: Id<"classrooms">;
};

export const useCurrentMember = ({ classroomId }: UseCurrentMemberProps) => {
    const data = useQuery(api.members.current, { classroomId });
    const isLoading = data === undefined;

    return { data, isLoading };
}

interface UseCurrentChannelMemberProps {
    channelId: Id<"channels">;
};

export const useCurrentChannelMember = ({ channelId }: UseCurrentChannelMemberProps) => {
    const data = useQuery(api.members.currentChannel, { channelId });
    const isLoading = data === undefined;

    return { data, isLoading };
}