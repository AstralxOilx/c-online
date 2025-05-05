import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
 

interface UseGetTeacherDashboardDataProps{
    classroomId: Id<"classrooms">;
};


export const useGetTeacherDashboardData  = ({classroomId}:UseGetTeacherDashboardDataProps) => {

    const data = useQuery(api.dashboard.getClassroomOverviewForTeacher,{classroomId});
    const isLoading = data === undefined;

    return {data , isLoading}
};



