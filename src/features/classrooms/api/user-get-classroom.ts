import { useQuery } from "convex/react"; 
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

 

interface UseGetClassroomProps {
    id: Id<"classrooms">;
};

export const useGetClassroom = ({id}:UseGetClassroomProps) => {
    const data = useQuery(api.classrooms.getById,{id});
    const isLoading = data === undefined;

    return {data ,isLoading};
};


