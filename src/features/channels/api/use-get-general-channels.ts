import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

 

interface UseGetChannelsProps{
    classroomId: Id<"classrooms">;
};


export const useGetGeneralChannel = ({classroomId}:UseGetChannelsProps) => {

    const data = useQuery(api.channels.getGeneralChannel,{classroomId});
    const isLoading = data === undefined;

    return {data , isLoading}
};



