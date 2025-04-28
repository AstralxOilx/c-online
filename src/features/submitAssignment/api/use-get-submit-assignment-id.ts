import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
 

interface UseGetSubmitMemberAssignmentByIdProps{
    submitAssignmentId: Id<"submitAssignments">; 
};


export const useGetSubmitMemberAssignmentById = ({submitAssignmentId}:UseGetSubmitMemberAssignmentByIdProps) => {

    const data = useQuery(api.submitAssignment.getSubmitAssignmentById,{submitAssignmentId});
    const isLoading = data === undefined;

    return {data , isLoading}
};



