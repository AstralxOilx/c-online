import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
 

interface UseGetAssignPrivateProps{
    classroomId: Id<"classrooms">;
};


export const useGetAssignmentPublic = ({classroomId}:UseGetAssignPrivateProps) => {

    const data = useQuery(api.assignments.getPublic,{classroomId});
    const isLoading = data === undefined;

    return {data , isLoading}
};



