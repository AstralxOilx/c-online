import { useQuery } from "convex/react"; 
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

interface UseCurrentMemberProps {
    classroomId: Id<"classrooms">; 
};

export const useCurrentMemberClassroom = ({ classroomId }: UseCurrentMemberProps) => {
    const data = useQuery(api.members.isMemberInClassroom, { classroomId });
    const isLoading = data === undefined;

    return { data, isLoading };
}