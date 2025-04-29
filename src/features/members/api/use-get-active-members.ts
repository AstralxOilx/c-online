import { useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

interface UseAvailableMembersProps {
    classroomId: Id<"classrooms">; 
};

export const useGetActiveMembers = ({ classroomId }: UseAvailableMembersProps) => {
    const data = useQuery(api.members.getClassroomMember, { classroomId });
    const isLoading = data === undefined;

    return { data, isLoading };
}
