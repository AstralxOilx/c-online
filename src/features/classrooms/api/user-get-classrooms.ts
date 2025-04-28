import { useQuery } from "convex/react"; 
import { api } from "../../../../convex/_generated/api";
 

export const useGetClassrooms  = () => {
    const data = useQuery(api.classrooms.get);
    const isLoading = data === undefined;

    return {data ,isLoading};
};


