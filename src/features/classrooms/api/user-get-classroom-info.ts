import { useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

 

interface UseGetClassroomInfoProps {
    id: Id<"classrooms">;

};

export const useGetClassroomInfo = ({ id }: UseGetClassroomInfoProps) => {
    const data = useQuery(api.classrooms.getInfoById, { id });
    const isLoading = data === undefined;

    return { data, isLoading };
};


