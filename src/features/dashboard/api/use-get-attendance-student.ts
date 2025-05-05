import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
 

interface UseGetAttendanceStudentProps{
    classroomId: Id<"classrooms">;
};


export const useGetAttendanceStudentProps = ({classroomId}:UseGetAttendanceStudentProps) => {

    const data = useQuery(api.dashboard.getAttendanceStatus,{classroomId});
    const isLoading = data === undefined;

    return {data , isLoading}
};



