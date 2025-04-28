import { useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

interface UseAvailableMembersProps {
    classroomId: Id<"classrooms">;
    channelId: Id<"channels">;
};

export const useGetAvailableMembers = ({ classroomId, channelId }: UseAvailableMembersProps) => {
    const data = useQuery(api.members.getAvailableMembers, { classroomId, channelId });
    const isLoading = data === undefined;

    return { data, isLoading };
}
