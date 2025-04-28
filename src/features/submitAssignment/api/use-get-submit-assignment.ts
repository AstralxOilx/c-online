import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
 

interface UseGetSubmitMemberAssignmentProps{
    assignmentId: Id<"assignments">;
};


export const useGetSubmitMemberAssignment = ({assignmentId}:UseGetSubmitMemberAssignmentProps) => {

    const data = useQuery(api.submitAssignment.getSubmitAssignmentForMember,{assignmentId});
    const isLoading = data === undefined;

    return {data , isLoading}
};



