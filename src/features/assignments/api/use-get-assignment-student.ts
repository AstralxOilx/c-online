import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
 

interface UseGetAssignmentProps{
    classroomId: Id<"classrooms">; 
};


export const useGetAssignmentStatusStudent = ({classroomId}:UseGetAssignmentProps) => {

    const data = useQuery(api.assignments.getStudentAssignments,{classroomId});
    const isLoading = data === undefined;

    return {data , isLoading}
};



