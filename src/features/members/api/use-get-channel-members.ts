import { useQuery } from "convex/react"; 
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetChannelProps {
    channelId: Id<"channels">;
};

export const useGetChannelMembers = ({ channelId }: UseGetChannelProps) => {
    const data = useQuery(api.members.getChannelMember, { channelId });
    const isLoading = data === undefined;

    return { data, isLoading };
}