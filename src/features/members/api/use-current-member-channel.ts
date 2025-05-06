import { useQuery } from "convex/react"; 
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

interface UseCurrentMemberProps {
    channelId: Id<"channels">; 
};

export const useCurrentMemberChannel = ({ channelId }: UseCurrentMemberProps) => {
    const data = useQuery(api.members.isMemberInChannel, { channelId });
    const isLoading = data === undefined;

    return { data, isLoading };
}