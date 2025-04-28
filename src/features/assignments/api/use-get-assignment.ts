import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
 

interface UseGetAssignmentProps{
    id: Id<"assignments">;
};


export const useGetAssignment = ({id}:UseGetAssignmentProps) => {

    const data = useQuery(api.assignments.getById,{id});
    const isLoading = data === undefined;

    return {data , isLoading}
};



