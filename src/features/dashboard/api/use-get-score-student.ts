import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
 

interface UseGetScoreStudentProps{
    classroomId: Id<"classrooms">;
};


export const useGetScoreStudent = ({classroomId}:UseGetScoreStudentProps) => {

    const data = useQuery(api.dashboard.getScore,{classroomId});
    const isLoading = data === undefined;

    return {data , isLoading}
};



