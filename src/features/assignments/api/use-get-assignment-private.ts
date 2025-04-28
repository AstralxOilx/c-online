import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
 

interface UseGetAssignPrivateProps{
    classroomId: Id<"classrooms">;
};


export const useGetAssignmentPrivate = ({classroomId}:UseGetAssignPrivateProps) => {

    const data = useQuery(api.assignments.getPrivate,{classroomId});
    const isLoading = data === undefined;

    return {data , isLoading}
};



