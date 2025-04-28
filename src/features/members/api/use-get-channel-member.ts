import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetMemberProps {
    id: Id<"channelMembers">;
};
 


export const useGetChannelMember = ({ id }: UseGetMemberProps) => {
    const data = useQuery(api.members.getByIdChannelMember, { id });
    const isLoading = data === undefined;

    return { data, isLoading };
}