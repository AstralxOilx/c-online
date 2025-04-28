import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
 

interface UseGetAttendanceForClassroomProps{
    classroomId: Id<"classrooms">;
};


export const useGetAttendanceForClassroom = ({classroomId}:UseGetAttendanceForClassroomProps) => {

    const data = useQuery(api.attendance.getAttendanceForClassroom,{classroomId});
    const isLoading = data === undefined;

    return {data , isLoading}
};



