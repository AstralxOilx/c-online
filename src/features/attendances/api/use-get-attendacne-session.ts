import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
 

interface UseGetAttendanceSessionProps{
    classroomId: Id<"classrooms">;
};


export const useGetAttendanceSession = ({classroomId}:UseGetAttendanceSessionProps) => {

    const data = useQuery(api.attendance.getActiveSession,{classroomId});
    const isLoading = data === undefined;

    return {data , isLoading}
};



