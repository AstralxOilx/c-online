import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
 

interface UseGetScoreAssignmentProps{
    classroomId: Id<"classrooms">;
};


export const useGetScoreAssignment = ({classroomId}:UseGetScoreAssignmentProps) => {

    const data = useQuery(api.assignments.getClassroomAssignmentsScores,{classroomId});
    const isLoading = data === undefined;

    return {data , isLoading}
};



